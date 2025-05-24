#include "headers/UsbController.hpp"

// HID 报告描述符（自定义设备）
uint8_t const descHidReport[] = {
    0x06, 0x00, 0xFF, // Usage Page (Vendor Defined 0xFF00)
    0x09, 0x01,       // Usage (0x01)
    0xA1, 0x01,       // Collection (Application)
    // 控制指令，每个指令均为 4 字节
    0x85, 0x01,       //   Report ID (1)
    0x15, 0x00,       //   Logical Minimum (0)
    0x26, 0xFF, 0x00, //   Logical Maximum (255)
    0x75, 0x08,       //   Report Size (8 bits)
    0x95, 0x04,       //   Report Count (4 bytes)
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

// 单独定义静态成员变量
UsbController* UsbController::instance = nullptr;
Adafruit_USBD_HID usbHid;

void handle(uint8_t instance, hid_report_type_t report_type, uint8_t const *report, uint16_t len)
{
  // 指示灯闪烁
  digitalWrite(RUNNING_PIN, HIGH);
  // 使用全局实例
  if (UsbController::instance)
  {
    {
      UsbController::instance->ledController.endWaiting();
      // 处理 HID 报告数据
      for (uint16_t i = 0; i < len; i++)
      {
        UsbController::instance->cmdHolder.processByte(report[i], false, UsbController::instance->oled);
      }
    }
  }
  // 指示灯闪烁
  digitalWrite(RUNNING_PIN, LOW);
}

void UsbController::setup()
{
  if (instance == nullptr)
  {
    instance = this;
  }
  else
  {
    instance->oled.log("Multiple instances!");
    return;
  }

  TinyUSBDevice.setID(USB_HIB_VID, USB_HIB_PID);
  TinyUSBDevice.setManufacturerDescriptor("EffectMidi");
  TinyUSBDevice.setProductDescriptor("EffectMidi HID CTRL V1.0");
  TinyUSBDevice.setSerialDescriptor("SN-2025-EM-001");

  // 将 setReportCallback 的第二个参数指定为 UsbController 的 handle 方法
  usbHid.setReportCallback(nullptr, handle);
  usbHid.setPollInterval(10);
  usbHid.setReportDescriptor(descHidReport, sizeof(descHidReport));
  usbHid.begin();
}
