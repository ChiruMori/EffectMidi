#include <FastLED.h>

#define LED_PIN 7
#define NUM_LEDS 288
#define LEFT_ENDPOINT 0
#define RIGHT_ENDPOINT 177
#define KEY_NUM 88
#define PIN_NUM 13

using namespace std;

// 灯光颜色数组（WS2812 灯带有 288 个灯珠，MIDI 键盘有 88 个键，
// 每个键对应两个灯珠，每侧有一个灯珠作为端点灯，实际使用的数组长度为 178）
CRGB leds[NUM_LEDS];
// 当前信号
int currentSignal;
// 键盘状态数组，记录每个键是否被按下
bool activeFlag[89];
// 是否开启环模式
bool circleMode;
// 端点灯是否常亮
bool endLightAlwaysOn;
// 颜色（背景、前景）
int colorR, colorG, colorB;
int bgColorR, bgColorG, bgColorB;
// 亮度
int brightness;
// 是否使用背景色
bool useBackground;
// 彩虹模式使用
int rainbowBeginColor;
bool rainbowMode;
bool rainbowToggledToRefresh;
// 扩散模式使用
bool extendMode;
int numOfExtend;
// 残留模式使用
bool remainMode;
int remainTime;
char remainTimes[KEY_NUM + 1];

// Setup 只会执行一次
void setup()
{
  // 初始化设置
  endLightAlwaysOn = false;
  // 初始化串口
  Serial.begin(19200);
  // 设置 13 号引脚为输出
  pinMode(PIN_NUM, OUTPUT);

  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  // 背景灯亮度，0-255
  FastLED.setBrightness(100);

  memset(activeFlag, false, sizeof(activeFlag));

  // 初始化灯光颜色（黑色全灭），除左侧端点灯
  for (int i = 1; i < NUM_LEDS - 1; ++i)
  {
    leds[i] = CRGB(0, 0, 0);
  }

  // 等待串口发送开始工作的信号，等待期间，端点灯会闪烁，无论是否设置常亮
  int startGradientStep = 1;
  int startSignal = -1;
  int waitingBrightness = 0;
  while (startSignal != 127)
  {
    startSignal = Serial.read();
    leds[LEFT_ENDPOINT] = CRGB(waitingBrightness / 2, waitingBrightness / 2, waitingBrightness / 2);
    leds[RIGHT_ENDPOINT] = CRGB(waitingBrightness / 2, waitingBrightness / 2, waitingBrightness / 2);
    waitingBrightness += startGradientStep;
    // 使端点灯在 0-100 之间闪烁
    if (waitingBrightness >= 100 || waitingBrightness <= 0)
    {
      startGradientStep = -startGradientStep;
    }
    FastLED.show();
    delay(5);
  }

  colorR = 20;
  colorG = 24;
  colorB = 127;
  // 如果端点灯常亮，设置端点灯颜色
  if (endLightAlwaysOn)
  {
    leds[LEFT_ENDPOINT] = CRGB(140, 154, 255);
    leds[RIGHT_ENDPOINT] = CRGB(140, 154, 255);
  }
}

bool readSerialCmd()
{
  // 等待串口发送信号
  currentSignal = -1;
  while (currentSignal == -1)
  {
    currentSignal = Serial.read();
  }

  switch (currentSignal)
  {
  case 88:
    // 重置信号，清空灯光，端点灯常亮
    FastLED.clear();
    memset(activeFlag, false, sizeof(activeFlag));
    if (endLightAlwaysOn == true)
    {
      leds[LEFT_ENDPOINT] = CRGB(140, 154, 255);
      leds[RIGHT_ENDPOINT] = CRGB(140, 154, 255);
    }
    else
    {
      leds[LEFT_ENDPOINT] = CRGB(0, 0, 0);
      leds[RIGHT_ENDPOINT] = CRGB(0, 0, 0);
    }
    circle = 0;
    return true;
  case 89:
    // 需要更改颜色
    colorR = -1;
    colorG = -1;
    colorB = -1;
    // 等待接收颜色值
    while (colorR == -1)
    {
      colorR = Serial.read();
    }
    while (colorG == -1)
    {
      colorG = Serial.read();
    }
    while (colorB == -1)
    {
      colorB = Serial.read();
    }
    if (endLightAlwaysOn == false)
    {
      leds[LEFT_ENDPOINT] = CRGB(0, 0, 0);
      leds[RIGHT_ENDPOINT] = CRGB(0, 0, 0);
    }
    else
    {
      leds[LEFT_ENDPOINT] = CRGB(colorR, colorG, colorB);
      leds[RIGHT_ENDPOINT] = CRGB(colorR, colorG, colorB);
    }
    return true;
  case 97:
    // 关闭端点灯
    leds[LEFT_ENDPOINT] = CRGB(0, 0, 0);
    leds[RIGHT_ENDPOINT] = CRGB(0, 0, 0);
    endLightAlwaysOn = false;
    return true;
  case 92:
    // 开启端点灯
    leds[LEFT_ENDPOINT] = CRGB(colorR, colorG, colorB);
    leds[RIGHT_ENDPOINT] = CRGB(colorR, colorG, colorB);
    endLightAlwaysOn = true;
    return true;
  case 93:
    // 设置亮度
    brightness = -1;
    while (brightness == -1)
    {
      brightness = Serial.read();
    }
    FastLED.setBrightness(brightness);
    return true;
  case 94:
    // 开启彩虹模式
    rainbowMode = true;
    return false;
  case 95:
    // 关闭彩虹模式
    rainbowMode = false;
    rainbowToggledToRefresh = true;
    return false;
  case 96:
    // 按键扩散模式
    extendMode = true;
    numOfExtend = -1;
    while (numOfExtend == -1)
    {
      numOfExtend = Serial.read();
    }
    return false;
  case 101:
    // 关闭按键扩散模式
    extendMode = false;
    return false;
  case 98:
    // 按键残留模式
    remainMode = true;
    remainTime = -1;
    while (remainTime == -1)
    {
      remainTime = Serial.read();
    }
    return false;
  case 99:
    // 关闭按键残留模式
    remainMode = false;
    return false;
  case 125:
    // setup 信号，初始化
    setup();
    return true;
  case 102:
    // 开启背景灯
    useBackground = true;
    bgColorR = -1;
    bgColorG = -1;
    bgColorB = -1;
    while (bgColorR == -1)
    {
      bgColorR = Serial.read();
    }
    while (bgColorG == -1)
    {
      bgColorG = Serial.read();
    }
    while (bgColorB == -1)
    {
      bgColorB = Serial.read();
    }
    // 端点灯空一个，实际灯为 1 开始，每个键两个灯
    for (int i = 1; i <= KEY_NUM; ++i)
    {
      leds[i * 2 - 1] += CRGB(bgColorR, bgColorG, bgColorB);
      leds[i * 2] += CRGB(bgColorR, bgColorG, bgColorB);
    }
    return true;
  case 103:
    // 不开启背景灯
    useBackground = false;
    for (int i = 1; i <= KEY_NUM; ++i)
    {
      leds[i * 2] -= CRGB(bgColorR, bgColorG, bgColorB);
      leds[i * 2 - 1] -= CRGB(bgColorR, bgColorG, bgColorB);
    }
    return false;
  default:
    return false;
  }
}

bool rainbowStep()
{
  if (rainbowMode)
  {
    // 从 1 号灯开始，共 176 个灯，设置为彩虹模式
    fill_rainbow(leds + 1, KEY_NUM * 2, rainbowBeginColor, 1);
    rainbowBeginColor += 1;
    rainbowBeginColor %= 256;
    return true;
  }
  if (rainbowToggledToRefresh)
  {
    for (int i = 1; i < NUM_LEDS - 1; ++i)
    {
      leds[i] = CRGB(0, 0, 0);
    }
    if (endLightAlwaysOn)
    {
      leds[LEFT_ENDPOINT] = CRGB(colorR, colorG, colorB);
      leds[RIGHT_ENDPOINT] = CRGB(colorR, colorG, colorB);
    }
    else
    {
      leds[LEFT_ENDPOINT] = CRGB(0, 0, 0);
      leds[RIGHT_ENDPOINT] = CRGB(0, 0, 0);
    }
    rainbowToggledToRefresh = false;
    return true;
  }
  return false;
}

bool remainStep()
{
  if (remainMode && currentSignal == 100)
  {
    for (int i = 1; i <= KEY_NUM; ++i)
    {
      if (remainTimes[i] > 0)
      {
        // 颜色分量除以剩余时间，使颜色逐渐减弱
        remainTimes[i] -= 1;
        leds[i * 2 - 1] -= CRGB(
            colorR / remainTime + 1,
            colorG / remainTime + 1,
            colorB / remainTime + 1);
        leds[i * 2] -= CRGB(
            colorR / remainTime + 1,
            colorG / remainTime + 1,
            colorB / remainTime + 1);
        // 颜色衰减结束，恢复到背景灯颜色
        if (remainTimes[i] == 0 && useBackground && activeFlag[i])
        {
          leds[i * 2 - 1] = CRGB(bgColorR, bgColorG, bgColorB);
          leds[i * 2] = CRGB(bgColorR, bgColorG, bgColorB);
        }
      }
    }
    return true;
  }
  return false;
}

bool keyAndExtendHandle()
{
  if (currentSignal >= 1 && currentSignal <= KEY_NUM)
  {
    int currentKey = currentSignal * 2;
    // 一个键对应两个灯，右侧从 1 开始，左侧从 -2 开始衰减
    int rightKey = currentKey + i + 1;
    int leftKey = currentKey - i - 2;
    if (!activeFlag[currentSignal])
    {
      // 点亮板载 LED，13 号引脚设为高电平
      digitalWrite(PIN_NUM, HIGH);
      activeFlag[currentSignal] = true;
      leds[currentKey] += CRGB(colorR, colorG, colorB);
      leds[currentKey - 1] += CRGB(colorR, colorG, colorB);
      if (extendMode)
      {
        for (int i = 0; i < numOfExtend; ++i)
        {
          // 防止超出端点灯范围
          if (rightKey < RIGHT_ENDPOINT)
          {
            leds[rightKey] += CRGB(
                colorR / (numOfExtend + 3) * (numOfExtend - i),
                colorG / (numOfExtend + 3) * (numOfExtend - i),
                colorB / (numOfExtend + 3) * (numOfExtend - i));
          }
          if (leftKey > LEFT_ENDPOINT)
          {
            leds[leftKey] += CRGB(
                colorR / (numOfExtend + 3) * (numOfExtend - i),
                colorG / (numOfExtend + 3) * (numOfExtend - i),
                colorB / (numOfExtend + 3) * (numOfExtend - i));
          }
        }
      }
    }
    else
    {
      // 熄灭板载 LED，13 号引脚设为低电平
      digitalWrite(PIN_NUM, LOW);
      activeFlag[num] = false;
      if (!remainMode)
      {
        leds[currentKey] -= CRGB(colorR, colorG, colorB);
        leds[currentKey - 1] -= CRGB(colorR, colorG, colorB);
      }
      else
      {
        remainTimes[currentSignal] += remainTime;
      }

      if (extendMode)
      {
        for (int i = 0; i < numOfExtend; ++i)
        {
          // 防止超出端点灯范围
          if (rightKey < RIGHT_ENDPOINT)
          {
            leds[rightKey] -= CRGB(
                colorR / (numOfExtend + 3) * (numOfExtend - i),
                colorG / (numOfExtend + 3) * (numOfExtend - i),
                colorB / (numOfExtend + 3) * (numOfExtend - i));
          }
          if (leftKey > LEFT_ENDPOINT)
          {
            leds[leftKey] -= CRGB(
                colorR / (numOfExtend + 3) * (numOfExtend - i),
                colorG / (numOfExtend + 3) * (numOfExtend - i),
                colorB / (numOfExtend + 3) * (numOfExtend - i));
          }
        }
      }
    }
    return true;
  }
  return false;
}

// loop 方法会重复执行
void loop()
{
  // 用于判断是否需要重新显示灯光
  bool toShow = false;
  // 读取串口信号、执行对应指令
  toShow |= readSerialCmd();
  // 彩虹模式
  toShow |= rainbowStep();
  // 残留模式
  toShow |= remainStep();
  // 键盘信号、扩散处理
  toShow |= keyAndExtendHandle();
  // 刷新灯光显示
  if (toShow)
  {
    FastLED.show();
  }
}