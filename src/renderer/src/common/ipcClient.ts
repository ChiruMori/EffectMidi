/* eslint-disable @typescript-eslint/no-explicit-any */

const server = window.electron.ipcRenderer

// 渲染进程调用主进程的方法
export default {
  // IPC Test
  ping: (): void => server.send('ping'),
  // List all listEmbedded devices
  listEmbeddeds: async (): Promise<string[]> => {
    return await server.invoke('listEmbeddeds')
  },
  // Enable serial port
  initLed: (): void => {
    server.send('initLed')
  },
  // Disable serial port
  closeLed: (): void => {
    server.send('closeLed')
  },
  // Key down
  keyDown: (key: number): void => {
    server.send('midi-keydown', key)
  },
  // Key up
  keyUp: (key: number): void => {
    server.send('midi-keyup', key)
  },
  // Set background color
  setBgColor: (color: string): void => {
    server.send('setBgColor', color)
  },
  // Set foreground color
  setFgColor: (color: string): void => {
    server.send('setFgColor', color)
  },
  // Set end light color
  setEndColor: (color: string): void => {
    server.send('setEndColor', color)
  },
  // Set residual time
  setResidualTime: (time: number): void => {
    server.send('setResidualTime', time)
  },
  // Set diffusion width
  setDiffusionWidth: (width: number): void => {
    server.send('setDiffusionWidth', width)
  },
  // Storage
  storage: {
    get: async (key: string): Promise<any> => {
      return await server.invoke('storage.get', key)
    },
    set: async (key: string, value: any): Promise<void> => {
      return await server.invoke('storage.set', key, value)
    },
    remove: async (key: string): Promise<void> => {
      return await server.invoke('storage.remove', key)
    }
  },
  // Open Browser
  openBrowser: (url: string): void => {
    server.send('openBrowser', url)
  }
}
