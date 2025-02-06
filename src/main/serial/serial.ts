import { SerialPort } from 'serialport'
import { PortInfo } from '@serialport/bindings-interface'
import storage from '../storage'
import { CmdParser } from './cmds'

let activedSerial: PortInfo | null = null
let serial: SerialPort | null = null
const SERIAL_BAUD = 19200

/**
 * 从数据库中获取用户设置的串口信息
 * @returns 用户设置的串口（path，如 COM3）
 */
const getActivedSerial = async (): Promise<PortInfo | undefined> => {
  const ports = await SerialPort.list()
  const settingComPath = await storage.main.getCom()
  const settingPort = ports.find((port) => port.path === settingComPath)
  if (settingPort) {
    return settingPort
  }
  return undefined
}

/**
 * 构建指令字节数组并发送到串口，会自动打开串口
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  if (!activedSerial) {
    activedSerial = (await getActivedSerial()) ?? null
  }
  if (!activedSerial) {
    return
  }
  if (!serial) {
    serial = new SerialPort({
      path: activedSerial.path,
      baudRate: SERIAL_BAUD
    })
  }
  serial.write(Buffer.from(parser(arg)), 'hex', (err) => {
    if (err) {
      console.error(err)
    }
  })
  // 监听串口数据返回（直接打印）
  serial.on('data', (data) => {
    console.log('Serial: ', data)
  })
}

/**
 * 关闭串口
 */
export const closeSerial = (): void => {
  if (serial) {
    serial.close()
    serial = null
    console.log('Serial port closed.')
  }
}
