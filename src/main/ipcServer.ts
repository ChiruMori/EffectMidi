import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import { closeSerial, sendCmd } from './serial/serial'
import storage from './storage'
// import midi from './midi'
import cmds from './serial/cmds'

// IPC 通信，渲染进程通知主进程执行操作
export default function ipc(mainWindow: BrowserWindow): void {
  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
    // 回复渲染进程
    mainWindow.webContents.send('ping')
  })
  // 列出全部串口
  ipcMain.handle('listSerialPorts', SerialPort.list)
  // 初始化 LED
  ipcMain.on('initLed', async () => {
    // 通过发送一系列指令完成配置的初始化
    // 背景色设置
    const bgColor = await storage.main.getLedConfig('bgColor')
    sendCmd(cmds.setBackgroundColor, bgColor.length === 9 ? bgColor.substring(1, 8) : bgColor)
  })
  // 关闭 LED
  ipcMain.on('closeLed', closeSerial)
  // 按键按下
  ipcMain.on('midi-keydown', (_, key) => {
    sendCmd(cmds.keyDown, key)
  })
  // 按键松开
  ipcMain.on('midi-keyup', (_, key) => {
    sendCmd(cmds.keyUp, key)
  })
  // 背景色设置
  ipcMain.on('setBgColor', (_, color) => {
    sendCmd(cmds.setBackgroundColor, color)
  })
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
