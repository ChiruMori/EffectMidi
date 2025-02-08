#include "headers/SerialCommand.hpp"

// 按键按下指令

void KeyDownCommand::execute(uint8_t * args)
{
  auto keyIndex = args[0];
  ledController.pressKey(keyIndex);
}

uint8_t KeyDownCommand::getNameByte()
{
  return CMD_BYTE_KEY_DOWN;
}

uint8_t KeyDownCommand::getArgCount()
{
  return 1;
}

// 按键松开指令

void KeyUpCommand::execute(uint8_t * args)
{
  auto keyIndex = args[0];
  ledController.releaseKey(keyIndex);
}

uint8_t KeyUpCommand::getNameByte()
{
  return CMD_BYTE_KEY_UP;
}

uint8_t KeyUpCommand::getArgCount()
{
  return 1;
}
