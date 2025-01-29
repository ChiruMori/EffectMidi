#ifndef COMMAND_FACTORY_H
#define COMMAND_FACTORY_H
#define COMMAND_NUM 10

#include "SerialCommand.hpp"
#include "LedController.hpp"

class SerialCommandHolder
{
public:
  SerialCommandHolder(LEDController &ledController);
  /**
   * 创建所有指令
   */
  void createAllCommands(LEDController &ledController);
  /**
   * 获取能够执行指定字符串的指令
   */
  SerialCommand *getCommand(uint8_t cmdNameByte);

private:
  // 灯带控制器
  LEDController &ledController;
  // 指令数组
  SerialCommand **commands;
  // 注册单条指令
  void registerCommand(SerialCommand *command);
};

#endif
