// web midi api
let midiAccess: WebMidi.MIDIAccess | null = null
let midiInput: WebMidi.MIDIInput | null = null
let activeDeviceId: string | null = null
const KEY_INDEX_OFFSET = 21

const eventHandlers = {
  keyDown: (key: number) => {},
  keyUp: (key: number) => {}
}

export default {
  init: async function (deviceId: string, abortCb: (event: ???) => void): Promise<boolean> {
    try {
      if (midiAccess != null) {
        // 取消监听
        midiAccess.onstatechange = null
      }
      midiAccess = await navigator.requestMIDIAccess()
      if (midiAccess === null || !midiAccess.inputs.get(deviceId)) {
        return false
      }

    } catch (error) {
      console.error('Error initializing MIDI Access:', error)
    }
  },
  connectDevice: async function (deviceId: string, abortCb: (event: ???) => void): Promise<void> {
    if (!midiAccess) {
      midiAccess = await navigator.requestMIDIAccess()
      // 设置热插拔监听
      midiAccess!.onstatechange = (event) => {
        // 选中的设备断开时处理
        if (event.port.type === 'input' && !event.port.connection.endsWith('closed')) {
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
  },

  handleMidiMessage: (event: WebMidi.MIDIMessageEvent) => {
    const { keyDown, keyUp } = eventHandlers
    if ((event.data[0] & 0xf0) === 0x90) {
      keyDown(event.data[1] - KEY_INDEX_OFFSET)
    } else if ((event.data[0] & 0xf0) === 0x80) {
      keyUp(event.data[1] - KEY_INDEX_OFFSET)
    }
  },
  
  setMidiEventHandlers(handlers: typeof eventHandlers) {
    Object.assign(eventHandlers, handlers)
  },

  listAllDevices: function (): WebMidi.MIDIInput[] {
    if (!midiAccess) {
      return []
    }
    return Array.from(midiAccess.inputs.values())
  }
}