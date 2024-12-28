#include "portmidi.h"
#include "porttime.h"
#include "stdlib.h"
#include "stdio.h"
#include "string.h"
#include "assert.h"
#include <Windows.h>
#include <conio.h>
#include <iostream>

#define data data_efp
#define printf printf_s
using namespace std;

// 指定的键按下
#define KEY_DOWN(VK_NONAME) ((GetAsyncKeyState(VK_NONAME) & 0x8000) ? 1:0)
// Ctrl 键按下
#define CTRL_DOWN KEY_DOWN(VK_CONTROL)
// 大写锁定打开
#define CAPSLOCK_ACTIVE GetKeyState(VK_CAPITAL)

#define LONGTH 512
// 最大配置数量
#define MAX_SETTING_CNT 128


#define INPUT_BUFFER_SIZE 100
#define OUTPUT_BUFFER_SIZE 0
#define DRIVER_INFO NULL
#define TIME_PROC ((int32_t (*)(void *)) Pt_Time)
#define TIME_INFO NULL
#define TIME_START Pt_Start(1, 0, 0) /* timer started w/millisecond accuracy */

#define STRING_MAX 80 /* used for console input */

#define BUFFER_SIZE 200

#define LOSET_FORM 6

// 串口设备句柄
HANDLE comDeviceHandle;
// 串口数据交互缓冲区
int buffer[BUFFER_SIZE];
// 数据缓冲区读写指针
int bufferReaderIndex, bufferWriterIndex;
// 写入串口的数据
char dataBus[1];
// 配置项：全局延迟时间
int latencyTime = 0;

int colorConfigCnt;
struct nodec {
	int r;
	int g;
	int b;
};
nodec colorSettings[100];
nodec activeBgColorConfig;
nodec activeFgColorRgb;
nodec activeBgColorRgb;


int nkey;
// TODO: 解析神迹
int kbcd,kbecd;
char comDeviceName[256];

int cdplus;

int brightness;
// TODO: 启用圈？？
bool enableCircle;
// 启用端点灯
bool enableEndLight;
// 启用日志：push到COM设备的数字
bool enableNumberPushedLog;
// 没有使用
bool unuseNum;


bool on_rainbow;
bool contain_rainbow;
char paddingToIgnore[LONGTH];
// 读取到的全部配置项
struct node1 {
	char a[LONGTH];
};
node1 settings[MAX_SETTING_CNT];
// 配置项总数
int settingCnt;
// 使用的配置项索引
int activeSettingIndex;

bool on_using_channel;
int num_using_channel, num_ignore_channel;
int using_channel[128], ignore_channel[128];

// 启用扩散模式
bool enableExtend;
// 启用残留模式
bool enableRemain;
int extendLedCnt, remainTime;
int rm_times, rm_timer;

bool on_background;
int backgroundBrightness;

int color_default, activeBgColorConfig_default;

struct node2 {
	int key;
	int value;
};
node2 set_form[LOSET_FORM];




bool serialopen() {

	freopen("serial_name.txt", "r", stdin);
	scanf("%s", &comDeviceName);
	freopen("CON", "r", stdin);

	//尝试打开串口
	comDeviceHandle = CreateFile(comDeviceName,//串口名称（请自行通过设备管理器查询串口名称） 
		GENERIC_READ | GENERIC_WRITE, //允许读和写
		0, //独占方式
		0,
		OPEN_EXISTING, //打开而不是创建
		0, //同步方式
		0);

	//检测串口是否已经连接
	if (comDeviceHandle != INVALID_HANDLE_VALUE) {
		printf("Serial connected\n");
		// 串口参数设置
		DCB lpTest;
		GetCommState(comDeviceHandle, &lpTest);  //获取当前的参数设置
		lpTest.BaudRate = CBR_19200;       //设置波特率
		lpTest.ByteSize = 8;              //数据位数为8
		lpTest.Parity = NOPARITY;         //无校验
		lpTest.StopBits = ONESTOPBIT;   //1位停止位
		SetCommState(comDeviceHandle, &lpTest);  //设置通信参数
		return TRUE;
	}
	else {
		SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), 11);
		printf("Serial connection failed .\nPlease check the serial name in serial_name.txt\n\nPress Enter to retry\nPress ESC to quit\n");
		SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), 7);
		// Enter 未按下
		while (!KEY_DOWN(VK_RETURN) || kbcd > 10) {
			if (KEY_DOWN(VK_ESCAPE)) {
				return FALSE;
			}
			kbcd -= 1;
			Sleep(20);
		}
		kbcd += 100;
		serialopen();
	}
}

// 将数据放入缓冲区
void putIntToBuffer(int intData) {
	bufferWriterIndex++;
	if (bufferWriterIndex >= BUFFER_SIZE) {
		bufferWriterIndex -= BUFFER_SIZE;
	}
	buffer[bufferWriterIndex] = intData;
}

// 递归发送数据，直到缓冲区为空后退出
void push() {
	while (bufferReaderIndex != bufferWriterIndex) {
		++bufferReaderIndex;
		if (bufferReaderIndex >= BUFFER_SIZE) {
			bufferReaderIndex -= BUFFER_SIZE;
		}
		dataBus[0] = buffer[bufferReaderIndex];
		// 串口数据交互字节数
		DWORD lpNumberOfBytesWritten;
		WriteFile(comDeviceHandle, dataBus, strlen(dataBus), &lpNumberOfBytesWritten, NULL);
		// 输出发送的数据
		if (enableNumberPushedLog == 1) {
			printf("pushed[%4d]:", buffer[bufferReaderIndex]);
		}
		Sleep(latencyTime);
	}
	Sleep(latencyTime);
}


void effect1(int n) {
	// 这个用于控制关闭全部灯珠，目前90已被干掉
	putIntToBuffer(90);
	push();
	Sleep(latencyTime);
	// 灯效：左->n
	for (int j = 1; j <= n; ++j) {
		putIntToBuffer(j);
		push();
		Sleep(latencyTime);
	}
	// 灯效：左->n 同时 n->右
	for (int j = n + 1; j <= 87; ++j) {
		putIntToBuffer(j);
		putIntToBuffer(j - n);
		push();
		Sleep(latencyTime);
	}
	// 灯效：n->右
	for (int j = 88 - n; j <= 87; ++j) {
		putIntToBuffer(j);
		push();
		Sleep(latencyTime);
	}
	// 与 90 对应的控制信号
	putIntToBuffer(91);
	push();
	Sleep(latencyTime);
	putIntToBuffer(88);
	push();
	Sleep(latencyTime);
}

// 输出提示信息并读取一个整数
int readConsoleIntBy(char *prompt)
{
    char line[STRING_MAX];
    int n = 0, i;
    printf(prompt);
    while (n != 1) {
        n = scanf("%d", &i);
        fgets(line, STRING_MAX, stdin);
    }
    return i;
}


void readSettingConfig() {
	freopen("setting_list.txt", "r", stdin);
	scanf("%d", &settingCnt);
	cin.getline(paddingToIgnore, LONGTH);
	if (settingCnt >= MAX_SETTING_CNT) {
		settingCnt = MAX_SETTING_CNT;
	}
	cout << settingCnt << " settings has been found.\n";
	for (int i = 0; i < settingCnt; ++i) {
		scanf("%s", settings[i].a);
		cin.getline(paddingToIgnore, LONGTH);
		cout << i + 1 << " : " << settings[i].a << "\n";
	}
	freopen("CON", "r", stdin);
	return;
}

void selectSettingToUse() {
	readSettingConfig();
	cout << "Type the number before the setting you want to use.\n";
	scanf("%d", &activeSettingIndex);
	cout << "num " << activeSettingIndex << " has been selected\n";
	activeSettingIndex--;
	return;
}

int readConsoleInt() {
	int num;
	scanf("%s", paddingToIgnore);
	scanf("%d", &num);
	cin.getline(paddingToIgnore, LONGTH);
	return num;
}

void analyzeSetting(int settingIndex) {
	// 拼接配置文件名
	char configFileName[LONGTH];
	strcpy(configFileName, settings[settingIndex].a);
	strcat(configFileName, ".efpdata");
	cout << "file name= " << configFileName << "\n";
	// 打开配置文件
	freopen(configFileName, "r", stdin);
	latencyTime = readConsoleInt();
	unuseNum = readConsoleInt();
	enableNumberPushedLog = readConsoleInt();
	enableCircle = readConsoleInt();
	enableEndLight = readConsoleInt();
	cin.getline(paddingToIgnore, LONGTH);
	scanf("%s", paddingToIgnore);
	cin.getline(paddingToIgnore, LONGTH);
	scanf("%s", comDeviceName);
	cin.getline(paddingToIgnore, LONGTH);
	scanf("%s", paddingToIgnore);
	scanf("%d", &num_using_channel);
	if (num_using_channel == 0) {
		on_using_channel = false;
	}
	else {
		on_using_channel = true;
		for (int i = 0; i < num_using_channel; ++i) {
			scanf("%d", &using_channel[i]);
		}
	}
	cin.getline(paddingToIgnore, LONGTH);
	scanf("%s", paddingToIgnore);
	scanf("%d", &num_ignore_channel);
	for (int i = 0; i < num_ignore_channel; ++i) {
		scanf("%d", &ignore_channel[i]);
	}
	cin.getline(paddingToIgnore, LONGTH);
	brightness = readConsoleInt();
	enableExtend = readConsoleInt();
	extendLedCnt = readConsoleInt();
	enableRemain = readConsoleInt();
	remainTime = readConsoleInt();
	color_default = readConsoleInt();
	color_default--;
	on_background = readConsoleInt();
	backgroundBrightness = readConsoleInt();
	activeBgColorConfig_default = readConsoleInt();
	activeBgColorConfig_default--;
	freopen("CON", "r", stdin);
	return;
}

void printConfigInfo() {
	cout << "latencyTime= " << latencyTime << "\n";
	cout << "ignore= " << unuseNum << "\n";
	cout << "enableNumberPushedLog= " << enableNumberPushedLog << "\n";
	cout << "enableCircle= " << enableCircle << "\n";
	cout << "enableEndLight= " << enableEndLight << "\n";
	cout << "comDeviceName=\n" << comDeviceName << "\n";
	cout << "using_channel= " << num_using_channel << " ";
	for (int i = 0; i < num_using_channel; ++i) {
		cout << using_channel[i] << " ";
	}
	cout << "\n";
	cout << "ignore_channel= " << num_ignore_channel << " ";
	for (int i = 0; i < num_ignore_channel; ++i) {
		cout << ignore_channel[i] << " ";
	}
	cout << "\n";
	cout << "brightness= " << brightness << "\n";
	cout << "extend_on= " << enableExtend << "\n";
	cout << "extend_num= " << extendLedCnt << "\n";
	cout << "remain_on= " << enableRemain << "\n";
	cout << "remain_time= " << remainTime << "\n";
	cout << "color_default= " << color_default+1 << "\n";
	cout << "background_on= " << on_background << "\n";
	cout << "background_brightness= " << backgroundBrightness << "\n";
	cout << "background_color_default= " << activeBgColorConfig_default+1 << "\n";
	return;
}

void writeSettingsToConfigFile(int useset) {
	char configFileName[LONGTH];
	strcpy(configFileName, settings[useset].a);
	strcat(configFileName, ".efpdata");
	freopen(configFileName, "w", stdout);
	printConfigInfo();
	freopen("CON", "w", stdout);
	return;
}

bool readColorConfigFile(int useset) {
	char configFileName[LONGTH];
	strcpy(configFileName, settings[useset].a);
	strcat(configFileName, ".efpcolor");
	freopen(configFileName, "r", stdin);
	scanf("%d", &colorConfigCnt);
	if (colorConfigCnt == 0) {
		cout << "\nNo color has been found.\n";
		return false;
	}
	else {
		for (int i = 0; i < colorConfigCnt; ++i) {
			scanf("%d%d%d", &colorSettings[i].r, &colorSettings[i].g, &colorSettings[i].b);
		}
		freopen("CON", "r", stdin);
		cout << "\n" << colorConfigCnt << " color(s) has been loaded.\n";
		return true;
	}
}

void printAllColorSettings() {
	cout << colorConfigCnt << " color(s) is in this setting\n";
	cout << "num	r	g	b\n";
	for (int i = 0; i < colorConfigCnt; ++i) {
		cout << i+1 << "	" << colorSettings[i].r << "	" << colorSettings[i].g << "	" << colorSettings[i].b << "\n";
	}
}

// TODO: 干掉，无用
void writeColorConfig(int useset) {
	char configFileName[LONGTH];
	strcpy(configFileName, settings[useset].a);
	strcat(configFileName, ".efpcolor");
	freopen(configFileName, "w", stdout);
	cout << colorConfigCnt << "\n";
	for (int i = 0; i < colorConfigCnt; ++i) {
		cout << colorSettings[i].r << " " << colorSettings[i].g << " " << colorSettings[i].b << "\n";
	}
	freopen("CON", "w", stdout);
	cout << "\n" << colorConfigCnt << " color(s) has been write to " << configFileName << "\n";
}

bool same(char a[], char b[]) {
	if (strcmp(a, b) == 0) {
		return true;
	}
	else {
		return false;
	}
}

bool setFgBgColor(int fgColorIndex, int bgColorIndex) {
	if (backgroundBrightness == 0) {
		on_background = false;
		return false;
	}
	else {
		float bgBrightLevel = (float) backgroundBrightness / 256;
		activeBgColorConfig = colorSettings[bgColorIndex];
		activeBgColorRgb.r = activeBgColorConfig.r * bgBrightLevel;
		activeBgColorRgb.g = activeBgColorConfig.g * bgBrightLevel;
		activeBgColorRgb.b = activeBgColorConfig.b * bgBrightLevel;
		activeFgColorRgb.r = colorSettings[fgColorIndex].r - activeBgColorRgb.r;
		activeFgColorRgb.g = colorSettings[fgColorIndex].g - activeBgColorRgb.g;
		activeFgColorRgb.b = colorSettings[fgColorIndex].b - activeBgColorRgb.b;
		cout << "\n" << colorSettings[fgColorIndex].r <<"	"<< colorSettings[fgColorIndex].g <<"	"<< colorSettings[fgColorIndex].b;
		cout << "\n" << activeBgColorRgb.r << "	" << activeBgColorRgb.g << "	" << activeBgColorRgb.b;
		cout << "\n";
		return true;
	}
}

void refreshColor() {
	// 关闭背景灯，然后重新打开
	putIntToBuffer(103);
	putIntToBuffer(102);
	putIntToBuffer(activeBgColorRgb.r);
	putIntToBuffer(activeBgColorRgb.g);
	putIntToBuffer(activeBgColorRgb.b);
	push();
	// 切换前景色
	putIntToBuffer(89);
	putIntToBuffer(activeFgColorRgb.r);
	putIntToBuffer(activeFgColorRgb.g);
	putIntToBuffer(activeFgColorRgb.b);
	push();
	return;
}

void start(int useset) {
	putIntToBuffer(0);
	putIntToBuffer(127);
	push();
	Sleep(100);
	putIntToBuffer(127);
	push();
	putIntToBuffer(89);
	putIntToBuffer(colorSettings[color_default].r);
	putIntToBuffer(colorSettings[color_default].g);
	putIntToBuffer(colorSettings[color_default].b);

	if (setFgBgColor(color_default,activeBgColorConfig_default) == true) {
		if (on_background == true) {
			refreshColor();
		}
		else {
			putIntToBuffer(103);
			push();
		}
	}
	else {
		cout << "\nBackground light disabled.\n";
		putIntToBuffer(103);
		push();
	}
	
	

	if (enableCircle == TRUE) {
		putIntToBuffer(91);
		push();
	}
	else {
		putIntToBuffer(90);
		push();
	}
	if (enableEndLight == FALSE) {
		putIntToBuffer(97);
		push();
	}
	else {
		putIntToBuffer(92);
		push();
	}
	if (enableRemain == TRUE) {
		putIntToBuffer(98);
		putIntToBuffer(remainTime);
		push();
	}
	else {
		putIntToBuffer(99);
		push();
	}
	if (enableExtend == TRUE) {
		putIntToBuffer(96);
		putIntToBuffer(extendLedCnt);
		push();
	}
	else {
		putIntToBuffer(101);
		push();
	}
	putIntToBuffer(93);
	putIntToBuffer(brightness);
	push();
	return;
}



void commandMode() {
	int type = 0;
	char com[LONGTH];
	cout << "\nType help to show the command list\n";
	
	while (1) {
		cout << "> ";
		scanf("%s", com);

		switch (type) {
		case 0:
			if (same(com, "quit") || same(com, "exit") || same(com, "esc") || same(com, "escape")) {
				cout << "\nExited CON mode.\n";
				return;
			}
			if (same(com, "set")) {
				type = 1;
				continue;
			}
			else if (same(com, "show")) {
				type = 2;
				continue;
			}
			else if (same(com, "help")) {
				system("Effect_Piano_Help_File.html");
				continue;
			}
			else if (same(com, "about")) {
				type = 4;
				continue;
			}
			else if (same(com, "shut_down")) {
				exit(0);
			}
			else {
				cout << "\nUnknown command\n";
				type = 0;
				continue;
			}
			
		case 1:
			//set
			if (same(com, "brightness")) {
				cout << "Type the brightness:\n";
				scanf("%d", &brightness);
				if (brightness < 10) {
					brightness = 10;
				}
				if (brightness <= 255) {
					putIntToBuffer(93);
					putIntToBuffer(brightness);
					push();
					writeSettingsToConfigFile(activeSettingIndex);
					cout << "\nBrightness : " << brightness << "\n";
					writeSettingsToConfigFile(activeSettingIndex);
				}
				else {
					cout << "\nInvalid brightness value . This number should be in the range [10,255]\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "extend")) {
				cout << "Type the number of LEDs you want to extend:\n";
				scanf("%d", &extendLedCnt);
				if (extendLedCnt > 10) {
					extendLedCnt = 10;
					cout << "\nThe max value of the number is 10\n";
				}
				else if (extendLedCnt < 0) {
					extendLedCnt = 0;
					cout << "\nThe min value of the number is 0\n";
				}
				if (enableExtend == true) {
					putIntToBuffer(96);
					putIntToBuffer(extendLedCnt);
					push();
				}
				writeSettingsToConfigFile(activeSettingIndex);
				cout << "\nThe number of LEDs to extend : " << extendLedCnt << "\n";
				type = 0;
				continue;
			}
			else if (same(com, "remain")) {
				cout << "Type the time you want the LEDs to remain (second,allow float):\n";
				float rm;
				scanf("%f", &rm);
				remainTime = (int)(rm * 10);
				if (remainTime > 200) {
					remainTime = 200;
					cout << "\nThe max value of the number is 20\n";
				}
				else if (remainTime < 0) {
					remainTime = 0;
					cout << "\nThe min value of the number is 0\n";
				}
				if (enableRemain == true) {
					putIntToBuffer(98);
					putIntToBuffer(remainTime);
					push();
				}
				writeSettingsToConfigFile(activeSettingIndex);
				type = 0;
				continue;
			}
			else if (same(com, "select")) {
				selectSettingToUse();
				putIntToBuffer(125);
				push();
				start(activeSettingIndex);
				readColorConfigFile(activeSettingIndex);
				type = 0;
				continue;
			}
			else if (same(com, "background")) {
				scanf("%s", com);
				if (same(com, "color_default")) {
					scanf("%d", &activeBgColorConfig_default);
					writeSettingsToConfigFile(activeSettingIndex);
					cout << "Default background color : \n" << colorSettings[activeBgColorConfig_default].r << "	" << colorSettings[activeBgColorConfig_default].g << "	" << colorSettings[activeBgColorConfig_default].b << "\n";
					type = 0;
					continue;
				}
				else if (same(com, "brightness")) {
					scanf("%d", &backgroundBrightness);
					if (backgroundBrightness <= 0 || backgroundBrightness >= 256) {
						cout << "This value should be in the range of (0,255]";
						type = 0;
						continue;
					}
					else {
						if (setFgBgColor(color_default, activeBgColorConfig_default) == false) {
							cout << "Disabled background light.\n";
						}
						else {
							cout << "Background brightness = " << backgroundBrightness;
							if (on_background == true) {
								refreshColor();
							}
							writeSettingsToConfigFile(activeSettingIndex);
						}
					}
					type = 0;
					continue;
				}
			}
			else if (same(com, "latencyTime")) {
				scanf("%d", &latencyTime);
				cdplus = 300 / latencyTime;
				cout << "Latency : " << latencyTime << "\n";
			}
			else if (same(com, "using_channel")) {
				cout << "Please type the amount of using channels\n";
				scanf("%d", &num_using_channel);
				if (num_using_channel > 0) {
					on_using_channel = true;
					cout << "Now type " << num_using_channel << " channels:\n";
					for (int i = 0; i < num_using_channel; ++i) {
						scanf("%d", &using_channel[i]);
					}
					cout << num_using_channel << " will be used : \n";
					for (int i = 0; i < num_using_channel; ++i) {
						cout << using_channel[i] << "	";
					}
					cout << "\n";
				}
				else {
					on_using_channel = false;
					cout << "Changed to ignore channel mode.\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "ignore_channel")) {
				cout << "Please type the amount of ignored channels\n";
				scanf("%d", &num_ignore_channel);
				cout << "Now type " << num_ignore_channel << " channels:\n";
				for (int i = 0; i < num_ignore_channel; ++i) {
					scanf("%d", &ignore_channel[i]);
				}
				cout << num_ignore_channel << " will be ignored : \n";
				for (int i = 0; i < num_ignore_channel; ++i) {
					cout << ignore_channel[i] << "	";
				}
				cout << "\n";
			}
			else {
				cout << "Unknown command.\nType help to get help.\n";
				type = 0;
				continue;
			}
		case 2:
			//show
			if (same(com, "log")) {
				bool input_bool;
				scanf("%d", &input_bool);
				if (input_bool == true) {
					enableNumberPushedLog = 1;
					writeSettingsToConfigFile(activeSettingIndex);
					cout << "\nThe number logs will be shown.\n";
				}
				else {
					enableNumberPushedLog = 0;
					writeSettingsToConfigFile(activeSettingIndex);
					cout << "\nThe number logs will not be shown.\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "set")) {
				printConfigInfo();
				type = 0;
				continue;
			}
			else if (same(com, "set_name")) {
				cout <<"set name : "<< settings[activeSettingIndex].a << "\n";
				type = 0;
				continue;
			}
			else if (same(com, "set_list")) {
				cout << "num" << " " << "name\n";
				for (int i = 0; i < settingCnt; ++i) {
					cout << i + 1 << " : " << settings[i].a << "\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "color")) {
				printAllColorSettings();
				type = 0;
				continue;
			}
			else {
				cout << "Unknown command.\nType help to get help.\n";
				type = 0;
				continue;
			}
		}
	}
}


void main_test_input() {
    PmStream * midi;
    PmError status, length;
    PmEvent buffer[1];
	int cmpignore;
	bool flag_ignore,flag_using;
    //int num = 100;
    int i = readConsoleIntBy("Type input number: ");
    /* It is recommended to start timer before Midi; otherwise, PortMidi may
       start the timer with its (default) parameters
     */
    TIME_START;

    /* open input device */
    Pm_OpenInput(&midi, 
                 i,
                 DRIVER_INFO, 
                 INPUT_BUFFER_SIZE, 
                 TIME_PROC, 
                 TIME_INFO);

    printf("Midi Input opened. Reading Midi messages...\n");
    Pm_SetFilter(midi, PM_FILT_ACTIVE | PM_FILT_CLOCK | PM_FILT_SYSEX);
    /* empty the buffer after setting filter, just in case anything
       got through */
    while (Pm_Poll(midi)) {
        Pm_Read(midi, buffer, 1);
    }
    /* now start paying attention to messages */
    //i = 0; /* count messages as they arrive */
    while (1) {

		
		// 组合键：[Shift] + [.]，进入命令行模式
		if ((KEY_DOWN(VK_SHIFT)||KEY_DOWN(VK_LSHIFT)) && KEY_DOWN(VK_OEM_PERIOD)) {
			commandMode();
		}
		
		// 大写锁定键按下
		if (CAPSLOCK_ACTIVE == TRUE) {
			// Esc
			if (KEY_DOWN(VK_ESCAPE)) {
				putIntToBuffer(125);
				push();
				break;
			}
			for (int i = 0; i < settingCnt; ++i) {
				if (KEY_DOWN(set_form[i].key)) {
					activeSettingIndex = set_form[i].value;
					analyzeSetting(activeSettingIndex);
					readColorConfigFile(activeSettingIndex);
					putIntToBuffer(125);
					push();
					start(activeSettingIndex);
				}
			}
			for (int ch = 49; ch < 59; ++ch) {
				if (KEY_DOWN(ch) && kbcd <= 10) {
					if (CTRL_DOWN) {
						activeBgColorConfig_default = ch - 49;
						writeSettingsToConfigFile(activeSettingIndex);
						if (setFgBgColor(color_default, activeBgColorConfig_default)) {
							if (on_background) {
								refreshColor();
							}
							writeSettingsToConfigFile(activeSettingIndex);
						}
						else {
							cout << "\nDisabled background light.\n";
						}
						kbcd += cdplus;
						cout << "\nChanged background light color : " << colorSettings[activeBgColorConfig_default].r << "	" << colorSettings[activeBgColorConfig_default].g << "	" << colorSettings[activeBgColorConfig_default].b << "\n";
					}
					else {
						if (on_background == false) {
							putIntToBuffer(89);
							putIntToBuffer(colorSettings[ch - 49].r);
							putIntToBuffer(colorSettings[ch - 49].g);
							putIntToBuffer(colorSettings[ch - 49].b);
							push();
							color_default = ch - 49;
							writeSettingsToConfigFile(activeSettingIndex);
						}
						else {
							color_default = ch - 49;
							setFgBgColor(color_default, activeBgColorConfig_default);
							refreshColor();
							writeSettingsToConfigFile(activeSettingIndex);
						}
						kbcd += cdplus;
						printf("\nChange_Color:%d %d %d\n", colorSettings[ch - 49].r, colorSettings[ch - 49].g, colorSettings[ch - 49].b);
					}
				}
			}
			
			if (KEY_DOWN('U') && kbecd <= 10) {
				printf("\nEffect1\n");
				effect1(10);
				kbecd += cdplus;
			}
			if (KEY_DOWN(8)/*backspace*/ && kbcd <= 10) {
				putIntToBuffer(88);
				push();
				printf("\nCleared\n");
				kbcd += cdplus;
			}
			if (KEY_DOWN('C') && kbcd <= 10) {
				if (enableCircle == TRUE) {
					enableCircle = FALSE;
					writeSettingsToConfigFile(activeSettingIndex);
					putIntToBuffer(90);
					push();
					printf("\nCircle off\n");
					kbcd += cdplus;
				}
				else {
					enableCircle = TRUE;
					writeSettingsToConfigFile(activeSettingIndex);
					putIntToBuffer(91);
					push();
					printf("\nCircle on\n");
					kbcd += cdplus;
				}
			}
			if (KEY_DOWN('V') && kbcd <= 10) {
				if (enableEndLight == TRUE) {
					enableEndLight = FALSE;
					writeSettingsToConfigFile(activeSettingIndex);
					putIntToBuffer(97);
					push();
					printf("\nThe LEDs on both ends are off\n");
					kbcd += cdplus;
				}
				else {
					enableEndLight = TRUE;
					writeSettingsToConfigFile(activeSettingIndex);
					putIntToBuffer(92);
					push();
					printf("\nThe LEDs on both ends are on\n");
					kbcd += cdplus;
				}
			}
			if (KEY_DOWN('M')) {
				if (on_rainbow == FALSE) {
					putIntToBuffer(93);
					putIntToBuffer(20);
					push();
					putIntToBuffer(90);

					push();
					putIntToBuffer(94);
					push();
					on_rainbow = TRUE;

				}
				else {
					putIntToBuffer(94);
					push();
					Sleep(latencyTime * 2);
				}
			}
			else {
				if (on_rainbow == TRUE) {
					putIntToBuffer(95);
					push();
					putIntToBuffer(93);
					putIntToBuffer(brightness);
					on_rainbow = FALSE;
					if (enableCircle == TRUE) {
						putIntToBuffer(91);
						push();
					}
				}
			}
			if (KEY_DOWN('M') && CTRL_DOWN && kbcd <= 10) {
				if (contain_rainbow == FALSE) {
					putIntToBuffer(93);
					putIntToBuffer(20);
					push();
					putIntToBuffer(90);
					push();
					putIntToBuffer(94);
					push();
					contain_rainbow = TRUE;
				}
				else {
					putIntToBuffer(95);
					push();
					putIntToBuffer(93);
					putIntToBuffer(brightness);
					contain_rainbow = FALSE;
					putIntToBuffer(88);
					push();


					if (enableCircle == TRUE) {
						putIntToBuffer(91);
						push();
						enableCircle = TRUE;
					}
				}
				kbcd += cdplus ;
			}
			if (KEY_DOWN('Z') && kbcd <= 10) {
				if (enableExtend == TRUE) {
					enableExtend = FALSE;
					putIntToBuffer(101);
					push();
					//extendLedCnt = 0;
					writeSettingsToConfigFile(activeSettingIndex);
					printf("\nExtension Off\n");
				}
				else {
					enableExtend = TRUE;
					//scanf("%*[^\n]%*c");
					putIntToBuffer(96);
					putIntToBuffer(extendLedCnt);
					push();
					writeSettingsToConfigFile(activeSettingIndex);
					printf("\nExtension On\n");
				}
				kbcd += cdplus ;
			}
			if (KEY_DOWN('X') && kbcd <= 10) {
				if (enableRemain == TRUE) {
					enableRemain = FALSE;
					putIntToBuffer(99);
					push();
					//remainTime = 0;
					writeSettingsToConfigFile(activeSettingIndex);
					printf("\nRemain off\n");
				}
				else {
					enableRemain = TRUE;
					rm_times = remainTime *1000/ 200 / latencyTime;
					putIntToBuffer(98);
					putIntToBuffer(remainTime);
					push();
					writeSettingsToConfigFile(activeSettingIndex);
					printf("\nRemain on\n");
				}
				kbcd += cdplus;
			}
			else if (KEY_DOWN('B') && kbcd <= 10) {
				if (on_background == true) {
					on_background = false;
					putIntToBuffer(103);
					push();
					writeSettingsToConfigFile(activeSettingIndex);
					cout << "\nBackground light off\n";
					kbcd += cdplus;
				}
				else {
					if (setFgBgColor(color_default, activeBgColorConfig_default) == true) {
						on_background = true;
						refreshColor();
						writeSettingsToConfigFile(activeSettingIndex);
						cout << "\nBackground light on\n";
						
					}
					else {
						cout << "\nDisabled background light\n";
					}
					kbcd += cdplus;
				}
			}
		}
		
		
		if (kbcd > 0) {
			kbcd -= 1;
		}
		if (kbecd > 0) {
			kbecd -= 1;
		}

		if (contain_rainbow == TRUE) {
			putIntToBuffer(94);
			push();
			Sleep(latencyTime*5);
			continue;
		}
		

        status = Pm_Poll(midi);
        if (status == TRUE) {
            length = (PmError)Pm_Read(midi,buffer, 1);
            if (length > 0) {
				cmpignore = Pm_MessageStatus(buffer[0].message);

				if (num_using_channel == FALSE) {
					flag_ignore = FALSE;
					for (int i = 0; i < num_ignore_channel; ++i) {
						if (cmpignore == ignore_channel[i]) {
							flag_ignore = TRUE;
							break;
						}
					}
					if (flag_ignore == FALSE) {
						if (enableNumberPushedLog == 1) {
							printf("channal=%d	", Pm_MessageStatus(buffer[0].message));
						}
						putIntToBuffer(Pm_MessageData1(buffer[0].message) - 20);
						push();
					}
				}
				else {
					flag_using = FALSE;
					for (int i = 0; i < num_using_channel; ++i) {
						if (cmpignore == using_channel[i]) {
							flag_using = TRUE;
							break;
						}
					}
					if (flag_using == TRUE) {
						if (enableNumberPushedLog == 1) {
							printf("channal = %d	", Pm_MessageStatus(buffer[0].message));
						}
						putIntToBuffer(Pm_MessageData1(buffer[0].message) - 20);
						push();
					}
				}

				
				

            } else {
                assert(0);
            }
        }
		if (enableRemain == TRUE) {
			rm_timer++;
			if (rm_timer >= rm_times) {
				rm_timer = 0;
				putIntToBuffer(100);
				push();
			}
		}
		Sleep(latencyTime);
		
    }

    /* close device (this not explicitly needed in most implementations) */
    printf("\nready to close...");

    Pm_Close(midi);
    printf("done closing...");
	return;
}



int main(int argc, char *argv[]){

	printf("Loading...\n\n");
	int default_in;
    int default_out;
    int i = 0, n = 0;
    //char line[STRING_MAX];
    int test_input = 0, test_output = 0, test_both = 0;
    int stream_test = 0;
    int latencyTime_valid = FALSE;

	// 移动窗口
	char contitle[255];
	HWND desktop,selfhwnd;
	RECT desktoprect;
	desktop = GetDesktopWindow();
	GetWindowRect(desktop, &desktoprect);
	GetConsoleTitle(contitle, 255);
	selfhwnd = FindWindow("ConsoleWindowClass", contitle);
	MoveWindow(selfhwnd, (desktoprect.right - desktoprect.left) / 3*2, 0, (desktoprect.right - desktoprect.left) / 3,desktoprect.bottom - desktoprect.top,FALSE);
	
	set_form[0].key = 'Q';
	set_form[1].key = 'W';
	set_form[2].key = 'E';
	set_form[3].key = 'R';
	set_form[4].key = 'T';
	set_form[5].key = 'Y';
	for (int i = 0; i < LOSET_FORM; ++i) {
		set_form[i].value = i;
	}
	

	selectSettingToUse();
	analyzeSetting(activeSettingIndex);
	//printConfigInfo(activeSettingIndex);
	cdplus = 300 / latencyTime;
	if (serialopen() == FALSE) {
		return 0;
	}
	readColorConfigFile(activeSettingIndex);
	start(activeSettingIndex);
	cout << "\n";

    /* list device information */
	test_input = 1;
    default_in = Pm_GetDefaultInputDeviceID();
    default_out = Pm_GetDefaultOutputDeviceID();
    for (i = 0; i < Pm_CountDevices(); i++) {
        const char *deflt;
        const PmDeviceInfo *info = Pm_GetDeviceInfo(i);
        if (((test_input  | test_both) & info->input) |
            ((test_output | test_both | stream_test) & info->output)) {
            printf("%d: %s, %s", i, info->interf, info->name);
            if (info->input) {
                deflt = (i == default_in ? "default " : "");
                printf(" (%sinput)", deflt);
            }
            if (info->output) {
                deflt = (i == default_out ? "default " : "");
                printf(" (%soutput)", deflt);
            }
            printf("\n");
        }
    }
	
	main_test_input();

	cout << "\nGoing to exit in 1 second\n";
	Sleep(1000);

    return 0;
}
