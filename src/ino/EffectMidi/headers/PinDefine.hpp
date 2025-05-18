#ifndef PIN_DEFINE_HPP
#define PIN_DEFINE_HPP

/// 集中管理开发板的引脚定义

// 添加SPI引脚定义（仅针对RP2040）
// 项目中并未使用它们，仅用于停止警告
#ifdef ARDUINO_ARCH_RP2040
  #define SPI_MOSI 3
  #define SPI_SCK 2
#endif

// OLED SDA引脚
#define OLED_SDA_PIN 4
// OLED SCL引脚
#define OLED_SCL_PIN 5
// 切换是否使用USB HID模式，高电平（默认上拉）时使用串口模式，低电平时使用USB HID模式
#define USB_HID_SWITCH_PIN 6
// 灯带数据引脚
#define DIGITAL_PIN 7

#endif
