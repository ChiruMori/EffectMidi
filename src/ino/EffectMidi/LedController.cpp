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
  this->endLightsColor = CRGB::Black;
  this->foregroundColor = CRGB::White;
  this->backgroundColor = CRGB::Black;
  this->brightness = 100;
  this->waiting = true;
  FastLED.addLeds<WS2812, DIGITAL_PIN, GRB>(leds, numLeds);
  this->needRefresh = false;
  this->counter = 0;
}

LEDController::~LEDController()
{
  delete[] leds;
}

void LEDController::setup()
{
  FastLED.setBrightness(100);
  this->needRefresh = true;
}

void LEDController::setLedColor(int ledIndex, CRGB color)
{
  if (ledIndex == -1)
  {
    this->needRefresh = leds[0] != color || leds[(KEY_NUM << 1) + 1] != color;
    leds[0] = color;
    leds[(KEY_NUM << 1) + 1] = color;
  }
  else if (ledIndex >= 1 && ledIndex < numLeds - 1)
  {
    this->needRefresh = leds[ledIndex] != color;
    leds[ledIndex] = color;
  }
}

bool LEDController::isWaiting()
{
  return waiting;
}

void LEDController::endWaiting()
{
  waiting = false;
  this->setLedColor(-1, CRGB::Black);
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
  auto ratioF = ratio / 255.0;
  return CRGB(
      (uint8_t)(color1.r * ratioF + color2.r * (1.0 - ratioF)),
      (uint8_t)(color1.g * ratioF + color2.g * (1.0 - ratioF)),
      (uint8_t)(color1.b * ratioF + color2.b * (1.0 - ratioF)));
}

void LedController::stepDiffusion()
{
  // 扩散效果支持（扩散后残留，越靠近扩散边缘，前景色越淡，残留时间越短）
  if (diffusionWidth > 0)
  {
    for (int i = 0; i < KEY_NUM; ++i)
    {
      if (activeFlag[i])
      {
        for (int j = 1; j <= diffusionWidth; ++j)
        {
          if (i - j >= 0 && !activeFlag[i - j])
          {
            this->setLedColor((i - j + 1) << 1, mixColor(foregroundColor, backgroundColor, (int)(255.0 * (diffusionWidth - j) / diffusionWidth)));
            this->setLedColor(((i - j + 1) << 1) - 1, mixColor(foregroundColor, backgroundColor, (int)(255.0 * (diffusionWidth - j) / diffusionWidth)));
            residualCounter[i - j] = (int)(residualTime - 1.0 * (diffusionWidth - j) * residualTime / diffusionWidth);
          }
          if (i + j < KEY_NUM && !activeFlag[i + j])
          {
            this->setLedColor((i + j + 1) << 1, mixColor(foregroundColor, backgroundColor, (int)(255.0 * (diffusionWidth - j) / diffusionWidth)));
            this->setLedColor(((i + j + 1) << 1) - 1, mixColor(foregroundColor, backgroundColor, (int)(255.0 * (diffusionWidth - j) / diffusionWidth)));
            residualCounter[i + j] = (int)(residualTime - 1.0 * (diffusionWidth - j) * residualTime / diffusionWidth);
          }
        }
      }
    }
  }
}

void LedController::stepResidual()
{
  // 残留效果支持
  this->counter = (this->counter + 1) % LED_COUNTER_MAX;
  if (counter == 0)
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
        residualCounter[i]--;
        auto currentIndex = (i + 1) << 1;
        auto mixedColor = mixColor(foregroundColor, backgroundColor, (int)(255.0 * residualCounter[i] / residualTime));
        this->setLedColor(currentIndex, mixedColor);
        this->setLedColor(currentIndex - 1, mixedColor);
      }
      else
      {
        // 没有残留效果时，设置背景色
        this->setLedColor((i + 1) << 1, backgroundColor);
        this->setLedColor(((i + 1) << 1) - 1, backgroundColor);
      }
    }
  }
}

void LEDController::stepAndShow()
{
  this->stepDiffusion();
  this->stepResidual();
  // 展示灯带，需要控制刷新频率
  auto now = millis();
  if (needRefresh && now - lastRefreshTime > REFRESH_INTERVAL)
  {
    FastLED.show();
    needRefresh = false;
    lastRefreshTime = now;
  }
}

void LEDController::setForegroundColor(CRGB color)
{
  for (int i = 1; i <= (KEY_NUM << 1); ++i)
  {
    auto currentKey = (i - 1) >> 1;
    if (activeFlag[currentKey])
    {
      this->setLedColor(i, color);
    }
  }
  foregroundColor = color;
}

void LEDController::setBackgroundColor(CRGB color)
{
  for (int i = 1; i <= (KEY_NUM << 1); ++i)
  {
    auto currentKey = (i - 1) >> 1;
    if (!activeFlag[currentKey])
    {
      this->setLedColor(i, color);
    }
  }
  backgroundColor = color;
}

void LEDController::setEndLightsColor(CRGB color)
{
  this->setLedColor(-1, color);
  this->endLightsColor = color;
}

void LEDController::setBrightness(int brightness)
{
  this->brightness = brightness;
  this->needRefresh = true;
  FastLED.setBrightness(brightness);
}

void LEDController::pressKey(uint8_t keyIndex)
{
  activeFlag[keyIndex] = true;
  this->setLedColor((keyIndex << 1) + 1, foregroundColor);
  this->setLedColor((keyIndex << 1) + 2, foregroundColor);
}

void LEDController::releaseKey(uint8_t keyIndex)
{
  activeFlag[keyIndex] = false;
  this->setLedColor((keyIndex << 1) + 1, backgroundColor);
  this->setLedColor((keyIndex << 1) + 2, backgroundColor);
}

void LEDController::setDiffusionWidth(int width)
{
  diffusionWidth = width;
}

void LEDController::setResidualTime(int time)
{
  residualTime = time;
}
