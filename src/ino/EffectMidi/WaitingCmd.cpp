#include "headers/SerialCommand.hpp"

void WaitingCmd::execute(const String &cmd)
{
  // 使端点灯闪烁（忽略端点灯设置）
  int realBrightness = counter > WAITING_COUNTER_MAX ? WAITING_COUNTER_MAX * 2 - counter : counter;
  CRGB color = CRGB(realBrightness, realBrightness, realBrightness);
  ledController.setEndLightsColor(color);
  counter = (counter + 1) % WAITING_COUNTER_MAX;
};

String WaitingCmd::getName()
{
  return "WAIT";
}

WaitingCmd &WaitingCmd::getInstance(LEDController &ledController)
{
  static WaitingCmd instance(ledController);
  return instance;
}
