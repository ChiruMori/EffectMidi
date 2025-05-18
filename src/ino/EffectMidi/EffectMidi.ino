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

// HID报告描述符
uint8_t const descHidReport[] = {TUD_HID_REPORT_DESC_KEYBOARD()};

void reportReceivedCallback(uint8_t instance, hid_report_type_t report_type, uint8_t const *report, uint16_t len)
{
  // 未开启 HID 设备，直接返回
  if (digitalRead(USB_HID_SWITCH_PIN) == HIGH) {
    return;
  }
  ledController.endWaiting();
  // 处理 HID 报告数据
  for (uint16_t i = 0; i < len; i++) {
    cmdHolder.processByte(report[i], false, oled);
  }
}

void setup()
{
  Serial.begin(SERIAL_BAUD);
  // 监听 USB_HID_SWITCH_PIN 的状态变化
  pinMode(USB_HID_SWITCH_PIN, INPUT_PULLUP);
  // attachInterrupt(digitalPinToInterrupt(USB_HID_SWITCH_PIN), handleUsbHidSwitch, CHANGE);

  TinyUSBDevice.setID(USB_HIB_VID, USB_HIB_PID);
  TinyUSBDevice.setManufacturerDescriptor("EffectMidi");
  TinyUSBDevice.setProductDescriptor("Midi Led Effect Controller");

  usbHid.setReportCallback(NULL, reportReceivedCallback);
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

  ledController.stepAndShow();
}

void usbHidKeepAlive()
{
  if (usbHid.ready())
  {
    // 保持连接心跳
    static uint32_t lastHeartbeat = 0;
    if (millis() - lastHeartbeat > 1000)
    {

      usbHid.sendReport(0, nullptr, 0);
      lastHeartbeat = millis();
    }
  }
}

void loop()
{
  // 检查 USB_HID_SWITCH_PIN 的状态，默认上拉为高电平
  bool usbHidMode = digitalRead(USB_HID_SWITCH_PIN) == LOW;
  if (usbHidMode)
  {
    usbHidKeepAlive();
  }
  else
  {
    handleSerial();
  }
}
