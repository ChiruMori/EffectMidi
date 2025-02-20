#include "headers/OledController.hpp"

OledController::~OledController()
{
#ifdef USE_OLED
  if (oled != nullptr)
  {
    delete oled;
    oled = nullptr;
    Serial.println("OLED deleted");
  }
#endif
}

void OledController::displayData(uint8_t leadByte, uint8_t *data, int length)
{
#ifdef USE_OLED
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
#endif
}

void OledController::log(String message)
{
#ifdef USE_OLED
  oled->clearDisplay();
  oled->setCursor(0, 0);
  oled->print(message);
  oled->display();
#endif
}

void OledController::setup()
{
#ifdef USE_OLED
  oled = new Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  if (!oled)
  {
    Serial.println("Failed to allocate memory for OLED.");
    return;
  }
  // 初始化 OLED
  if (!oled->begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
  {
    Serial.println("Failed to initialize OLED.");
    delete oled;
    oled = nullptr;
    return;
  }

  oled->clearDisplay();
  oled->setTextSize(1);
  oled->setTextColor(SSD1306_WHITE);
  this->log("OLED initialized.");
#endif
}
