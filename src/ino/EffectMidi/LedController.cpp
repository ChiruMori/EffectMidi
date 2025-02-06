#include "headers/LedController.hpp"

LEDController::LEDController(int numLeds)
{
  this->numLeds = numLeds;
  this->leds = new CRGB[numLeds];
  for (int i = 0; i < numLeds; ++i)
  {
    this->leds[i] = CRGB::Black;
  }
  for (int i = 0; i < KEY_NUM; ++i)
  {
    this->activeFlag[i] = false;
    this->residualCounter[i] = 0;
  }
  this->diffusionWidth = 0;
  this->residualTime = 0;
  this->endLightsPreviewTime = 0;
  this->endLightsColor = CRGB::Black;
  this->foregroundColor = CRGB::White;
  this->backgroundColor = CRGB::Black;
  this->brightness = 100;
  this->waiting = true;
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
  leds[0] = endLightsColor;
  leds[(KEY_NUM << 1) + 1] = endLightsColor;
}

/**
 * 混合两种颜色
 *
 * @param color1 颜色1
 * @param color2 颜色2
 * @param ratio 混合比例，0-255，0表示全color1，255表示全color2
 * @return 混合后的颜色
 */
CRGB mixColor(CRGB color1, CRGB color2, int ratio)
{
  return CRGB(
      (color1.r * ratio + color2.r * (255 - ratio)) >> 8,
      (color1.g * ratio + color2.g * (255 - ratio)) >> 8,
      (color1.b * ratio + color2.b * (255 - ratio)) >> 8);
}

void LEDController::stepAndShow()
{
  // 预览模式支持
  if (endLightsPreviewTime > 0)
  {
    endLightsPreviewTime--;
    if (endLightsPreviewTime == 0)
    {
      endLightsColor = endLightsColor;
    }
  }
  // 扩散效果支持（扩散后残留，越靠近扩散边缘，前景色越淡，残留时间越短）
  if (diffusionWidth > 0)
  {
    for (int i = 0; i < KEY_NUM; ++i)
    {
      if (activeFlag[i])
      {
        auto currentKey = (i + 1) << 1;
        leds[currentKey] = foregroundColor;
        for (int j = 1; j <= diffusionWidth; ++j)
        {
          if (currentKey - j >= 0)
          {
            leds[currentKey - j] = mixColor(foregroundColor, backgroundColor, j << 8 / diffusionWidth);
            residualCounter[i] = residualTime - j * residualTime / diffusionWidth;
          }
          if (currentKey + j < numLeds)
          {
            leds[currentKey + j] = mixColor(foregroundColor, backgroundColor, j << 8 / diffusionWidth);
            residualCounter[i] = residualTime - j * residualTime / diffusionWidth;
          }
        }
      }
    }
  }
  // 残留效果支持
  if (residualTime > 0)
  {
    for (int i = 0; i < KEY_NUM; ++i)
    {
      if (activeFlag[i])
      {
        residualCounter[i] = residualTime;
      }
      else if (residualCounter[i] > 0)
      {
        // 计算残留效果（混合前景色和背景色）
        auto currentKey = (i + 1) << 1;
        leds[currentKey] = mixColor(foregroundColor, backgroundColor, residualCounter[i] << 8 / residualTime);
        residualCounter[i]--;
      }
    }
  }
  // 展示灯带
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
  for (int i = 1; i <= (KEY_NUM << 1); ++i)
  {
    auto currentKey = (i + 1) >> 1;
    if (!activeFlag[currentKey])
    {
      leds[i] = color;
    }
  }
  backgroundColor = color;
}

void LEDController::setEndLightsColor(CRGB color, bool ignoreSetting)
{
  leds[0] = color;
  leds[(KEY_NUM << 1) + 1] = color;
  if (!ignoreSetting)
  {
    endLightsColor = color;
  }
}

void LEDController::setBrightness(int brightness)
{
  FastLED.setBrightness(brightness);
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
  leds[(keyIndex << 1) + 1] = backgroundColor;
  leds[(keyIndex << 1) + 2] = backgroundColor;
}

void LEDController::previewEndLightsColor(CRGB color)
{
  leds[0] = color;
  leds[(KEY_NUM << 1) + 1] = color;
  endLightsPreviewTime = PREVIEW_TIME;
}

void LEDController::setDiffusionWidth(int width)
{
  diffusionWidth = width;
}

void LEDController::setResidualTime(int time)
{
  residualTime = time;
}
