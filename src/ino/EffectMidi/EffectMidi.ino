#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define NUM_LEDS 288
#define SERIAL_BAUD 115200

LEDController ledController(NUM_LEDS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;
CRGB leds[NUM_LEDS];

void setup()
{
  Serial.begin(SERIAL_BAUD);

  cmdHolder.createAllCommands(ledController);
  ledController.setup();
  oled.setup();

  ledController.stepAndShow();
}

void loop() {
  while(Serial.available() > 0) {
    int currentByte = Serial.read();
    ledController.endWaiting();
    cmdHolder.processByte(currentByte, false, oled);
  }
  
  if(ledController.isWaiting()) {
    WaitingCmd::getInstance(ledController).execute(nullptr);
  }
  
  ledController.stepAndShow();
}
