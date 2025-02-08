#include "headers/SerialCommand.hpp"

// 设置亮度指令

void SetBrightnessCmd::execute(uint8_t *args)
{
  ledController.setBrightness(args[0]);
}

uint8_t SetBrightnessCmd::getNameByte()
{
  return CMD_BYTE_SET_BRIGHTNESS;
}

uint8_t SetBrightnessCmd::getArgCount()
{
  return 1;
}

// 设置残留时间指令

void SetResidualTimeCmd::execute(uint8_t *args)
{
  ledController.setResidualTime(args[0]);
}

uint8_t SetResidualTimeCmd::getNameByte()
{
  return CMD_BYTE_SET_RESIDUAL_TIME;
}

uint8_t SetResidualTimeCmd::getArgCount()
{
  return 1;
}

// 设置扩散宽度指令

void SetDiffusionWidthCmd::execute(uint8_t *args)
{
  ledController.setDiffusionWidth(args[0]);
}

uint8_t SetDiffusionWidthCmd::getNameByte()
{
  return CMD_BYTE_SET_DIFFUSION_WIDTH;
}

uint8_t SetDiffusionWidthCmd::getArgCount()
{
  return 1;
}
