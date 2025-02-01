#ifndef SERIAL_COMMAND_H
#define SERIAL_COMMAND_H
#define WAITING_COUNTER_MAX 256
#define WAIT_DELAY 10
#define CMD_BYTE_WAITING 0x00
#define CMD_BYTE_SET_FOREGROUND_COLOR 0x01
#define CMD_BYTE_SET_BACKGROUND_COLOR 0x02
#define CMD_BYTE_KEY_DOWN 0x03
#define CMD_BYTE_KEY_UP 0x04
#define CMD_BYTE_SET_BRIGHTNESS 0x05
#define CMD_BYTE_SET_RESIDUAL_TIME 0x06
#define CMD_BYTE_SET_DIFFUSION_WIDTH 0x07
#define CMD_BYTE_SET_END_LIGHTS_COLOR 0x08
#define CMD_BYTE_COLOR_PREVIEW 0x09

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
  // 调试输出到控制台
  void debug(const String &msg);
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
 * 设置亮度指令
 */
class SetBrightnessCmd : public SerialCommand
{
  DECLARE_COMMAND(SetBrightnessCmd, SerialCommand)
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

/**
 * 颜色预览指令
 */
class ColorPreviewCmd : public SerialCommand
{
  DECLARE_COMMAND(ColorPreviewCmd, SerialCommand)
};

#endif
