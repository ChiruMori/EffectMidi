import { SerialPort } from 'serialport'
import { PortInfo } from '@serialport/bindings-interface'
import storage from '../storage'
import { CmdParser } from './cmds'
import { resolve } from 'path'

let activedSerial: PortInfo | null = null
let serial: SerialPort | null = null
let lastCmd: string | null = null
let lastResolve: null | ((value: number) => void) = null
const SERIAL_BAUD = 300
const MAX_RETRY = 30
const SUCCESS_RESP_BYTE = 0x00
const FAIL_RESP_BYTE = 0x01
const TIMEOUT_RESP_BYTE = -1

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
    console.error('No active serial port found.')
    return
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
          serial!.on('data', (data) => {
            const resp = data.readInt8(0)
            console.log('Data received:', resp)
            if (lastCmd) {
              lastCmd = null
              lastResolve!(resp)
              lastResolve = null
            }
          })
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

    let retry = 0

    const sendAndWait = async (): Promise<void> => {
      // 发送指令
      await new Promise<void>((resolve, reject) => {
        serial!.write(Buffer.from(parser(arg)), 'hex', (err) => {
          if (err) {
            console.error('Error writing to serial port:', err)
            reject(err)
            return
          }
          serial!.drain((err) => {
            if (err) {
              console.error('Error draining serial port:', err)
              reject(err)
              return
            }
            resolve()
          })
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

      // 等待开发板发送的信号
      const response = await waitForEndSignal(`${parser.name}(${arg})`)
      if (response === FAIL_RESP_BYTE) {
        throw new Error('Unexpected response from device, expected 0x00')
      } else if (response === TIMEOUT_RESP_BYTE) {
        if (retry < MAX_RETRY) {
          retry++
          console.log('Timeout, retry:', retry)
          serial!.flush(async (err) => {
            if (err) {
              console.error('Error flushing serial port:', err)
              return
            }
            await sendAndWait()
          })
        } else {
          throw new Error('Timeout after max retries')
        }
      } else if (response !== SUCCESS_RESP_BYTE) {
        resolve()
      }
    }
    sendAndWait()

    lock = false
  } catch (error) {
    console.error('Error in sendAndFlush:', error)
    closeSerial() // 关闭串口
    await connectSerial() // 尝试重新连接
  }
}

const waitForEndSignal = async (key: string): Promise<number> => {
  return new Promise((resolve) => {
    lastCmd = key
    lastResolve = (data: number): void => {
      resolve(data)
      console.log(`Response of ${key}: ${data}`)
    }
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
