#ifndef MIDI_HANDLER_H
#define MIDI_HANDLER_H

#include "OledController.hpp"
#include "LEDController.hpp"

class MidiHandler
{
private:
  enum MidiState
  {
    WAIT_STATUS,
    WAIT_DATA1,
    WAIT_DATA2
  };
  MidiState midiState = WAIT_STATUS;
  uint8_t currentStatus = 0;
  uint8_t dataBytes[2];
  unsigned long lastReceiveTime = 0;
  const unsigned long TIMEOUT_MS = 50;

  void handleMidiMessage(uint8_t status, uint8_t data1, uint8_t data2, LEDController &ledController, OledController &oled);

public:
  void processMidi(LEDController &ledController, OledController &oled);
  void resetState();
};

#endif
