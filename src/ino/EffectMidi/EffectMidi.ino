#include <FastLED.h>
#include "headers/PinDefine.hpp"
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/UsbController.hpp"
#include "headers/OledController.hpp"

#define LED_COUNTS 178

LEDController ledController(LED_COUNTS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;
UsbController usb(ledController, cmdHolder, oled);


void setup()
{
  pinMode(RUNNING_PIN, OUTPUT);
  digitalWrite(RUNNING_PIN, HIGH);
  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();
  ledController.stepAndShow();
  usb.setup();
  // 初始化完毕，熄灭指示灯
  digitalWrite(RUNNING_PIN, LOW);
}

void loop()
{
  // 等待初始化时，启用端点灯呼吸效果
  if (ledController.isWaiting())
  {
    WaitingCmd::getInstance(ledController).execute(nullptr);
  }
  ledController.stepAndShow();
}
