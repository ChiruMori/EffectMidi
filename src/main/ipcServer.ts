import { ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import storage from './storage'

export default function ipc(): void {
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  // 列出全部串口
  ipcMain.handle('listSerialPorts', SerialPort.list)
  // SQLite
  ipcMain.handle('storage.get', async (_, key) => {
    return await storage.get(key as string)
  })
  ipcMain.handle('storage.set', async (_, key, value) => {
    return await storage.set(key as string, value)
  })
  ipcMain.handle('storage.remove', async (_, key) => {
    return await storage.remove(key as string)
  })
}
