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
    leds[0] = color;
    leds[(KEY_NUM << 1) + 1] = color;
  }
  else if (ledIndex >= 1 && ledIndex < numLeds - 1)
  {
    leds[ledIndex] = color;
  }
  this->needRefresh = true;
}

bool LEDController::isWaiting()
{
  return waiting;
}

void LEDController::endWaiting()
{
  if (waiting)
  {
    waiting = false;
    this->setLedColor(-1, CRGB::Black);
  }
}

void LEDController::stepDiffusion()
{
  if (diffusionWidth > 0)
  {
    for (int i = 0; i < KEY_NUM; ++i)
    {
      if (activeFlag[i])
      {
        for (int j = 1; j <= diffusionWidth; ++j)
        {
          // 左扩散区域
          if (i - j >= 0 && !activeFlag[i - j])
          {
            int targetKey = i - j;
            int ledIndex1 = (targetKey + 1) * 2 - 1;
            int ledIndex2 = (targetKey + 1) * 2;
            CRGB blended = blend(foregroundColor, backgroundColor, 255 * j / diffusionWidth);
            setLedColor(ledIndex1, blended);
            setLedColor(ledIndex2, blended);
            residualCounter[targetKey] = max(residualCounter[targetKey], residualTime - j * residualTime / diffusionWidth);
            residualCounter[targetKey] = max(1, residualCounter[targetKey]);
          }
          // 右扩散区域
          if (i + j < KEY_NUM && !activeFlag[i + j])
          {
            int targetKey = i + j;
            int ledIndex1 = (targetKey + 1) * 2 - 1;
            int ledIndex2 = (targetKey + 1) * 2;
            CRGB blended = blend(foregroundColor, backgroundColor, 255 * j / diffusionWidth);
            setLedColor(ledIndex1, blended);
            setLedColor(ledIndex2, blended);
            residualCounter[targetKey] = max(residualCounter[targetKey], residualTime - j * residualTime / diffusionWidth);
            residualCounter[targetKey] = max(1, residualCounter[targetKey]);
          }
        }
      }
    }
  }
}

void LEDController::stepResidual()
{
  this->counter++;
  this->counter %= LED_COUNTER_MAX;
  if (counter != 0)
    return;

  for (int i = 0; i < KEY_NUM; ++i)
  {
    if (activeFlag[i])
    {
      residualCounter[i] = residualTime; // 保持激活状态残留
    }
    else if (residualCounter[i] > 0)
    {
      // 计算混合比例（需处理residualTime=0的情况）
      uint8_t blendRatio = (residualTime > 0) ? (255 * residualCounter[i] / residualTime) : 0;

      CRGB mixedColor = blend(backgroundColor, foregroundColor, blendRatio);

      int ledIndex1 = (i + 1) * 2 - 1;
      int ledIndex2 = (i + 1) * 2;
      setLedColor(ledIndex1, mixedColor);
      setLedColor(ledIndex2, mixedColor);

      if (--residualCounter[i] <= 0)
      {
        // 强制重置为背景色
        setLedColor(ledIndex1, backgroundColor);
        setLedColor(ledIndex2, backgroundColor);
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

  // 立即设置背景色（若需保留残留则跳过）
  if (residualTime == 0)
  {
    int ledIndex1 = (keyIndex + 1) * 2 - 1;
    int ledIndex2 = (keyIndex + 1) * 2;
    setLedColor(ledIndex1, backgroundColor);
    setLedColor(ledIndex2, backgroundColor);
  }
}

void LEDController::setDiffusionWidth(int width)
{
  diffusionWidth = width + 1;
}

void LEDController::setResidualTime(int time)
{
  residualTime = time;
}
