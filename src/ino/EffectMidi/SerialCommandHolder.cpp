#include "headers/SerialCommandHolder.hpp"

SerialCommandHolder::SerialCommandHolder(LEDController &ledController) : ledController(ledController), commandCount(0)
{
  commands = new SerialCommand *[COMMAND_NUM];
}

void SerialCommandHolder::registerCommand(SerialCommand *command)
{
  commands[commandCount++] = command;
}

void SerialCommandHolder::createAllCommands(LEDController &ledController)
{
  registerCommand(&WaitingCmd::getInstance(ledController));
  registerCommand(&SetBackgroundColorCmd::getInstance(ledController));
  registerCommand(&SetForegroundColorCmd::getInstance(ledController));
}

SerialCommand *SerialCommandHolder::getCommand(const String &commandStr)
{
  int cmdIndex = commandStr.indexOf(' ');
  String cmdName = commandStr.substring(0, cmdIndex);
  for (int i = 0; i < commandCount; ++i)
  {
    if (commands[i]->getName() == cmdName)
    {
      return commands[i];
    }
  }
}
