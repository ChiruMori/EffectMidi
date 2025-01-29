#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H
#define KEY_NUM 88
#define DIGITAL_PIN 7
#define DEBUG_MODE 1

#include <FastLED.h>

class LEDController
{
public:
  /**
   * 构造函数
   *
   * @param numLeds LED灯带的灯珠数量
   */
  LEDController(int numLeds);
  /**
   * 初始化LED灯带
   */
  void setup();
  /**
   * 执行处理步骤并显示
   */
  void show();
  /**
   * 设置LED灯带的前景色
   */
  void setForegroundColor(CRGB color);
  /**
   * 设置LED灯带的背景色
   */
  void setBackgroundColor(CRGB color);
  /**
   * 设置是否启用端点灯
   */
  void setEnableEndLights(bool enable);
  /**
   * 设置端点灯的颜色
   */
  void setEndLightsColor(CRGB color, bool ignoreSettings);
  /**
   * 设置LED灯带的亮度
   */
  void setBrightness(int brightness);
  /**
   * 设置是否启用背景灯
   */
  void setUseBackground(bool use);
  /**
   * 按下某个键
   */
  void pressKey(uint8_t keyIndex);
  /**
   * 松开某个键
   */
  void releaseKey(uint8_t keyIndex);
  /**
   * 是否正在等待启动
   */
  bool isWaiting();
  /**
   * 结束等待
   */
  void endWaiting();
  // void clear();
  // void updateRainbow(int& rainbowBeginColor);
  // void handleKeyPress(int keyIndex, bool pressed);
  // void clearBackground();

private:
  /**
   * LED灯带的灯珠（颜色）
   */
  CRGB *leds;
  /**
   * 按键状态
   */
  bool activeFlag[KEY_NUM];
  /**
   * LED灯带的灯珠数量
   */
  int numLeds;
  /**
   * 启用端点灯（左右两侧）
   */
  bool enableEndLights;
  /**
   * 前景色
   */
  CRGB foregroundColor;
  /**
   * 背景色
   */
  CRGB backgroundColor;
  /**
   * 启用背景灯
   */
  bool useBackground;
  /**
   * 端点灯的颜色
   */
  CRGB endLightsColor;
  /**
   * 亮度
   */
  int brightness;
  /**
   * 等待启动状态
   */
  bool waiting;
};

#endif
