import { SerialPort } from 'serialport'
import { PortInfo } from '@serialport/bindings-interface'
import storage from '../storage'
import { CmdParser } from './cmds'

let activedSerial: PortInfo | null = null
let serial: SerialPort | null = null
const SERIAL_BAUD = 19200

const getActivedSerial = async (): Promise<PortInfo | undefined> => {
  const ports = await SerialPort.list()
  const settingComPath = await storage.main.getCom()
  return ports.find((port) => port.path === settingComPath)
}

const connectSerial = async (): Promise<void> => {
  if (!activedSerial) {
    activedSerial = (await getActivedSerial()) || null
  }
  if (!activedSerial) {
    throw new Error('No active serial port found.')
  }

  if (!serial) {
    return new Promise((resolve, reject) => {
      serial = new SerialPort(
        {
          path: activedSerial!.path,
          baudRate: SERIAL_BAUD
        },
        (err) => {
          if (err) {
            console.error('Error opening serial port:', err)
            return reject(err)
          }
          console.log(`Serial port opened: ${activedSerial!.path}`)
          resolve()
        }
      )
    })
  }
}

let lock = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendAndFlush = async (parser: CmdParser, arg?: any): Promise<void> => {
  if (lock) {
    console.warn('Serial port is locked.')
    return
  }
  try {
    if (!serial) {
      await connectSerial()
    }

    // 发送指令
    await new Promise<void>((resolve, reject) => {
      serial!.write(Buffer.from(parser(arg)), 'hex', (err) => {
        if (err) {
          console.error('Error writing to serial port:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })

    // 清空串口缓冲区（可选）
    await new Promise<void>((resolve, reject) => {
      serial!.flush((err) => {
        if (err) {
          console.error('Error flushing serial port:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })

    // 等待开发板发送的结束信号 (0x00)
    const response = await waitForEndSignal()
    if (response !== 0x00) {
      throw new Error('Unexpected response from device, expected 0x00')
    }

    lock = false
  } catch (error) {
    console.error('Error in sendAndFlush:', error)
    closeSerial() // 关闭串口
    await connectSerial() // 尝试重新连接
  }
}

const waitForEndSignal = async (): Promise<number> => {
  return new Promise((resolve) => {
    serial!.on('data', (data) => {
      // 假设 data 是 Buffer，读取第一个字节
      const signal = data[0]
      if (signal === 0x00) {
        resolve(signal)
      }
    })
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  try {
    await connectSerial()
    await sendAndFlush(parser, arg)
  } catch (error) {
    console.error('Error in sendCmd:', error)
  }
}

export const closeSerial = (): void => {
  try {
    if (serial) {
      serial.close((err) => {
        if (err) {
          console.error('Error closing serial port:', err)
        } else {
          console.log('Serial port closed.')
        }
      })
      serial = null
    }
  } catch (error) {
    console.error('Error in closeSerial:', error)
  }
}
