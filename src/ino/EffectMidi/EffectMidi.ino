#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 115200

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

LEDController ledController(NUM_LEDS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;
CRGB leds[NUM_LEDS];

void setup()
{
  Serial.begin(SERIAL_BAUD);

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();

  ledController.stepAndShow();
}


void loop()
{
  bool noData = true;
  int currentByte = 0;
  // 尝试读取一个字节
  if (Serial.available() > 0)
  {
    currentByte = Serial.read();
    ledController.endWaiting();
    noData = false;
  }
  // 处理等待状态
  if (ledController.isWaiting())
  {
    WaitingCmd::getInstance(ledController).execute(nullptr);
  }
  // 处理当前字节
  cmdHolder.processByte(currentByte, noData, oled);
  ledController.stepAndShow();
}
