import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import { closeSerial, sendCmd } from './serial/serial'
import storage from './storage'
import cmds, { CmdParser } from './serial/cmds'
import { shell } from 'electron'
import { sendUsbHidCmd, isChooseUsb, closeUsb, hasUsb } from './serial/usb'

// 尝试 USB 连接时，需要调用 usb 的方法进行同步发送
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleCmd = async (parser: CmdParser, arg?: any): Promise<void> => {
  // USB 连接时，调用 USB 的方法进行同步发送
  if (await isChooseUsb()) {
    await sendUsbHidCmd(parser, arg)
    return
  }
  sendCmd(parser, arg)
}

// IPC 通信，渲染进程通知主进程执行操作
export default function ipc(mainWindow: BrowserWindow): void {
  // IPC test
  ipcMain.on('ping', () => {
    console.log('pong')
    // 回复渲染进程
    mainWindow.webContents.send('ping')
  })
  // 列出全部串口
  ipcMain.handle('listSerialPorts', async () => {
    const ports = (await SerialPort.list()).map((port) => {
      return {
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        vendorId: port.vendorId,
        productId: port.productId,
        locationId: port.locationId,
        // @ts-ignore - friendlyName 属性存在，且展示端有兼容处理
        friendlyName: port.friendlyName
      }
    })
    return { serial: ports, usb: hasUsb() }
  })
  // 初始化 LED
  ipcMain.on('initLed', async (): Promise<void> => {
    // 通过发送一系列指令完成配置的初始化
    try {
      const bytes = [] as number[]
      // 背景色设置
      const bgColor = await storage.main.getLedConfig('bgColor')
      bytes.push(
        ...cmds.setBackgroundColor(bgColor.length === 9 ? bgColor.substring(1, 8) : bgColor)
      )
      // 前景色设置
      const fgColor = await storage.main.getLedConfig('fgColor')
      bytes.push(
        ...cmds.setForegroundColor(fgColor.length === 9 ? fgColor.substring(1, 8) : fgColor)
      )
      // 端点灯颜色设置
      const endColor = await storage.main.getLedConfig('endColor')
      bytes.push(
        ...cmds.setEndLightsColor(endColor.length === 9 ? endColor.substring(1, 8) : endColor)
      )
      // 延迟时间设置
      const residualTime = Number(await storage.main.getLedConfig('residue'))
      bytes.push(...cmds.setResidualTime(residualTime))
      // 扩散宽度设置
      const diffusionWidth = Number(await storage.main.getLedConfig('diffusion'))
      bytes.push(...cmds.setDiffusionWidth(diffusionWidth))
      // 发送指令
      await handleCmd(cmds.combined, bytes)
    } catch (err) {
      mainWindow.webContents.send('serial-abort')
      console.error('Init LED failed:', err)
    }
  })
  // 关闭 LED
  ipcMain.on('closeLed', async (): Promise<void> => {
    if (await isChooseUsb()) {
      closeUsb()
      return
    }
    closeSerial()
  })
  // 按键按下
  ipcMain.on('midi-keydown', (_, key) => {
    handleCmd(cmds.keyDown, key)
  })
  // 按键松开
  ipcMain.on('midi-keyup', (_, key) => {
    handleCmd(cmds.keyUp, key)
  })
  // 背景色设置
  ipcMain.on('setBgColor', (_, color) => {
    handleCmd(cmds.setBackgroundColor, color)
  })
  // 前景色设置
  ipcMain.on('setFgColor', (_, color) => {
    handleCmd(cmds.setForegroundColor, color)
  })
  // 端点灯颜色设置
  ipcMain.on('setEndColor', (_, color) => {
    handleCmd(cmds.setEndLightsColor, color)
  })
  // 延迟时间设置
  ipcMain.on('setResidualTime', (_, time) => {
    handleCmd(cmds.setResidualTime, time)
  })
  // 扩散宽度设置
  ipcMain.on('setDiffusionWidth', (_, width) => {
    handleCmd(cmds.setDiffusionWidth, width)
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
