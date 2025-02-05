import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/EffectMidi_1024.png?asset'
import storage from './storage'
import ipc from './ipcServer'
import midi from './midi'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // 创建窗口
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite CLI 的渲染进程热更新(HMR)。
  // 在开发环境下加载远程 URL，生产环境下加载本地 HTML 文件。
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 本方法将在 Electron 完成初始化并准备创建浏览器窗口时调用。
// 部分 API 只能在此事件发生后使用。
app.whenReady().then(() => {
  // 为 Windows 设置应用程序用户模型 ID
  electronApp.setAppUserModelId('plus.mori.effect-midi')

  // 默认在开发环境下通过 F12 打开或关闭 DevTools
  // 并在生产环境下忽略 CommandOrControl + R。
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  // 数据库初始化后再创建窗口
  storage.open().then(() => {
    createWindow()

    // 初始化 IPC
    ipc(mainWindow!)

    // TODO: MIDI 设备监听
    midi.init(mainWindow!)
  })

  app.on('activate', function () {
    // 在 macOS 上，当单击应用程序的 dock 图标并且没有其他窗口打开时，
    // 通常会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除 macOS 外，当所有窗口关闭时退出应用程序。在 macOS 上，应用程序及其菜单栏
// 通常会保持活动状态，直到用户通过 Cmd + Q 明确退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
  storage.close()
})
