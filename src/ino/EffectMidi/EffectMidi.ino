#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 19200
#define MAX_ARG_COUNT 3
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// #ifdef USE_OLED
Adafruit_SSD1306 *oled = nullptr;
// #endif

// OledController::~OledController()
// {
// if (oled != nullptr)
// {
//   delete oledDisplay;
//   oledDisplay = nullptr;
//   Serial.println("OLED deleted");
// }
// }

void oledDisplayData(uint8_t leadByte, uint8_t *data, int length)
// void OledController::displayData(uint8_t leadByte, uint8_t *data, int length)
{
  // oledDisplay->clearDisplay();
  // oledDisplay->setCursor(0, 0);
  // oledDisplay->print("Received: ");
  // oledDisplay->print(leadByte);
  // oledDisplay->print(": ");
  // for (int i = 0; i < length; ++i)
  // {
  //   oledDisplay->print(data[i]);
  //   oledDisplay->print(" ");
  // }
  // oledDisplay->display();
}

void oledSetup()
// void OledController::setup()
{
  // oledDisplay = new Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
  // if (!oledDisplay)
  // {
  //   Serial.println("Failed to allocate memory for OLED.");
  //   return; // 如果分配失败，退出 setup
  // }
  // Serial.println("OLED setup");
  // // 初始化 OLED
  // if (!oledDisplay->begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
  // {
  //   Serial.println("Failed to initialize OLED.");
  //   delete oledDisplay;    // 清理内存
  //   oledDisplay = nullptr; // 避免悬空指针
  //   return;                // 如果初始化失败，退出 setup
  // }

  // oledDisplay->clearDisplay();
  // oledDisplay->setTextSize(1);
  // oledDisplay->setTextColor(SSD1306_WHITE);
  // Serial.println("OLED setup done");
  oled = new Adafruit_SSD1306(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

  // 检查是否成功分配内存
  if (!oled)
  {
    Serial.println("Failed to allocate memory for OLED.");
    return; // 如果分配失败，退出 setup
  }

  // 初始化 OLED
  if (!oled->begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
  {
    Serial.println("Failed to initialize OLED.");
    delete oled;    // 清理内存
    oled = nullptr; // 避免悬空指针
    return;         // 如果初始化失败，退出 setup
  }

  // 清屏并显示内容
  oled->clearDisplay();
  oled->setTextSize(1);
  oled->setTextColor(SSD1306_WHITE);
  oled->setCursor(0, 0);
  oled->println("Hello, World!");
  oled->display();
  Serial.println("OLED initialized and displayed.");
}

// LEDController ledController(NUM_LEDS);
// SerialCommandHolder cmdHolder(ledController);
// OledController oled;
uint8_t argsBuffer[MAX_ARG_COUNT];

void setup()
{
  Serial.begin(SERIAL_BAUD);
  // Serial.println("Setup");

  // cmdHolder.createAllCommands(ledController);
  // ledController.setup();
  oledSetup();

  // ledController.stepAndShow();
  Serial.println("Setup complete");
}

void loop()
{
  // uint8_t cmdNameByte = 0;
  // if (Serial.available())
  // {
  //   // 读取指令字符串
  //   Serial.readBytes(&cmdNameByte, 1);
  //   ledController.endWaiting();
  // }

  // // 获取指令对象
  // SerialCommand *command = cmdHolder.getCommand(cmdNameByte);
  // if (command != nullptr)
  // {
  //   auto argCount = command->getArgCount();
  //   if (argCount > 0)
  //   {
  //     Serial.readBytes(argsBuffer, argCount);
  //   }
  //   command->execute(argsBuffer);

  //   // 在此处调用 displayData 来在 OLED 上显示数据
  //   if (cmdNameByte != CMD_BYTE_WAITING)
  //   {
  //     oledDisplayData(cmdNameByte, argsBuffer, argCount);
  //     Serial.write(0x00);
  //   }
  // }

  // // 不再等待时，点亮灯带
  // if (!ledController.isWaiting() || cmdNameByte == 0)
  // {
  //   ledController.stepAndShow();
  // }
}
