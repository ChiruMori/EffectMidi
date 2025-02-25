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
  ipcMain.on('initLed', async (): Promise<void> => {
    // 通过发送一系列指令完成配置的初始化
    try {
      // TODO: 连续发送指令出错
      // 背景色设置
      const bgColor = await storage.main.getLedConfig('bgColor')
      sendCmd(cmds.setBackgroundColor, bgColor.length === 9 ? bgColor.substring(1, 8) : bgColor)
      // 前景色设置
      const fgColor = await storage.main.getLedConfig('fgColor')
      sendCmd(cmds.setForegroundColor, fgColor.length === 9 ? fgColor.substring(1, 8) : fgColor)
      // 端点灯颜色设置
      const endColor = await storage.main.getLedConfig('endColor')
      sendCmd(cmds.setEndLightsColor, endColor.length === 9 ? endColor.substring(1, 8) : endColor)
      // 延迟时间设置
      const residualTime = await storage.main.getLedConfig('residualTime')
      sendCmd(cmds.setResidualTime, residualTime)
      // 扩散宽度设置
      const diffusionWidth = await storage.main.getLedConfig('diffusionWidth')
      sendCmd(cmds.setDiffusionWidth, diffusionWidth)
    } catch (err) {
      mainWindow.webContents.send('serial-abort')
      console.error('Init LED failed:', err)
    }
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
  // 前景色设置
  ipcMain.on('setFgColor', (_, color) => {
    sendCmd(cmds.setForegroundColor, color)
  })
  // 端点灯颜色设置
  ipcMain.on('setEndColor', (_, color) => {
    sendCmd(cmds.setEndLightsColor, color)
  })
  // 延迟时间设置
  ipcMain.on('setResidualTime', (_, time) => {
    sendCmd(cmds.setResidualTime, time)
  })
  // 扩散宽度设置
  ipcMain.on('setDiffusionWidth', (_, width) => {
    sendCmd(cmds.setDiffusionWidth, width)
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
