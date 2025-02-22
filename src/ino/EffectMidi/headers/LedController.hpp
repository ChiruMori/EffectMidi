#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H
#define KEY_NUM 88
#define DIGITAL_PIN 7
#define DEBUG_MODE 1
#define PREVIEW_TIME 5000
//（60fps，16ms）
#define REFRESH_INTERVAL 16

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
   * 显示
   */
  void stepAndShow();
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
  void setEndLightsColor(CRGB color, bool ignoreSetting);
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
  /**
   * 通过端点灯预览颜色
   */
  void previewEndLightsColor(CRGB color);
  /**
   * 设置扩散宽度
   */
  void setDiffusionWidth(int width);
  /**
   * 设置残留时间，单位毫秒，0表示不启用残留
   */
  void setResidualTime(int time);

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
   * 前景色
   */
  CRGB foregroundColor;
  /**
   * 背景色
   */
  CRGB backgroundColor;
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
  /**
   * 扩散宽度
   */
  int diffusionWidth;
  /**
   * 残留时间
   */
  int residualTime;
  /**
   * 端点灯的颜色预览剩余时间
   */
  int endLightsPreviewTime;
  /**
   * 残留时间计数数组
   */
  int residualCounter[KEY_NUM];
  /**
   * 是否需要刷新
   */
  bool needRefresh;
  /**
   * 上次刷新时间
   */
  unsigned long lastRefreshTime;
  /**
   * 设置某个灯的颜色
   *
   * @param ledIndex 灯珠索引，-1表示端点灯
   * @param color 颜色
   */
  void setLedColor(int ledIndex, CRGB color);
};

#endif
