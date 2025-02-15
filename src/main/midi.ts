import { BrowserWindow } from 'electron'
import { sendCmd } from './serial/serial'
import SerialCmds from './serial/cmds'

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
        sendCmd(SerialCmds.keyDown, key)
      }
    } else {
      if (activeArr.length > 0) {
        const key = activeArr.shift()!
        window!.webContents.send('midi-keyup', key)
        sendCmd(SerialCmds.keyUp, key)
      }
    }
  },
  close: function (): void {
    window = null
  }
}
