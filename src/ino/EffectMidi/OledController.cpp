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
  auto strToLog = String("D.") + String(leadByte) + ":";
  for (int i = 0; i < length; ++i)
  {
    strToLog += String(data[i], HEX) + " ";
  }
  this->log(strToLog);
#endif
}

void OledController::log(String message)
{
#ifdef USE_OLED
  static const int MAX_LINES = 4;
  static String logLines[MAX_LINES];
  static int lineIndex = 0;
  logLines[lineIndex] = message;
  oled->clearDisplay();
  oled->setCursor(0, 0);
  for(int i = 0; i < MAX_LINES; i++) {
    int currentLine = (lineIndex + i) % MAX_LINES;
    if(!logLines[currentLine].isEmpty()) {
      oled->setCursor(0, i * 8);
      oled->println(logLines[currentLine]);
    }
  }
  lineIndex = (lineIndex + 1) % MAX_LINES;
  oled->display();
#endif
}

void OledController::setup()
{
#ifdef USE_OLED
  // I2C引脚配置（按需使用），以下为 RP2040 专用I2C初始化方式
  Wire.setSDA(OLED_SDA_PIN);
  Wire.setSCL(OLED_SCL_PIN);
  Wire.begin();
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

void OledController::logMemory()
{
#ifdef USE_OLED
  extern int __heap_start, *__brkval;
  int free_memory;
  if ((int)__brkval == 0)
  {
    free_memory = (int)&free_memory - (int)&__heap_start;
  }
  else
  {
    free_memory = (int)&free_memory - (int)__brkval;
  }
  this->log("Free memory: " + String(free_memory));
#endif
}
