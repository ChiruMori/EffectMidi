import { BrowserWindow, ipcMain } from 'electron'
import storage from './storage'
import cmds from './serial/cmds'
import { shell } from 'electron'
import { sendUsbHidCmd, closeUsb, listUsb } from './serial/usb'

// IPC 通信，渲染进程通知主进程执行操作
export default function ipc(mainWindow: BrowserWindow): void {
  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
    // 回复渲染进程
    mainWindow.webContents.send('ping')
  })
  // 列出全部设备
  ipcMain.handle('listEmbeddeds', async () => {
    return listUsb().map((device) => device.path)
  })
  // 初始化 LED
  ipcMain.on('initLed', async (): Promise<void> => {
    // 通过发送一系列指令完成配置的初始化
    try {
      // 背景色设置
      const bgColor = await storage.main.getLedConfig('bgColor')
      await sendUsbHidCmd(cmds.setBackgroundColor, bgColor)
      // 前景色设置
      const fgColor = await storage.main.getLedConfig('fgColor')
      await sendUsbHidCmd(cmds.setForegroundColor, fgColor)
      // 端点灯颜色设置
      const endColor = await storage.main.getLedConfig('endColor')
      await sendUsbHidCmd(cmds.setEndLightsColor, endColor)
      // 延迟时间设置
      const residualTime = Number(await storage.main.getLedConfig('residue'))
      await sendUsbHidCmd(cmds.setResidualTime, residualTime)
      // 扩散宽度设置
      const diffusionWidth = Number(await storage.main.getLedConfig('diffusion'))
      await sendUsbHidCmd(cmds.setDiffusionWidth, diffusionWidth)
    } catch (err) {
      mainWindow.webContents.send('serial-abort')
      console.error('Init LED failed:', err)
    }
  })
  // 关闭 LED
  ipcMain.on('closeLed', async (): Promise<void> => {
    closeUsb()
  })
  // 按键按下
  ipcMain.on('midi-keydown', (_, key) => {
    sendUsbHidCmd(cmds.keyDown, key)
  })
  // 按键松开
  ipcMain.on('midi-keyup', (_, key) => {
    sendUsbHidCmd(cmds.keyUp, key)
  })
  // 背景色设置
  ipcMain.on('setBgColor', (_, color) => {
    sendUsbHidCmd(cmds.setBackgroundColor, color)
  })
  // 前景色设置
  ipcMain.on('setFgColor', (_, color) => {
    sendUsbHidCmd(cmds.setForegroundColor, color)
  })
  // 端点灯颜色设置
  ipcMain.on('setEndColor', (_, color) => {
    sendUsbHidCmd(cmds.setEndLightsColor, color)
  })
  // 延迟时间设置
  ipcMain.on('setResidualTime', (_, time) => {
    sendUsbHidCmd(cmds.setResidualTime, time)
  })
  // 扩散宽度设置
  ipcMain.on('setDiffusionWidth', (_, width) => {
    sendUsbHidCmd(cmds.setDiffusionWidth, width)
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
  // 浏览器打开
  ipcMain.on('openBrowser', async (_, url) => {
    console.log('openBrowser:', url)
    shell.openExternal(url)
  })
}
