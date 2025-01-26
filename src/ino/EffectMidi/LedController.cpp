#include "headers/LedController.hpp"

LEDController::LEDController(int numLeds) : numLeds(numLeds), enableEndLights(false)
{
  leds = new CRGB[numLeds];
  FastLED.addLeds<WS2812, DIGITAL_PIN, GRB>(leds, numLeds);
}

void LEDController::setup()
{
  // clear();
  FastLED.setBrightness(100);
}

void LEDController::show()
{
  FastLED.show();
}

void LEDController::setForegroundColor(CRGB color)
{
  for (int i = 1; i <= (KEY_NUM << 1); ++i)
  {
    auto currentKey = (i + 1) >> 1;
    if (activeFlag[currentKey])
    {
      leds[i] = color;
    }
  }
  foregroundColor = color;
}

void LEDController::setBackgroundColor(CRGB color)
{
  if (useBackground)
  {
    for (int i = 1; i <= (KEY_NUM << 1); ++i)
    {
      auto currentKey = (i + 1) >> 1;
      if (!activeFlag[currentKey])
      {
        leds[i] = color;
      }
    }
  }
  backgroundColor = color;
}

void LEDController::setEnableEndLights(bool enable)
{
  enableEndLights = enable;
}

void LEDController::setEndLightsColor(CRGB color)
{
  if (enableEndLights)
  {
    leds[0] = color;
    leds[(KEY_NUM << 1) + 1] = color;
  }
}

void LEDController::setBrightness(int brightness)
{
  FastLED.setBrightness(brightness);
}

void LEDController::setUseBackground(bool use)
{
  useBackground = use;
}

void LEDController::pressKey(int keyIndex)
{
  activeFlag[keyIndex] = true;
}

void LEDController::releaseKey(int keyIndex)
{
  activeFlag[keyIndex] = false;
}
