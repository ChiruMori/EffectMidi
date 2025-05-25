import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import util from 'util'

const FILENAME_LEN = 10
const METHOD_NAME_LEN = 10

class Logger {
  private logDir: string
  private logFile: string
  private maxSize: number
  private maxFiles: number

  constructor() {
    // 开发环境生成在项目目录的 logs 下，生产环境声称在临时目录，程序关闭可自动清除
    this.logDir = path.join(
      process.env.NODE_ENV === 'development' ? app.getAppPath() : path.dirname(app.getPath('temp')),
      'logs'
    )
    this.logFile = 'app.log'
    this.maxSize = 1024 * 1024 * 5 // 5MB
    this.maxFiles = 5
    this.init()
  }

  private async init(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true })
    } catch (err) {
      console.error('Create log directory failed:', err)
    }
  }

  private async rotateLogs(): Promise<void> {
    const logPath = path.join(this.logDir, this.logFile)

    try {
      const stats = await fs.stat(logPath)
      if (stats.size >= this.maxSize) {
        for (let i = this.maxFiles - 1; i > 0; i--) {
          const oldFile = path.join(this.logDir, `app.${i}.log`)
          const newFile = path.join(this.logDir, `app.${i + 1}.log`)
          if (
            await fs
              .access(oldFile)
              .then(() => true)
              .catch(() => false)
          ) {
            await fs.rename(oldFile, newFile)
          }
        }
        await fs.rename(logPath, path.join(this.logDir, 'app.1.log'))
      }
    } catch (err) {
      // 忽略文件不存在的情况
    }
  }

  private write(level: string, message: string): void {
    // 获取调用堆栈信息
    const stack = new Error().stack?.split('\n') || []
    const caller = stack[2]?.trim() || ''
    const callerMethod = stack[3]?.trim() || ''

    // 解析文件名和方法名
    const fileNameMatch = caller.match(/at (?:(.+)\s)?\(?(.+):(\d+):(\d+)\)?$/)
    const methodNameMatch = callerMethod.match(/at (?:(.+)\s)?\(?(.+):(\d+):(\d+)\)?$/)
    let fileName = 'unknown'
    let methodName = 'anonymous'

    // 不足的向后填充空格，超长的向前截断（保留尾部）
    if (fileNameMatch) {
      // 提取文件名（不含路径和扩展名）
      const fullPath = fileNameMatch[2]
      fileName = path
        .basename(fullPath)
        .replace(/\.[^/.]+$/, '')
        .padEnd(FILENAME_LEN, ' ')
      if (fileName.length > FILENAME_LEN) {
        fileName = fileName.substring(fileName.length - FILENAME_LEN)
      }
    }
    if (methodNameMatch) {
      // 提取方法名
      methodName = (methodNameMatch[1] || 'anonymous')
        .replace(/\.[^/.]+$/, '')
        .padEnd(METHOD_NAME_LEN, ' ')
      if (methodName.length > METHOD_NAME_LEN) {
        methodName = methodName.substring(methodName.length - METHOD_NAME_LEN)
      }
    }

    // 格式化时间戳
    const now = new Date()
    const timestamp =
      `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}-` +
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // 构建日志消息
    const logMessage = util.format(
      '[%s][%s][%s][%s] %s\n',
      timestamp,
      level.toUpperCase(),
      fileName,
      methodName,
      message
    )

    // 开发环境控制台输出
    if (process.env.NODE_ENV === 'development') {
      switch (level) {
        case 'INFO':
          console.info(logMessage)
          break
        case 'WARN':
          console.warn(logMessage)
          break
        case 'ERR.':
          console.error(logMessage)
          break
        default:
          console.log(logMessage)
      }
    }

    // 异步写入文件
    this.rotateLogs().then(() => {
      try {
        fs.appendFile(path.join(this.logDir, this.logFile), logMessage)
      } catch (err) {
        console.error('Write log failed:', err)
      }
    })
  }

  public info(message: string): void {
    this.write('INFO', message)
  }

  public warn(message: string): void {
    this.write('WARN', message)
  }

  public error(message: string): void {
    this.write('ERR.', message)
  }
}

export const logger = new Logger()
