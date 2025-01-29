#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 19200
#define MAX_ARG_COUNT 3

LEDController ledController(NUM_LEDS);
SerialCommandHolder cmdHolder(ledController);
uint8_t argsBuffer[MAX_ARG_COUNT];

void setup()
{
  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  Serial.begin(SERIAL_BAUD);
  ledController.show();
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
      Serial.readBytes(argsBuffer, argCount);
    }
    command->execute(argsBuffer);
  }
  // 不再等待时，点亮灯带
  if (!ledController.isWaiting() || cmdNameByte == 0)
  {
    ledController.show();
  }
}
