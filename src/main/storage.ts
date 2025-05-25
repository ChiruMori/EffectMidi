/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron'
import SQLite from 'sqlite3'
import path from 'path'
import { logger } from './logger'
import { existsSync, mkdirSync } from 'fs'

// 生产环境运行时，从用户目录：~/.effect-midi 中查找
const dbPath =
  process.env.NODE_ENV === 'development'
    ? app.getAppPath()
    : path.join(app.getPath('home'), '.effect-midi')
if (!existsSync(dbPath)) {
  mkdirSync(dbPath, { recursive: true })
}
const db = new SQLite.Database(
  path.resolve(dbPath, 'effect-midi.db'),
  // 读写模式，不存在则创建
  SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE,
  (err) => {
    if (err) {
      logger.error('Database connection error:' + err.message)
    }
  }
)

const getparsedJson = async (key: string): Promise<any> => {
  const raw = await innerGet(getInnerKey(key))
  return JSON.parse(raw)
}

// 读取数据
const innerGet = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM state WHERE key = ?', key, (err, row) => {
      if (err) {
        logger.error(err.message)
        reject(err)
      } else {
        resolve(row ? (row as any).value : null)
      }
    })
  })
}

// 写入数据
const innerSet = (key: string, value: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('INSERT OR REPLACE INTO state (key, value) VALUES (?, ?)', key, value, (err) => {
      if (err) {
        logger.error(err.message)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const getInnerKey = (key: string): string => `persist:${key}`

export default {
  // 打开数据库连接
  open: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, value TEXT)', (err) => {
        if (err) {
          logger.error(err.message)
          reject(err)
        } else {
          logger.info('Opened the database connection.')
          resolve()
        }
      })
    })
  },
  get: innerGet,
  set: async (key: string, value: any): Promise<void> => {
    await innerSet(key, value)
  },
  // 删除数据
  remove: (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM state WHERE key = ?', key, (err) => {
        if (err) {
          logger.error(err.message)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  },
  // 关闭数据库连接
  close: (): void => {
    db.close((err) => {
      if (err) {
        logger.error(err.message)
      }
      logger.info('Closed the database connection.')
    })
  },
  // 主进程读取数据
  main: {
    getEmbedded: async (): Promise<string> => {
      const embPath = (await getparsedJson('embedded')).embedded
      try {
        // 解析转义后的字符串
        return JSON.parse(embPath)
      } catch (error) {
        // 解析失败则直接返回原始值
        logger.info('Parse embedded failed:' + error)
        return embPath
      }
    },
    getLedConfig: async (key: string): Promise<string> => {
      const ledConfig = await getparsedJson('led')
      const val = ledConfig[key]
      if (!val) {
        return ''
      }
      try {
        // 解析转义后的字符串
        return JSON.parse(val)
      } catch (error) {
        // 解析失败则直接返回原始值
        logger.info('Parse led config failed:' + error)
        return val
      }
    }
  }
}
