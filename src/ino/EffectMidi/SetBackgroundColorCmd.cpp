#include "headers/SerialCommand.hpp"

void SetBackgroundColorCmd::execute(const String &cmd)
{
  auto color = parseColor(cmd);
  ledController.setBackgroundColor(color);
}

String SetBackgroundColorCmd::getName()
{
  return "B_COLOR";
}

SetBackgroundColorCmd &SetBackgroundColorCmd::getInstance(LEDController &ledController)
{
  static SetBackgroundColorCmd instance(ledController);
  return instance;
}
