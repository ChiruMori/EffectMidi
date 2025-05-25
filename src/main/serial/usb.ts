import hid from 'node-hid'
import { CmdParser } from './cmds'
import storage from '../storage'
import { logger } from '../logger'

const VENDOR_ID = 0x1209
const PRODUCT_ID = 0x0666

const REPORT_ID = 0x01
const KEY_REPORT_ID = 0x02
// 控制指令的发送缓冲区大小
const BUFFER_SIZE = 4
const KEY_BUFFER_SIZE = 1
let pollingTimer: NodeJS.Timeout | null = null

// 释放设备标记、定时器，通知用户设备断了
const releaseAndNotify = (): void => {
  if (device) {
    closeUsb()
    win?.webContents.send('serial-abort')
  }
}

let device: hid.HIDAsync | null = null
let win: Electron.BrowserWindow | null = null

const connectUsb = async (): Promise<void> => {
  if (device) {
    return
  }
  const devices = hid.devices(VENDOR_ID, PRODUCT_ID)
  // logger.info('Devices:', devices)
  if (devices.length === 0) {
    win?.webContents.send('no-usb')
    return
  }
  const usingPath = await storage.main.getEmbedded()
  if (!usingPath || devices.findIndex((d) => d.path === usingPath) < 0) {
    win?.webContents.send('no-usb')
    return
  }
  device = await hid.HIDAsync.open(usingPath).catch(() => {
    logger.info('HID device closed')
    win?.webContents.send('serial-abort')
    return null
  })
  device?.on('error', (err) => {
    logger.error('HID device error:' + err)
    releaseAndNotify()
  })
  pollingTimer = setInterval(() => {
    if (!device) {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
      return
    }
    // 设备连接时，需要定时检查设备是否已中断
    if (!hasUsb()) {
      logger.info('Device disconnected')
      releaseAndNotify()
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendUsbHidCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  const keyboardCmd = parser.name === 'keyDown' || parser.name === 'keyUp'
  // 设备未连接时，不处理 keyboard 指令
  if (!device && keyboardCmd) {
    return
  }
  if (!device) {
    await connectUsb()
  }
  if (!device) {
    logger.info('Device not connected, Ignore data:' + parser.name + arg || '')
    return
  }
  if (keyboardCmd) {
    // 键盘指令
    const payload = parser(arg)
    // 每个按键指令数据包2字节
    const buffer = Buffer.alloc(KEY_BUFFER_SIZE + 1, 0x00)
    buffer[0] = KEY_REPORT_ID
    buffer[1] = payload[0]
    await device.write(buffer)
    // logger.info(parser.name, arg || '')
    return
  }
  // 其他控制指令
  const payload = parser(arg)
  const buffer = Buffer.alloc(BUFFER_SIZE + 1, 0x00)
  buffer[0] = REPORT_ID
  for (let i = 0; i < payload.length; i++) {
    buffer[i + 1] = payload[i]
  }
  await device.write(buffer)
  // logger.info(parser.name, arg || '')
}

export const closeUsb = (): void => {
  if (device) {
    device.close()
    device = null
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  } else {
    logger.info('Device not connected')
  }
}

export const initUsb = (mainWindow: Electron.BrowserWindow): void => {
  win = mainWindow
}

export const hasUsb = (): boolean => {
  const devices = hid.devices(VENDOR_ID, PRODUCT_ID)
  return devices.length > 0
}

export const listUsb = (): hid.Device[] => {
  return hid.devices(VENDOR_ID, PRODUCT_ID)
}
