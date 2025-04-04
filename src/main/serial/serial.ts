import { SerialPort } from 'serialport'
import { PortInfo } from '@serialport/bindings-interface'
import storage from '../storage'
import { CmdParser } from './cmds'
import { resolve } from 'path'

let activedSerial: PortInfo | null = null
let serial: SerialPort | null = null
let lastCmd: string | null = null
let lastResolve: null | ((value: number) => void) = null
let win: Electron.BrowserWindow | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cmdQueue: { parser: CmdParser; arg?: any }[] = []
const SERIAL_BAUD = 115200
const MAX_RETRY = 3
const SUCCESS_RESP_BYTE = 0x00
const FAIL_RESP_BYTE = 0x01
const TIMEOUT_RESP_BYTE = -1
const keyboardStatus: boolean[] = new Array(88).fill(false)

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
          baudRate: SERIAL_BAUD,
          // 一位停止位
          stopBits: 1,
          // 无奇偶校验位
          parity: 'none',
          // 数据位
          dataBits: 8
        },
        (err) => {
          if (err) {
            console.error('Error opening serial port:', err)
            return reject(err)
          }
          console.log(`Serial port opened: ${activedSerial!.path}`)
          serial!.on('data', (data) => {
            const resp = data.readInt8(0)
            // console.log('Data received:', resp)
            if (lastCmd) {
              lastCmd = null
              lastResolve!(resp)
              lastResolve = null
            }
          })
          // 意外中断时，关闭串口，并通知渲染进程
          serial!.on('close', () => {
            console.log('Serial port closed.')
            serial = null
            win?.webContents.send('serial-abort')
          })
        }
      )
      // 新连接，需要等待一定时间，清空板子上发飙的指令
      setTimeout(resolve, 1000)
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendAndFlush = async (parser: CmdParser, arg?: any): Promise<void> => {
  try {
    if (!serial) await connectSerial()

    // 创建原子化数据包
    const data = Buffer.from(parser(arg))

    let retry = 0

    const sendAndWait = async (): Promise<void> => {
      // 发送指令
      await new Promise<void>((resolve, reject) => {
        serial!.write(data, (err) => {
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

      // console.log(`Command sent: ${parser.name}(${arg})`)
      // 等待开发板发送的信号
      const response = await waitForEndSignal(`${parser.name}(${arg})`).catch((err) => {
        console.log(err.message)
        return Promise.resolve(TIMEOUT_RESP_BYTE)
      })
      if (response === FAIL_RESP_BYTE) {
        console.error('Unexpected response from device, expected 0x00')
        await sendAndWait()
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
    await sendAndWait()
  } catch (error) {
    console.error('Error in sendAndFlush:', error)
  }
}

const waitForEndSignal = async (key: string): Promise<number> => {
  return Promise.race([
    new Promise<number>((resolve) => {
      lastCmd = key
      // lastResolve = (data: number): void => {
      //   resolve(data)
      //   console.log(`Response of ${key}: ${data}`)
      // }
      lastResolve = resolve
    }),
    new Promise<number>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout waiting for end signal of ${key}`))
      }, 500)
    })
  ])
}

let lock = false
const handleCmdQueue = async (): Promise<void> => {
  if (lock) {
    return
  }
  lock = true
  while (cmdQueue.length !== 0) {
    const { parser, arg } = cmdQueue.shift()!
    if (parser.name === 'keyDown') {
      const keyIndex = arg as number
      if (keyboardStatus[keyIndex]) {
        continue
      }
      keyboardStatus[keyIndex] = true
    } else if (parser.name === 'keyUp') {
      const keyIndex = arg as number
      if (!keyboardStatus[keyIndex]) {
        continue
      }
      keyboardStatus[keyIndex] = false
    }

    try {
      await connectSerial()
      // 进行一定时间的延迟，使不同平台的开发板均能正常工作
      await new Promise((resolve) => setTimeout(resolve, 5))
      await sendAndFlush(parser, arg)
    } catch (error) {
      console.error('Error in handleCmdQueue:', error)
    }
  }
  lock = false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendCmd = (parser: CmdParser, arg?: any): void => {
  const keyboardCmd = parser.name === 'keyDown' || parser.name === 'keyUp'
  // serial 为 null 时，不能处理 keyboard 指令
  if (!serial && keyboardCmd) {
    return
  }
  if (cmdQueue.length !== 0 && !keyboardCmd) {
    // 如果队列中已有相同指令（Parser相同），且不是键盘指令的时候，则删掉之前的指令
    const index = cmdQueue.findIndex((item) => item.parser === parser)
    if (index !== -1) {
      cmdQueue.splice(index, 1)
    }
  }
  cmdQueue.push({ parser, arg })
  handleCmdQueue()
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
        serial = null
      })
    }
  } catch (error) {
    console.error('Error in closeSerial:', error)
  }
}

export const initSerial = (mainWindow: Electron.BrowserWindow): void => {
  win = mainWindow
}
