/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronAPI } from '@electron-toolkit/preload'

export type RegisteredEvent =
  | 'ping'
  | 'midi-keydown'
  | 'midi-keyup'
  | 'serial-abort'
  | 'server-notify'
export type ServerNotifyType = 'no-usb' | 'multiple-usb'

export interface EffectMidiAPI {
  // IPC Test
  onPing: (pong: () => void) => void
  // 监听 MIDI 设备指定按键按下
  onKeyDown: (callback: (data: number) => void) => void
  // 监听 MIDI 设备指定按键松开
  onKeyUp: (callback: (data: number) => void) => void
  // 取消对某事件的监听
  offEvent: (eventName: RegisteredEvent) => void
  // 监听串口异常中断
  onSerialAbort: (callback: () => void) => void
  // 监听服务器通知
  onServerNotify: (callback: (type: ServerNotifyType) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: EffectMidiAPI
  }
}
