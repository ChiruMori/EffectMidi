import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import storage from './storage'
import midi from './midi'

// IPC 通信，渲染进程通知主进程执行操作
export default function ipc(mainWindow: BrowserWindow): void {
  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
    // 回复渲染进程
    mainWindow.webContents.send('ping')
  })
  ipcMain.on('midi-tick', () => {
    midi.nextTick()
  })
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
  // 
}
