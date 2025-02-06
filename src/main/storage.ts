/* eslint-disable @typescript-eslint/no-explicit-any */
import { app } from 'electron'
import SQLite from 'sqlite3'
import path from 'path'

// DB 文件存储在当前目录下，名为 effect-midi.db
const db = new SQLite.Database(path.join(app.getAppPath(), 'effect-midi.db'))

// 读取数据
const innerGet = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM state WHERE key = ?', key, (err, row) => {
      if (err) {
        console.error(err.message)
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
        console.error(err.message)
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
          console.error(err.message)
          reject(err)
        } else {
          console.log('Opened the database connection.')
          resolve()
        }
      })
    })
  },
  get: innerGet,
  set: async (key: string, value: any): Promise<void> => {
    await innerSet(key, value)
    // TODO: 拓展灯带控制
  },
  // 删除数据
  remove: (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM state WHERE key = ?', key, (err) => {
        if (err) {
          console.error(err.message)
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
        console.error(err.message)
      }
      console.log('Closed the database connection.')
    })
  },
  // 主进程读取数据
  main: {
    getCom: async (): Promise<string> => {
      const raw = await innerGet(getInnerKey('com'))
      const obj = JSON.parse(raw)
      const com = obj.com
      if (com.startsWith('"') && com.endsWith('"')) {
        return com.substring(1, com.length - 1)
      }
      return com
    }
  }
}
