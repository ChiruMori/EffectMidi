// web midi api
let midiAccess: WebMidi.MIDIAccess | null = null
let midiInput: WebMidi.MIDIInput | null = null
let activeDeviceId: string | null = null
const KEY_INDEX_OFFSET = 21

const eventHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keyDown: (_ignore: number): void => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keyUp: (_ignore: number): void => {}
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
  },

  handleMidiMessage: (event: WebMidi.MIDIMessageEvent): void => {
    const { keyDown, keyUp } = eventHandlers
    if ((event.data[0] & 0xf0) === 0x90) {
      keyDown(event.data[1] - KEY_INDEX_OFFSET)
    } else if ((event.data[0] & 0xf0) === 0x80) {
      keyUp(event.data[1] - KEY_INDEX_OFFSET)
    }
  },

  setMidiEventHandlers(handlers: typeof eventHandlers): void {
    Object.assign(eventHandlers, handlers)
  },

  listAllDevices: function (): WebMidi.MIDIInput[] {
    if (!midiAccess) {
      return []
    }
    return Array.from(midiAccess.inputs.values())
  }
}
