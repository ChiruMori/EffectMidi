#ifndef SERIAL_COMMAND_H
#define SERIAL_COMMAND_H
#define WAITING_COUNTER_MAX 128
#define DECLARE_COMMAND(ClassName) \
    void execute(const String &cmd) override; \
    String getName() override;

#include "LEDController.hpp"

/**
 * 串口指令基类
 */
class SerialCommand
{
public:
  /**
   * 执行指令
   */
  virtual void execute(const String &cmd) = 0;
  /**
   * 指令前缀
   */
  virtual String getName() = 0;

protected:
  SerialCommand(LEDController &ledController) : ledController(ledController) {}
  // 灯带控制器
  LEDController &ledController;
};

/**
 * 串口指令基类，拓展了用于解析颜色参数的方法
 */
class SerialRgbCommand : public SerialCommand
{
protected:
  SerialRgbCommand(LEDController &ledController) : SerialCommand(ledController) {}
  /**
   * 解析颜色参数
   */
  CRGB parseColor(const String &cmd);
};

/**
 * 等待指令
 */
class WaitingCmd : public SerialCommand
{
public:
  static WaitingCmd &getInstance(LEDController &ledController);
  DECLARE_COMMAND(WaitingCmd)

private:
  int counter = 0;
  WaitingCmd(LEDController &ledController) : SerialCommand(ledController) {}
};

/**
 * 设置前景色指令
 */
class SetForegroundColorCmd : public SerialRgbCommand
{
public:
  static SetForegroundColorCmd &getInstance(LEDController &ledController);
  DECLARE_COMMAND(WaitingCmd)

private:
  SetForegroundColorCmd(LEDController &ledController) : SerialRgbCommand(ledController) {}
};

/**
 * 设置背景色指令
 */
class SetBackgroundColorCmd : public SerialRgbCommand
{
public:
  static SetBackgroundColorCmd &getInstance(LEDController &ledController);
  DECLARE_COMMAND(WaitingCmd)

private:
  SetBackgroundColorCmd(LEDController &ledController) : SerialRgbCommand(ledController) {}
};

#endif
