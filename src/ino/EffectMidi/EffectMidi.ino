#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 19200

LEDController ledController(NUM_LEDS);
SerialCommandHolder cmdHolder(ledController);

void setup()
{
  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  Serial.begin(SERIAL_BAUD);
}

void loop()
{
  if (Serial.available())
  {
    // 读取指令字符串
    String commandStr = Serial.readString();
    commandStr.trim();
    // 获取指令对象
    SerialCommand *command = cmdHolder.getCommand(commandStr);
    if (command)
    {
      command->execute(commandStr);
    }
  }
  ledController.show();
}
