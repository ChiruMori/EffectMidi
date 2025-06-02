#ifndef USBCONTROLLER_HPP
#define USBCONTROLLER_HPP

#include <Adafruit_TinyUSB.h>
#include "LedController.hpp"
#include "SerialCommandHolder.hpp"
#include "OledController.hpp"
// 使用 PID.org 推荐 https://pid.codes/1209/，PID 使用测试区间 0x0000 ~ 0x0FFF
#define USB_HIB_VID 0x1209
#define USB_HIB_PID 0x0666

class UsbController
{
public:
  /**
   * 允许 handle 访问私有成员
   */
  friend void handle(uint8_t instance, hid_report_type_t report_type, uint8_t const *report, uint16_t len);

  UsbController(LEDController &ledController, SerialCommandHolder &cmdHolder, OledController &oled)
      : ledController(ledController), cmdHolder(cmdHolder), oled(oled) {}

  /**
   * 初始化 USB 控制器，需要在 setup 中调用
   */
  void setup();

  /**
   * 静态指针
   */
  static UsbController *instance;

private:
  // 灯带控制器
  LEDController &ledController;
  // 指令容器
  SerialCommandHolder &cmdHolder;
  // OLED
  OledController &oled;
};

#endif
