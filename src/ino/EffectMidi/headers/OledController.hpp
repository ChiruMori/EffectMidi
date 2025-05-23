#ifndef OLED_CONTROLLER_H
#define OLED_CONTROLLER_H

#include <Arduino.h>
#include "PinDefine.hpp"

// #define USE_OLED

#ifdef USE_OLED

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

#endif

class OledController
{

public:
  OledController()
#ifdef USE_OLED
      : oled(nullptr)
  {
  }
#else
  {
  }
#endif
  ~OledController();

  void setup();

  void displayData(uint8_t leadByte, uint8_t *data, int length);

  void log(String message);

  void logMemory();

#ifdef USE_OLED
private:
  Adafruit_SSD1306 *oled;
#endif
};

#endif
