#include <FastLED.h>
#include "headers/LEDController.hpp"
#include "headers/SerialCommand.hpp"
#include "headers/SerialCommandHolder.hpp"
#include "headers/OledController.hpp"

#define LED_COUNTS 178
#define SERIAL_BAUD 115200

LEDController ledController(LED_COUNTS);
SerialCommandHolder cmdHolder(ledController);
OledController oled;

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
