import hid from 'node-hid'
import { CmdParser } from './cmds'
import storage from '../storage'

const VENDOR_ID = 0x1209
const PRODUCT_ID = 0x0666
const USB_HID_KEYWORD = 'usb-hid'

const BUFFER_SIZE = 16
const FLUSH_TIMEOUT = 10
let sendQueue: number[] = []
let flushTimer: NodeJS.Timeout | null = null
let isSending = false

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

async function flushBuffer(): Promise<void> {
  // TODO: 测试这个机制是否有效
  await sendLock.acquire()

  try {
    if (sendQueue.length === 0) return

    // 创建符合HID规范的字节数据包
    const buffer = Buffer.alloc(16)

    // 填充数据，确保数据长度为16字节
    for (let i = 0; i < BUFFER_SIZE; i++) {
      buffer[i] = sendQueue[i] || 0
    }

    // 发送数据
    if (device) {
      await device.write(buffer)
      console.log('Sent buffer:', buffer.toString('hex'))
    }

    // 清空已发送数据
    sendQueue = []

    // 重置定时器
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = null
  } catch (error) {
    console.error('Error flushing buffer:', error)
    device?.close()
    device = null
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
  console.log('Devices:', devices)
  if (devices.length === 0) {
    win?.webContents.send('no-usb')
    return
  }
  if (devices.length > 1) {
    win?.webContents.send('multiple-usb')
  }

  device = await hid.HIDAsync.open(devices[0].path!)
  if (!device) {
    win?.webContents.send('no-usb')
    return
  }
  // TODO: 如不接受嵌入式端数据，删掉
  // device.on('data', (data) => {
  //   console.log('Received data:', data)
  //   // 跳过 Report ID
  //   // const payload = data.slice(1)
  //   // 处理数据（暂不处理，可拓展校验、重传等）
  // })
  // 不存在 on('open') 事件
  device.on('error', (err) => {
    console.error('HID error:', err)
    device = null
  })
  device.on('close', () => {
    console.log('HID device closed')
    device = null
    win?.webContents.send('serial-abort')
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendUsbHidCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  if (!device) {
    await connectUsb()
  }
  if (!device) {
    console.log('Device not connected, Ignore data:', parser.name, arg || '')
    return
  }
  // TODO: 缓冲区机制生效则删除
  // try {
  //   const buffer = Buffer.alloc(16)
  //   const data = Buffer.from()
  //   data.copy(buffer)
  //   await device.write(buffer)
  //   console.log('Sent data:', parser.name, arg || '')
  // } catch (err) {
  //   console.log(err)
  //   device?.close()
  //   device = null
  //   throw err
  // }
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
