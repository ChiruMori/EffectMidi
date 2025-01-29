#include "headers/LedController.hpp"

LEDController::LEDController(int numLeds) : numLeds(numLeds), enableEndLights(false)
{
  leds = new CRGB[numLeds];
  for (int i = 0; i < numLeds; ++i)
  {
    leds[i] = CRGB::Black;
  }
  for (int i = 0; i < KEY_NUM; ++i)
  {
    activeFlag[i] = false;
  }
  waiting = true;
  enableEndLights = false;
  useBackground = true;
  FastLED.addLeds<WS2812, DIGITAL_PIN, GRB>(leds, numLeds);
}

void LEDController::setup()
{
  // clear();
  FastLED.setBrightness(100);
}

bool LEDController::isWaiting()
{
  return waiting;
}

void LEDController::endWaiting()
{
  waiting = false;
  if (enableEndLights)
  {
    leds[0] = endLightsColor;
    leds[(KEY_NUM << 1) + 1] = endLightsColor;
  }
  else
  {
    leds[0] = CRGB::Black;
    leds[(KEY_NUM << 1) + 1] = CRGB::Black;
  }
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

void LEDController::setEndLightsColor(CRGB color, bool ignoreSettings)
{
  if (enableEndLights || ignoreSettings)
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

void LEDController::pressKey(uint8_t keyIndex)
{
  activeFlag[keyIndex] = true;
  leds[(keyIndex << 1) + 1] = foregroundColor;
  leds[(keyIndex << 1) + 2] = foregroundColor;
}

void LEDController::releaseKey(uint8_t keyIndex)
{
  activeFlag[keyIndex] = false;
  // TODO: REMAIN、EXTEND
  if (useBackground)
  {
    leds[(keyIndex << 1) + 1] = backgroundColor;
    leds[(keyIndex << 1) + 2] = backgroundColor;
  }
  else
  {
    leds[(keyIndex << 1) + 1] = CRGB::Black;
    leds[(keyIndex << 1) + 2] = CRGB::Black;
  }
}
