import 'webmidi'

// web midi api
let midiAccess: WebMidi.MIDIAccess | null = null
let midiInput: WebMidi.MIDIInput | null = null
let activeDeviceId: string | null = null
const KEY_INDEX_OFFSET = 21

interface EventHandlers {
  keyDown?: (index: number) => void
  keyUp?: (index: number) => void
  paddleToggle?: (isDown: boolean) => void
}

const eventHandlers: EventHandlers = {
  keyDown: undefined,
  keyUp: undefined,
  paddleToggle: undefined
}

export default {
  connectDevice: async function (
    deviceId: string,
    abortCb: (event: WebMidi.MIDIConnectionEvent) => void
  ): Promise<void> {
    if (!midiAccess) {
      midiAccess = await navigator.requestMIDIAccess()
      // 设置热插拔监听
      midiAccess!.onstatechange = (event: WebMidi.MIDIConnectionEvent): void => {
        // 选中的设备断开时处理
        if (event.port.type === 'input' && event.port.connection.endsWith('closed')) {
          if (event.port.id === activeDeviceId) {
            abortCb(event)
          }
        }
      }
    }

    // 关闭现有连接
    if (midiInput) {
      midiInput.close()
    }

    if (deviceId === '') {
      return
    }
    const device = midiAccess.inputs.get(deviceId)
    if (!device) {
      return Promise.reject(new Error('Device not found'))
    }

    midiInput = device
    midiInput.onmidimessage = this.handleMidiMessage
    activeDeviceId = deviceId
  },

  disconnectDevice: function (): void {
    if (midiInput) {
      midiInput.close()
      midiInput = null
    }
    if (midiAccess) {
      midiAccess.onstatechange = null
    }
    eventHandlers.keyDown = undefined
    eventHandlers.keyUp = undefined
    eventHandlers.paddleToggle = undefined
  },

  handleMidiMessage: (event: WebMidi.MIDIMessageEvent): void => {
    const { keyDown, keyUp, paddleToggle } = eventHandlers
    const eventType = event.data[0] & 0xf0
    const key = event.data[1] - KEY_INDEX_OFFSET
    const velocity = event.data[2]
    // 按键按下、释放
    // @see: https://midi.org/summary-of-midi-1-0-messages
    // 1001nnnn Note On event.
    // This message is sent when a note is depressed (start).
    // (kkkkkkk) is the key (note) number. (vvvvvvv) is the velocity.
    // Note On 事件（包含 Velocity=0 的伪 Note Off）
    if (eventType === 0x90) {
      if (velocity > 0) {
        // 正常按下
        keyDown?.(key)
      } else {
        // 零速度 Note On 视为松开
        keyUp?.(key)
      }
    }
    // 1000nnnn Note Off event.
    // This message is sent when a note is released (ended).
    // (kkkkkkk) is the key (note) number. (vvvvvvv) is the velocity.
    // Note Off 事件
    else if (eventType === 0x80) {
      keyUp?.(key) // 正常松开
    }
    // 踏板踩下、释放（CC#64 messages）
    // 1011nnnn Control Change.
    // This message is sent when a controller value changes.
    // Controllers include devices such as pedals and levers.
    // Controller numbers 120-127 are reserved as “Channel Mode Messages” (below).
    // (ccccccc) is the controller number (0-119). (vvvvvvv) is the controller value (0-127).
    else if (eventType === 0xb0 && event.data[1] === 64) {
      paddleToggle?.(velocity > 63)
    }
  },

  setMidiEventHandlers: function (handlers: EventHandlers): void {
    Object.assign(eventHandlers, handlers)
  },

  listAllDevices: function (): WebMidi.MIDIInput[] {
    if (!midiAccess) {
      return []
    }
    return Array.from(midiAccess.inputs.values())
  }
}
