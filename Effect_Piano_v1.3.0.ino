#include <FastLED.h>

#define LED_PIN 7

#define NUM_LEDS 288

CRGB leds[NUM_LEDS];

using namespace std;

int f, num, vs2;

bool flag[89];

int circle;

bool re;

bool flagc;

bool flagz;

// int gvwz[89];

int r, g, b, br, bg, bb;

int brightness;

int rb_begincolor;
bool rbstatus;
bool rb_refresh;
bool extend;
int numofextend;

bool rm_status;
int rm_time;
char rm_times[89];
// char rm_minus_timer[89];

int start;
long starter;
int starterp;
bool on_background;

void setup()
{
  // put your setup code here, to run once:

  Serial.begin(19200);

  flagc = true;
  flagz = true;

  // flagc = false;
  // 将本行注释掉以开启圈

  // flagz = false;
  // 将本行注释掉以开启两侧持续亮灯（一个）

  pinMode(13, OUTPUT);

  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);

  FastLED.setBrightness(100); // 0~255

  // Serial.println("ready\n");

  memset(flag, false, sizeof(flag));

  for (int i = 1; i < NUM_LEDS - 1; ++i)
  {
    leds[i] = CRGB(0, 0, 0);
  }

  // fill_rainbow(leds, 175, 0, 1);

  starterp = 1;
  start = -1;
  while (start != 127)
  {
    start = Serial.read();
    leds[0] = CRGB(starter / 2, starter / 2, starter / 2);
    starter += starterp;
    if (starter >= 100 or starter <= 0)
    {
      starterp = -starterp;
    }
    FastLED.show();
    delay(5);
  }

  r = 20;
  g = 24;
  b = 127;
  if (flagz == true)
  {
    leds[0] = CRGB(140, 154, 255);
    leds[177] = CRGB(140, 154, 255);
  }
  FastLED.show();
}

void loop()
{
  // put your main code here, to run repeatedly:
  num = -1;
  while (num == -1)
  {
    num = Serial.read();
  }

  switch (num)
  {
  case 88:
    // clear
    FastLED.clear();
    memset(flag, false, sizeof(flag));
    if (flagz == true)
    {
      leds[0] = CRGB(140, 154, 255);
      leds[177] = CRGB(140, 154, 255);
    }
    else
    {
      leds[0] = CRGB(0, 0, 0);
      leds[177] = CRGB(0, 0, 0);
    }
    circle = 0;
    FastLED.show();
    // break;
    return;
  case 90:
    // circle off
    flagc = false;
    for (int i = 178; i <= 287; ++i)
    {
      leds[i] = CRGB(0, 0, 0);
    }
    circle = 0;
    FastLED.show();
    // break;
    return;
  case 91:
    // circle on
    flagc = true;
    re = false;
    // break;
    return;
  case 89:
    // change color
    r = -1;
    g = -1;
    b = -1;
    while (r == -1)
    {
      r = Serial.read();
    }
    while (g == -1)
    {
      g = Serial.read();
    }
    while (b == -1)
    {
      b = Serial.read();
    }
    if (flagz == false)
    {
      leds[0] = CRGB(0, 0, 0);
      leds[177] = CRGB(0, 0, 0);
    }
    else
    {
      leds[0] = CRGB(r, g, b);
      leds[177] = CRGB(r, g, b);
    }
    // break;
    return;
  case 97:
    // end leds off
    leds[0] = CRGB(0, 0, 0);
    leds[177] = CRGB(0, 0, 0);
    flagz = false;
    FastLED.show();
    // break;
    return;
  case 92:
    // end leds on
    leds[0] = CRGB(r, g, b);
    leds[177] = CRGB(r, g, b);
    flagz = true;
    FastLED.show();
    // break;
    return;
  case 93:
    // set brightness
    brightness = -1;
    while (brightness == -1)
    {
      brightness = Serial.read();
    }
    FastLED.setBrightness(brightness);
    FastLED.show();
    // break;
    return;
  case 94:
    // rainbow on
    rbstatus = true;
    break;
  case 95:
    // rainbow off
    rbstatus = false;
    rb_refresh = true;
    break;
  case 96:
    // extend on
    extend = true;
    numofextend = -1;
    while (numofextend == -1)
    {
      numofextend = Serial.read();
    }
    // break;
    return;
  case 101:
    // extend off
    extend = false;
    // break;
    return;
  case 98:
    // remain on
    rm_status = true;
    rm_time = -1;
    while (rm_time == -1)
    {
      rm_time = Serial.read();
    }
    // break;
    return;
  case 99:
    // remain off
    rm_status = false;
    // break;
    return;
  case 125:
    setup();
    // break;
    return;
  case 102:
    // background light on
    on_background = true;
    br = -1;
    bg = -1;
    bb = -1;
    while (br == -1)
    {
      br = Serial.read();
    }
    while (bg == -1)
    {
      bg = Serial.read();
    }
    while (bb == -1)
    {
      bb = Serial.read();
    }
    for (int i = 1; i <= 88; ++i)
    {
      leds[i * 2] += CRGB(br, bg, bb);
      leds[i * 2 - 1] += CRGB(br, bg, bb);
    }
    FastLED.show();
    return;
  case 103:
    // background light off
    on_background = false;
    for (int i = 1; i <= 88; ++i)
    {
      leds[i * 2] -= CRGB(br, bg, bb);
      leds[i * 2 - 1] -= CRGB(br, bg, bb);
    }
    FastLED.show();
    return;
  default:
    break;
  }
  /*
  if (num == 88){
    //clear
    FastLED.clear();
    memset(flag,false,sizeof (flag));
    if (flagz == true){
      leds[0] = CRGB(140,154,255);
      leds[177] = CRGB(140,154,255);
    }
    else {
      leds[0] = CRGB(0,0,0);
      leds[177] = CRGB(0,0,0);
    }

    circle = 0;
    FastLED.show();
    return;
  }
  else if (num == 90){
    //circle off
    flagc = false;
    for (int i=178;i<=287;++i){
      leds[i] = CRGB(0,0,0);
    }
    circle = 0;
    FastLED.show();
    return;
  }
  else if (num == 91){
    //circle on
    flagc = true;
    re = false;
    return;
  }
  else if (num == 89){
    // change color
    r = -1;
    g = -1;
    b = -1;
    while (r == -1){
      r = Serial.read();
    }
    while (g == -1){
      g = Serial.read();
    }
    while (b == -1){
      b = Serial.read();
    }
    if (flagz == false){
      leds[0] = CRGB(0,0,0);
      leds[177] = CRGB(0,0,0);
    }
    else {
      leds[0] = CRGB(r,g,b);
      leds[177] = CRGB(r,g,b);
    }
    return;
  }
  else if (num == 97){
    // end leds off
    leds[0] = CRGB(0,0,0);
    leds[177] = CRGB(0,0,0);
    flagz = false;
    FastLED.show();
    return;
  }
  else if (num == 92){
    //end leds on
    leds[0] = CRGB(r,g,b);
    leds[177] = CRGB(r,g,b);
    flagz = true;
    FastLED.show();
    return;
  }
  else if (num == 93){
    //set brightness
    brightness = -1;
    while (brightness == -1){
      brightness = Serial.read();
    }
    FastLED.setBrightness (brightness);
    FastLED.show();
    return;
  }
  else if (num == 94){
    //rainbow on
    rbstatus = true;
  }
  else if (num == 95){
    //rainbow off
    rbstatus = false;
    rb_refresh = true;
  }

  else if (num == 96){
    */
  /*
if (extend == true){
  extend = false;
  digitalWrite(13,LOW);
}
else {
*/ /*
   extend = true;
   numofextend = -1;
   while (numofextend == -1){
     numofextend = Serial.read();
   }
   */
   /*
}
*/ /*
 return;
}
else if (num == 98){
 //remain on
 rm_status = true;
 rm_time = -1;
 while (rm_time == -1){
   rm_time = Serial.read();
 }
 return;
}
else if (num == 99){
 //remain off
 rm_status = false;
 return;
}
else if (num == 101){
 extend = false;
}
*/

  if (rbstatus == true)
  {
    fill_rainbow(leds + 1, 176, rb_begincolor, 1);
    FastLED.show();
    rb_begincolor += 1;
    rb_begincolor %= 256;
    return;
  }
  else if (rb_refresh == true)
  {
    for (int i = 1; i < NUM_LEDS - 1; ++i)
    {
      leds[i] = CRGB(0, 0, 0);
    }
    if (flagz == true)
    {
      leds[0] = CRGB(r, g, b);
      leds[177] = CRGB(r, g, b);
    }
    else
    {
      leds[0] = CRGB(0, 0, 0);
      leds[177] = CRGB(0, 0, 0);
    }
    FastLED.show();
    rb_refresh = false;
    return;
  }

  if (rm_status == true and num == 100)
  {
    for (int i = 1; i <= 88; ++i)
    {
      if (rm_times[i] > 0)
      {
        rm_times[i] -= 1;
        // rm_minus_timer[i] += 1;
        leds[i * 2] -= CRGB(r / rm_time + 1, g / rm_time + 1, b / rm_time + 1);
        leds[i * 2 - 1] -= CRGB(r / rm_time + 1, g / rm_time + 1, b / rm_time + 1);

        if (rm_times[i] == 0 and on_background == true and flag[i] == false)
        {
          leds[i * 2] = CRGB(br, bg, bb);
          leds[i * 2 - 1] = CRGB(br, bg, bb);
        }
      }
      /*
      else if (rm_times[i] == 1){
        rm_times[i] -= 1;
        rm_minus_timer = 0;
        leds[i*2] -= CRGB(r/rm_time+1,g/rm_time+1,b/rm_time+1);
        leds[i*2-1] -= CRGB(r/rm_time+1,g/rm_time+1,b/rm_time+1);
      }
      */
    }
    FastLED.show();
  }

  // main part:

  if (num >= 2 and num <= 87)
  {
    // 此处初步判断在环功能开启时会导致1号键对应的灯随任意midi信号闪烁，尚未判定原因，故暂时禁用1号键上的灯
    vs2 = num * 2;
    if (flag[num] == false)
    {
      flag[num] = true;
      digitalWrite(13, HIGH);
      leds[vs2] += CRGB(r, g, b);
      leds[vs2 - 1] += CRGB(r, g, b);
      if (extend == true)
      {
        for (int i = 0; i < numofextend; ++i)
        {
          leds[vs2 + i + 1] += CRGB(r / (numofextend + 3) * (numofextend - i), g / (numofextend + 3) * (numofextend - i), b / (numofextend + 3) * (numofextend - i));
          leds[vs2 - i - 2] += CRGB(r / (numofextend + 3) * (numofextend - i), g / (numofextend + 3) * (numofextend - i), b / (numofextend + 3) * (numofextend - i));
        }
      }

      // 由于供电不足，环的部分可能无法与特效动作同时运行，故在执行特效动作时禁用环

      if (flagc == true)
      {
        if (circle >= 60)
        {
          circle %= 60;
          if (re == false)
          {
            re = true;
          }
          else
            re = false;
        }
        circle += 1;
        if (re == false)
        {
          leds[circle + 226] = CRGB(r / 2, g / 2, b / 2);
        }
        else
        {
          leds[circle + 226] = CRGB(0, 0, 0);
        }
      }
    }
    else
    {
      flag[num] = false;
      digitalWrite(13, LOW);
      if (rm_status == false)
      {
        leds[vs2] -= CRGB(r, g, b);
        leds[vs2 - 1] -= CRGB(r, g, b);
      }
      else
      {
        rm_times[num] += rm_time;
      }

      if (extend == true)
      {
        for (int i = 0; i < numofextend; ++i)
        {
          leds[vs2 + i + 1] -= CRGB(r / (numofextend + 3) * (numofextend - i), g / (numofextend + 3) * (numofextend - i), b / (numofextend + 3) * (numofextend - i));
          leds[vs2 - i - 2] -= CRGB(r / (numofextend + 3) * (numofextend - i), g / (numofextend + 3) * (numofextend - i), b / (numofextend + 3) * (numofextend - i));
        }
      }
    }
    FastLED.show();
    /*
    for (int i=0;i<88;++i){
        if (flag[i] == true){
          gvwz[i] += 1;
        }
        if (gvwz[i] > 30){
          gvwz[i] = 0;
          flag[i] = false;
          leds[i*2] = CRGB(0,0,0);
          leds[i*2-1] = CRGB(0,0,0);
          FastLED.show();

        }
    }
    */

    /*
    if (f <= 2){
      vs1 = (num-3)*2;
      if (f == 2){
        digitalWrite (13,LOW);
        leds[vs1] = CRGB(0,0,0);
       leds[vs1+1] = CRGB(0,0,0);
       FastLED.show();
     }
     else if (f == 1){
        digitalWrite (13,HIGH);
       leds[vs1] = CRGB(100,100,100);
       leds[vs1+1] = CRGB(100,100,100);
       FastLED.show();
     }
    }
    else {
      num = Serial.read();
      vs1 = (f-3)*2;
      leds[f] = CRGB(0,0,0);
      leds[f+1] = CRGB(0,0,0);
      FastLED.show();
    }
    */

    // delay (5);
  }
}
