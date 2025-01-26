#include "headers/SerialCommand.hpp"

void SetForegroundColorCmd::execute(const String &cmd)
{
  auto color = parseColor(cmd);
  ledController.setForegroundColor(color);
}

String SetForegroundColorCmd::getName()
{
  return "F_COLOR";
}

SetForegroundColorCmd &SetForegroundColorCmd::getInstance(LEDController &ledController)
{
  static SetForegroundColorCmd instance(ledController);
  return instance;
}
