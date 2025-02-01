#include "headers/SerialCommandHolder.hpp"

SerialCommandHolder::SerialCommandHolder(LEDController &ledController) : ledController(ledController)
{
  commands = new SerialCommand *[COMMAND_NUM];
  for (int i = 0; i < COMMAND_NUM; ++i)
  {
    commands[i] = nullptr;
  }
}

void SerialCommandHolder::registerCommand(SerialCommand *command)
{
  commands[command->getNameByte()] = command;
}

void SerialCommandHolder::createAllCommands(LEDController &ledController)
{
  registerCommand(&WaitingCmd::getInstance(ledController));
  registerCommand(&SetBackgroundColorCmd::getInstance(ledController));
  registerCommand(&SetForegroundColorCmd::getInstance(ledController));
  registerCommand(&KeyDownCommand::getInstance(ledController));
  registerCommand(&KeyUpCommand::getInstance(ledController));
  registerCommand(&SetBrightnessCmd::getInstance(ledController));
  registerCommand(&SetResidualTimeCmd::getInstance(ledController));
  registerCommand(&SetDiffusionWidthCmd::getInstance(ledController));
  registerCommand(&SetEndLightsColorCmd::getInstance(ledController));
  registerCommand(&ColorPreviewCmd::getInstance(ledController));
}

SerialCommand *SerialCommandHolder::getCommand(const uint8_t cmdNameByte)
{
  if (commands[cmdNameByte])
  {
    if (cmdNameByte != CMD_BYTE_WAITING)
    {
      Serial.println("Get command: " + String(int(cmdNameByte)));
    }
    return commands[cmdNameByte];
  }
  return nullptr;
}
