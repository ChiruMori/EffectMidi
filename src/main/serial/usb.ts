import hid from 'node-hid'
import { CmdParser } from './cmds'

const VENDOR_ID = 0x1209
const PRODUCT_ID = 0x0666
const REPORT_ID = 0x0a

let device: hid.HID | null = null
let heartbeatTimer: NodeJS.Timeout | null = null

const connectUsb = async (): Promise<void> => {
  if (device) {
    return
  }
  device = new hid.HID(VENDOR_ID, PRODUCT_ID)
  device.on('open', () => {
    console.log('HID device opened')
  })
  device.on('data', (data) => {
    console.log('Received data:', data)
    // 跳过 Report ID
    // const payload = data.slice(1)
    // 处理数据（暂不处理，可拓展校验、重传等）
  })
  device.on('error', (err) => {
    console.error('HID error:', err)
  })
  device.on('close', () => {
    console.log('HID device closed')
    device = null
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  })
  // 发送心跳包
  heartbeatTimer = setInterval(() => {
    device?.write([0x00])
  }, 900)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendCmd = (parser: CmdParser, arg?: any): void => {
  if (!device) {
    connectUsb()
  }
  if (!device) {
    console.log('Device not connected, Ignore data:', parser.name, arg || '')
    return
  }
  const data = Buffer.from(parser(arg))
  device.write(Buffer.concat([Buffer.from([REPORT_ID]), data]))
  console.log('Sent data:', parser.name, arg || '')
}

export const closeUsb = (): void => {
  if (device) {
    device.close()
  }
}
