import hid from 'node-hid'
import { CmdParser } from './cmds'
import storage from '../storage'

const VENDOR_ID = 0x1209
const PRODUCT_ID = 0x0666
const USB_HID_KEYWORD = 'usb-hid'

const REPORT_ID = 0x01
const KEY_REPORT_ID = 0x02
// 控制指令的发送缓冲区大小
const BUFFER_SIZE = 16
const KEY_BUFFER_SIZE = 1
// 控制指令延迟时间（键盘指令是实时的）
const FLUSH_TIMEOUT = 100
const MAX_RETRY = 3
let sendQueue: number[] = []
let flushTimer: NodeJS.Timeout | null = null
let isSending = false
let pollingTimer: NodeJS.Timeout | null = null

// 异步发送锁控制
const sendLock = {
  acquire: async (): Promise<void> => {
    while (isSending) {
      await new Promise((resolve) => setTimeout(resolve, 1))
    }
    isSending = true
  },
  release: (): void => {
    isSending = false
  }
}

// 释放设备标记、定时器，通知用户设备断了
const releaseAndNotify = (): void => {
  if (device) {
    device.close()
    device = null
    win?.webContents.send('serial-abort')
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }
}

async function flushBuffer(): Promise<void> {
  await sendLock.acquire()

  if (sendQueue.length === 0) return
  const buffer = Buffer.alloc(BUFFER_SIZE, 0x00)
  try {
    // 创建符合HID规范的字节数据包
    buffer[0] = REPORT_ID
    // 填充数据
    for (let i = 0; i < BUFFER_SIZE; i++) {
      buffer[i + 1] = sendQueue[i] || 0
    }

    // 发送数据
    if (device) {
      await device.write(buffer)
      // console.log('Sent buffer:', buffer.toString('hex'))
    }

    // 清空已发送数据
    sendQueue = []

    // 重置定时器
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // 设备连接中断，没必要重试，直接返回
    if (error.message && error.message.includes('closed')) {
      console.log('Device closed, Ignore data:', buffer.toString('hex'))
      releaseAndNotify()
      return
    }
    console.error('Error flushing buffer:', error)
    // 尝试重发，重试多次仍失败则断开设备并通知用户
    let retryCount = MAX_RETRY
    while (retryCount-- > 0) {
      try {
        if (device) {
          await device.write(buffer)
          console.log('Resent buffer:', buffer.toString('hex'))
          break
        }
      } catch (retryError) {
        const retryTime = MAX_RETRY - retryCount
        console.error(`Retry ${retryTime} failed:`, retryError)
        // 延迟重试
        await new Promise((resolve) => setTimeout(resolve, FLUSH_TIMEOUT * retryTime))
      }
    }
    if (device) {
      releaseAndNotify()
    }
  } finally {
    sendLock.release()
  }
}

let device: hid.HIDAsync | null = null
let win: Electron.BrowserWindow | null = null

const connectUsb = async (): Promise<void> => {
  if (device) {
    return
  }
  const devices = hid.devices(VENDOR_ID, PRODUCT_ID)
  // console.log('Devices:', devices)
  if (devices.length === 0) {
    win?.webContents.send('no-usb')
    return
  }
  if (devices.length > 1) {
    win?.webContents.send('multiple-usb')
  }

  device = await hid.HIDAsync.open(devices[0].path!).catch(() => {
    console.log('HID device closed')
    win?.webContents.send('serial-abort')
    return null
  })
  device?.on('error', (err) => {
    console.error('HID device error:', err)
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
      console.log('Device disconnected')
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
    console.log('Device not connected, Ignore data:', parser.name, arg || '')
    return
  }
  if (keyboardCmd) {
    // 键盘指令直接发送
    const payload = parser(arg)
    // 每个按键指令数据包2字节
    const buffer = Buffer.alloc(KEY_BUFFER_SIZE + 1, 0x00)
    buffer[0] = KEY_REPORT_ID
    buffer[1] = payload[0]
    await device.write(buffer)
    // console.log(parser.name, arg || '')
    return
  }
  const payload = parser(arg)
  // 缓冲区满，同步推送
  if (sendQueue.length + payload.length > BUFFER_SIZE) {
    await flushBuffer()
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => flushBuffer(), FLUSH_TIMEOUT)
  }
  sendQueue.push(...payload)
}

export const closeUsb = (): void => {
  if (device) {
    device.close()
  }
}

export const isChooseUsb = async (): Promise<boolean> => {
  const chooseDevice = await storage.main.getCom()
  return chooseDevice.includes(USB_HID_KEYWORD)
}

export const initUsb = (mainWindow: Electron.BrowserWindow): void => {
  win = mainWindow
}

export const hasUsb = (): boolean => {
  const devices = hid.devices(VENDOR_ID, PRODUCT_ID)
  return devices.length > 0
}
