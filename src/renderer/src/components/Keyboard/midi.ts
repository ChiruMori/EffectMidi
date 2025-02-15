// web midi api

let midiInput: WebMidi.MIDIInput | null = null
const KEY_INDEX_OFFSET = 21

export default {
  init: async function (
    keyDown: (key: number) => void,
    keyUp: (key: number) => void
  ): Promise<void> {
    try {
      const midiAccess = await navigator.requestMIDIAccess()
      if (midiAccess.inputs.size === 0) {
        console.log('No MIDI input devices found.')
        return
      }
      midiInput = midiAccess.inputs.values().next().value as WebMidi.MIDIInput
      midiInput.onmidimessage = (event): void => {
        if ((event.data[0] & 0xf0) === 0x90) {
          keyDown(event.data[1] - KEY_INDEX_OFFSET)
        } else if ((event.data[0] & 0xf0) === 0x80) {
          keyUp(event.data[1] - KEY_INDEX_OFFSET)
        } else {
          console.log('Unregistered MIDI Message:', event)
        }
      }
    } catch (error) {
      console.error('Error initializing MIDI Access:', error)
    }
  },
  close: function (): void {
    if (midiInput) {
      midiInput.close()
    }
  }
}
