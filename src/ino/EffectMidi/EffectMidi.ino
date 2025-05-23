#include <FastLED.h>
#include <Adafruit_TinyUSB.h>
#include "headers/PinDefine.hpp"
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define LED_COUNTS 178
#define SERIAL_BAUD 115200
// 使用 PID.org 推荐 https://pid.codes/1209/，PID 使用测试区间 0x0000 ~ 0x0FFF
#define USB_HIB_VID 0x1209
#define USB_HIB_PID 0x0666

LEDController ledController(LED_COUNTS);
SerialCommandHolder cmdHolder(ledController);
Adafruit_USBD_HID usbHid;
OledController oled;

// HID 报告描述符（自定义设备）
uint8_t const descHidReport[] = {
    0x06, 0x00, 0xFF, // Usage Page (Vendor Defined 0xFF00)
    0x09, 0x01,       // Usage (0x01)
    0xA1, 0x01,       // Collection (Application)
    // 控制指令，最多 16 字节一起发送
    0x85, 0x01,       //   Report ID (1)
    0x15, 0x00,       //   Logical Minimum (0)
    0x26, 0xFF, 0x00, //   Logical Maximum (255)
    0x75, 0x08,       //   Report Size (8 bits)
    0x95, 0x16,       //   Report Count (16 bytes)
    0x09, 0x00,       //   Usage (Undefined)
    0x91, 0x02,       //   Output (Data,Var,Abs)
    // 键盘指令，每个指令都是 1 字节
    0x85, 0x02,       //   Report ID (2)
    0x15, 0x00,       //   Logical Minimum (0)
    0x26, 0xFF, 0x00, //   Logical Maximum (255)
    0x75, 0x08,       //   Report Size (8 bits)
    0x95, 0x01,       //   Report Count (1 byte)
    0x09, 0x00,       //   Usage (Undefined)
    0x91, 0x02,       //   Output (Data,Var,Abs)
    0xC0              // End Collection
};

void reportReceivedCallback(uint8_t instance, hid_report_type_t report_type, uint8_t const *report, uint16_t len)
{
  // 未开启 HID 设备，直接返回
  if (digitalRead(USB_HID_SWITCH_PIN) == HIGH)
  {
    return;
  }
  ledController.endWaiting();
  // 处理 HID 报告数据
  for (uint16_t i = 0; i < len; i++)
  {
    cmdHolder.processByte(report[i], false, oled);
  }
  return;
}

void setup()
{
  Serial.begin(SERIAL_BAUD);
  // 监听 USB_HID_SWITCH_PIN 的状态变化
  pinMode(USB_HID_SWITCH_PIN, INPUT_PULLUP);
  // attachInterrupt(digitalPinToInterrupt(USB_HID_SWITCH_PIN), handleUsbHidSwitch, CHANGE);

  TinyUSBDevice.setID(USB_HIB_VID, USB_HIB_PID);
  TinyUSBDevice.setManufacturerDescriptor("EffectMidi");
  TinyUSBDevice.setProductDescriptor("EffectMidi HID CTRL V1.0");
  TinyUSBDevice.setSerialDescriptor("SN-2025-EM-001");

  usbHid.setReportCallback(nullptr, reportReceivedCallback);
  usbHid.setPollInterval(10);
  usbHid.setReportDescriptor(descHidReport, sizeof(descHidReport));
  usbHid.begin();

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();

  ledController.stepAndShow();
}

void handleSerial()
{
  bool noData = true;
  while (Serial.available() > 0)
  {
    int currentByte = Serial.read();
    ledController.endWaiting();
    cmdHolder.processByte(currentByte, false, oled);
    noData = false;
  }

  if (ledController.isWaiting())
  {
    WaitingCmd::getInstance(ledController).execute(nullptr);
  }

  if (noData)
  {
    cmdHolder.processByte(-1, true, oled);
  }
}

void loop()
{
  // 检查 USB_HID_SWITCH_PIN 的状态，默认上拉为高电平
  bool usbHidMode = digitalRead(USB_HID_SWITCH_PIN) == LOW;
  if (usbHidMode)
  {
    // usbHidKeepAlive();
    // 如果串口有数据，直接丢弃
    while (Serial.available() > 0)
    {
      int currentByte = Serial.read();
      oled.log("DISCARD: " + String(currentByte));
    }
    // 等待初始化时，启用端点灯呼吸效果
    if (ledController.isWaiting())
    {
      WaitingCmd::getInstance(ledController).execute(nullptr);
    }
  }
  else
  {
    handleSerial();
  }
  ledController.stepAndShow();
}
