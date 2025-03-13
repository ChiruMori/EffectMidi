#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define LED_COUNTS 178
#define SERIAL_BAUD 115200
#define MIDI_BAUD 31250

LEDController ledController(LED_COUNTS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;
// 参考
// https://docs.arduino.cc/built-in-examples/communication/Midi/
// https://www.notesandvolts.com/2012/01/fun-with-arduino-midi-input-basics.html
uint8_t midiBuf[3];

void setup()
{
  Serial.begin(SERIAL_BAUD);
  // RX1用于MIDI输入
  Serial1.begin(MIDI_BAUD);

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();
  // 为指拨开关，控制是否响应按键指令，低电平时响应
  // 可在该串口添加指示灯，灯亮时表示以MIDI模式工作，灯灭时表示以串口指令模式工作
  pinMode(KEY_SWITCH_PIN, INPUT_PULLUP);
  ledController.stepAndShow();
}

void loop() {
  int midiBufIndex = 0;
  while(Serial1.available() > 0 && midiBufIndex < 3) {
    // 读取全部MIDI输入，显示到 oled
    int currentByte = Serial1.read();
    midiBuf[midiBufIndex++] = currentByte;
  }
  if (midiBufIndex > 0) {
    oled.displayData(0xf8, midiBuf, midiBufIndex);
  }

  bool noData = true;
  while(Serial.available() > 0) {
    int currentByte = Serial.read();
    ledController.endWaiting();
    cmdHolder.processByte(currentByte, false, oled);
    noData = false;
  }

  if(ledController.isWaiting()) {
    WaitingCmd::getInstance(ledController).execute(nullptr);
  }

  if (noData) {
    cmdHolder.processByte(-1, true, oled);
  }

  ledController.stepAndShow();
}
