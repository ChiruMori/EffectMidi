import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { SerialPort } from 'serialport'

// 暴露给渲染进程的自定义 API
const api = {
  // 通过 IPC 通信获取串口列表
  listSerialPorts: SerialPort.list
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
