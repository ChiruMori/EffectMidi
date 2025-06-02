#ifndef SERIAL_COMMAND_H
#define SERIAL_COMMAND_H
#define WAITING_COUNTER_MAX 256
#define WAIT_DELAY 10

#define CMD_BYTE_WAITING 0x00
#define CMD_BYTE_SET_FOREGROUND_COLOR 0x01
#define CMD_BYTE_SET_BACKGROUND_COLOR 0x02
#define CMD_BYTE_KEY_DOWN 0x03
#define CMD_BYTE_KEY_UP 0x04
#define CMD_BYTE_SET_RESIDUAL_TIME 0x05
#define CMD_BYTE_SET_DIFFUSION_WIDTH 0x06
#define CMD_BYTE_SET_END_LIGHTS_COLOR 0x07

#define CMD_OFFSET_KEY_DOWN 0x50
#define CMD_OFFSET_KEY_UP 0xa8

// 最大参数数量
#define MAX_ARG_COUNT 3

#define DECLARE_COMMAND(ClassName, BaseClass)                 \
public:                                                       \
  void execute(uint8_t *args) override;                       \
  uint8_t getNameByte() override;                             \
  uint8_t getArgCount() override;                             \
  static ClassName &getInstance(LEDController &ledController) \
  {                                                           \
    static ClassName instance(ledController);                 \
    return instance;                                          \
  }                                                           \
                                                              \
private:                                                      \
  ClassName(LEDController &ledController) : BaseClass(ledController) {}

#include "LedController.hpp"

/**
 * 串口指令基类
 */
class SerialCommand
{
public:
  /**
   * 执行指令
   */
  virtual void execute(uint8_t *args) = 0;
  /**
   * 指令识别字节
   */
  virtual uint8_t getNameByte() = 0;
  /**
   * 需要的参数数量
   */
  virtual uint8_t getArgCount() = 0;

protected:
  SerialCommand(LEDController &ledController) : ledController(ledController) {}
  // 灯带控制器
  LEDController &ledController;
};

/**
 * 等待指令
 */
class WaitingCmd : public SerialCommand
{
  DECLARE_COMMAND(WaitingCmd, SerialCommand)
  int counter = 0;
};

/**
 * 设置前景色指令
 */
class SetForegroundColorCmd : public SerialCommand
{
  DECLARE_COMMAND(SetForegroundColorCmd, SerialCommand)
};

/**
 * 设置背景色指令
 */
class SetBackgroundColorCmd : public SerialCommand
{
  DECLARE_COMMAND(SetBackgroundColorCmd, SerialCommand)
};

/**
 * 按键按下指令
 */
class KeyDownCommand : public SerialCommand
{
  DECLARE_COMMAND(KeyDownCommand, SerialCommand)
};

/**
 * 按键松开指令
 */
class KeyUpCommand : public SerialCommand
{
  DECLARE_COMMAND(KeyUpCommand, SerialCommand)
};

/**
 * 设置残留时间指令
 */
class SetResidualTimeCmd : public SerialCommand
{
  DECLARE_COMMAND(SetResidualTimeCmd, SerialCommand)
};

/**
 * 设置扩散宽度指令
 */
class SetDiffusionWidthCmd : public SerialCommand
{
  DECLARE_COMMAND(SetDiffusionWidthCmd, SerialCommand)
};

/**
 * 设置端点灯颜色指令
 */
class SetEndLightsColorCmd : public SerialCommand
{
  DECLARE_COMMAND(SetEndLightsColorCmd, SerialCommand)
};

#endif
