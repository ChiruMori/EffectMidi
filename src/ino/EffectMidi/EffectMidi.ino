#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 19200
#define MAX_ARG_COUNT 3
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

LEDController ledController(NUM_LEDS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;
uint8_t argsBuffer[MAX_ARG_COUNT];

void setup()
{
  Serial.begin(SERIAL_BAUD);
  Serial.println("Setup");

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();

  ledController.stepAndShow();
  Serial.println("Setup complete");
}

void loop()
{
  uint8_t cmdNameByte = 0;
  if (Serial.available())
  {
    // 读取指令字符串
    Serial.readBytes(&cmdNameByte, 1);
    ledController.endWaiting();
  }

  // 获取指令对象
  SerialCommand *command = cmdHolder.getCommand(cmdNameByte);
  if (command != nullptr)
  {
    auto argCount = command->getArgCount();
    if (argCount > 0)
    {
      memset(argsBuffer, 0, sizeof(argsBuffer)); // 清空缓冲区
      while (Serial.available() < argCount) {
        delay(1); // 等待数据
      }
      Serial.readBytes(argsBuffer, argCount);
    }
    command->execute(argsBuffer);

    // 在此处调用 displayData 来在 OLED 上显示数据
    if (cmdNameByte != CMD_BYTE_WAITING)
    {
      oled.displayData(cmdNameByte, argsBuffer, argCount);
      Serial.write(0x00);
    }
  }

  // 不再等待时，点亮灯带
  if (!ledController.isWaiting() || cmdNameByte == 0)
  {
    ledController.stepAndShow();
  }
}
