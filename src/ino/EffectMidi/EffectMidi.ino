#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define LED_COUNTS 178
#define SERIAL_BAUD 115200

LEDController ledController(LED_COUNTS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;

void setup()
{
  Serial.begin(SERIAL_BAUD);

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();
  // 为指拨开关，控制是否响应按键指令，低电平时响应
  // 可在该串口添加指示灯，灯亮时表示以MIDI模式工作，灯灭时表示以串口指令模式工作
  pinMode(KEY_SWITCH_PIN, INPUT_PULLUP);
  ledController.stepAndShow();
}

void loop() {
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
