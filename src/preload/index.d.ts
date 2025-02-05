/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronAPI } from '@electron-toolkit/preload'

export interface EffectMidiAPI {
  // IPC Test
  onPing: (pong: () => void) => void
  // 监听 MIDI 设备指定按键按下
  onKeyDown: (callback: (data: number) => void) => void
  // 监听 MIDI 设备指定按键松开
  onKeyUp: (callback: (data: number) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: EffectMidiAPI
  }
}
