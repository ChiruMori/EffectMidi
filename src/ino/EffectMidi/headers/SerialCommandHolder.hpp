#ifndef COMMAND_FACTORY_H
#define COMMAND_FACTORY_H
#define COMMAND_NUM 10
#define SUCCESS_RESP_BYTE 0x00
#define FAIL_RESP_BYTE 0x01
#define TIMEOUT_RESP_BYTE -1

// state 大于 0 时表示正在读取参数
// 等待指令字节
#define STATE_INIT -1
// 解析单条指令的超时时间（ms）
#define COMMAND_PARSE_TIMEOUT 300

#include "SerialCommand.hpp"
#include "LedController.hpp"
#include "OledController.hpp"

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
  SerialCommand *getCommand(int cmdNameByte);
  /**
   * 字节处理（状态机）
   */
  void processByte(int byte, bool noData, OledController &oled);

private:
  // 灯带控制器
  LEDController &ledController;
  // 指令数组
  SerialCommand **commands;
  // 注册单条指令
  void registerCommand(SerialCommand *command);
  // 指令参数缓冲区
  uint8_t argsBuffer[MAX_ARG_COUNT];
  // 指令状态
  int state;
  // 当前正在解析的指令
  SerialCommand *currentCommand;
  // 指令解析起始时间
  unsigned long startTime;
};

#endif
