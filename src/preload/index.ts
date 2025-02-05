import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 暴露给渲染进程的自定义 API，由渲染进程执行
// IPC 通信，主进程通知渲染进程执行操作
const api = {
  onPing: (pong: () => void): void => {
    // 渲染进程控制台输出
    console.debug('preload bind ping event')
    ipcRenderer.removeAllListeners('ping')
    ipcRenderer.on('ping', pong)
  },
  onKeyDown: (callback: (data: number) => void): void => {
    ipcRenderer.removeAllListeners('midi-keydown')
    ipcRenderer.on('midi-keydown', (_, data) => callback(data))
  },
  onKeyUp: (callback: (data: number) => void): void => {
    ipcRenderer.removeAllListeners('midi-keyup')
    ipcRenderer.on('midi-keyup', (_, data) => callback(data))
  }
}

// 如果未启用上下文隔离，则通过 `contextBridge` API 将 Electron API
// 仅暴露给渲染进程，否则直接添加到 DOM 全局对象中。
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
