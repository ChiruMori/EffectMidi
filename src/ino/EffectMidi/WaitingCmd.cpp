#include "headers/SerialCommand.hpp"

void WaitingCmd::execute(uint8_t *args)
{
  // 仅在等待状态下执行
  if (ledController.isWaiting())
  {
    // 使端点灯闪烁（忽略端点灯设置）
    int realBrightness = counter > (WAITING_COUNTER_MAX / 2) ? WAITING_COUNTER_MAX - counter : counter;
    CRGB color = CRGB(realBrightness, realBrightness, realBrightness);
    ledController.setEndLightsColor(color);
    counter = (counter + 1) % WAITING_COUNTER_MAX;
  }
  delay(WAIT_DELAY);
};

uint8_t WaitingCmd::getNameByte()
{
  return CMD_BYTE_WAITING;
}

uint8_t WaitingCmd::getArgCount()
{
  return 0;
}
