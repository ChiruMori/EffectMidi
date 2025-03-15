#include "headers/MidiHandler.hpp"
#include "headers/SerialCommand.hpp"

void MidiHandler::resetState()
{
  midiState = WAIT_STATUS;
  currentStatus = 0;
  memset(dataBytes, 0, sizeof(dataBytes));
}

void MidiHandler::handleMidiMessage(uint8_t status, uint8_t data1, uint8_t data2, LEDController &ledController, OledController &oled)
{
  // 键值范围校验
  if (data1 < 21 || data1 > 108)
  {
    return;
  }

  uint8_t key = data1 - 21;
  uint8_t eventType = status & 0xF0;

  // 事件处理
  if (eventType == 0x90)
  {
    if (data2 > 0)
    {
      KeyDownCommand::getInstance(ledController).execute(&key);
      // oled.log("KD [" + String(status) + ", " + String(data1) + ", " + String(data2) + "]");
    }
    else
    {
      KeyUpCommand::getInstance(ledController).execute(&key);
      // oled.log("KD0 [" + String(status) + ", " + String(data1) + ", " + String(data2) + "]");
    }
  }
  else if (eventType == 0x80)
  {
    KeyUpCommand::getInstance(ledController).execute(&key);
    // oled.log("KU [" + String(status) + ", " + String(data1) + ", " + String(data2) + "]");
  }
}

void MidiHandler::processMidi(LEDController &ledController, OledController &oled)
{
  // 超时复位
  if (millis() - lastReceiveTime > TIMEOUT_MS)
  {
    resetState();
  }

  while (Serial1.available() > 0)
  {

    lastReceiveTime = millis();
    uint8_t byte = Serial1.read();
    // oled.log("Midi [" + String(byte, HEX) + "]");

    // 软件去抖：状态字节必须带最高位
    if (midiState == WAIT_STATUS && !(byte & 0x80))
    {
      continue;
    }

    switch (midiState)
    {
    case WAIT_STATUS:
      // 是状态字节
      if (byte & 0x80)
      {
        currentStatus = byte;
        midiState = WAIT_DATA1;
      }
      break;
    case WAIT_DATA1:
      dataBytes[0] = byte;
      // 根据MIDI消息类型判断是否需要第二个数据字节
      // Note On/Off需要2数据字节，Program Change只需1字节
      if ((currentStatus & 0xF0) == 0xC0 || (currentStatus & 0xF0) == 0xD0)
      {
        handleMidiMessage(currentStatus, dataBytes[0], 0, ledController, oled);
        midiState = WAIT_STATUS;
      }
      else
      {
        midiState = WAIT_DATA2;
      }
      break;
    case WAIT_DATA2:
      dataBytes[1] = byte;
      handleMidiMessage(currentStatus, dataBytes[0], dataBytes[1], ledController, oled);
      midiState = WAIT_STATUS;
      break;
    }
  }
}
