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

const connectSerial = async (): Promise<void> => {
  if (!activedSerial) {
    activedSerial = (await getActivedSerial()) ?? null
  }
  if (!activedSerial) {
    return
  }
  if (!serial) {
    serial = new SerialPort(
      {
        path: activedSerial.path,
        baudRate: SERIAL_BAUD
      },
      (err) => {
        if (err) {
          console.error(err)
          return Promise.reject(err)
        }
        console.log(`Serial port opened: ${activedSerial!.path}`)
        return Promise.resolve()
      }
    )
  }
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendAndFlush = (parser: CmdParser, arg?: any): void => {
  try {
    // 发送指令
    serial!.write(Buffer.from(parser(arg)), 'hex', (err) => {
      if (err) {
        console.error(err)
        // 尝试重新连接、重新发送
        closeSerial()
        connectSerial()
      }
    })
    // 清空串口缓冲区
    serial!.flush()
  } catch (error) {
    console.error(error)
    closeSerial()
    connectSerial()
  }
}

/**
 * 构建指令字节数组并发送到串口，会自动打开串口
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  await connectSerial()
  sendAndFlush(parser, arg)
}

/**
 * 关闭串口
 */
export const closeSerial = (): void => {
  try {
    if (serial) {
      serial.close()
      serial = null
      console.log('Serial port closed.')
    }
  } catch (error) {
    // ignore
  }
}
