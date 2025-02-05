import { BrowserWindow } from 'electron'

let window: BrowserWindow | null = null
const activeArr: number[] = []

export default {
  init: function (mainWindow: BrowserWindow): void {
    window = mainWindow
  },
  nextTick: function (): void {
    const down = Math.random() > 0.5
    if (down) {
      const key = Math.floor(Math.random() * 88)
      console.log('midi-tick keydown', key)
      if (!activeArr.includes(key)) {
        activeArr.push(key)
        window!.webContents.send('midi-keydown', key)
      }
    } else {
      if (activeArr.length > 0) {
        const key = activeArr.shift()!
        window!.webContents.send('midi-keyup', key)
      }
    }
  }
}
