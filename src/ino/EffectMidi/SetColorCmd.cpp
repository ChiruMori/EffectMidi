#include "headers/SerialCommand.hpp"

// 背景色指令

void SetBackgroundColorCmd::execute(uint8_t *args)
{
  ledController.setBackgroundColor(CRGB(args[0], args[1], args[2]));
}

uint8_t SetBackgroundColorCmd::getNameByte()
{
  return CMD_BYTE_SET_BACKGROUND_COLOR;
}

uint8_t SetBackgroundColorCmd::getArgCount()
{
  return 3;
}

// 前景色指令

void SetForegroundColorCmd::execute(uint8_t *args)
{
  ledController.setForegroundColor(CRGB(args[0], args[1], args[2]));
}

uint8_t SetForegroundColorCmd::getNameByte()
{
  return CMD_BYTE_SET_FOREGROUND_COLOR;
}

uint8_t SetForegroundColorCmd::getArgCount()
{
  return 3;
}

// 设置端点灯颜色指令

void SetEndLightsColorCmd::execute(uint8_t *args)
{
  ledController.setEndLightsColor(CRGB(args[0], args[1], args[2]), false);
}

uint8_t SetEndLightsColorCmd::getNameByte()
{
  return CMD_BYTE_SET_END_LIGHTS_COLOR;
}

uint8_t SetEndLightsColorCmd::getArgCount()
{
  return 3;
}
