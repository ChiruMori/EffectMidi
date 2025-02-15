#include "headers/OledController.hpp"

OledController::~OledController()
{
  if (oled != nullptr)
  {
    delete oled;
    oled = nullptr;
    Serial.println("OLED deleted");
  }
}

void OledController::displayData(uint8_t leadByte, uint8_t *data, int length)
{
  oled->clearDisplay();
  oled->setCursor(0, 0);
  oled->print("Received: ");
  oled->print(leadByte);
  oled->print(": ");
  for (int i = 0; i < length; ++i)
  {
    oled->print(data[i]);
    oled->print(" ");
  }
  oled->display();
}

void OledController::setup()
{
  oled = new Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  if (!oled)
  {
    Serial.println("Failed to allocate memory for OLED.");
    return; // 如果分配失败，退出 setup
  }
  Serial.println("OLED setup");
  // 初始化 OLED
  if (!oled->begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
  {
    Serial.println("Failed to initialize OLED.");
    delete oled;    // 清理内存
    oled = nullptr; // 避免悬空指针
    return;         // 如果初始化失败，退出 setup
  }

  oled->clearDisplay();
  oled->setTextSize(1);
  oled->setTextColor(SSD1306_WHITE);
  Serial.println("OLED setup done");
}
