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
#define NUM_SET 128


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

int num_color;
struct nodec {
	int r;
	int g;
	int b;
};
nodec color[100];
nodec color_background;
nodec color_plus;
nodec color_bg_real;


int nkey;
int kbcd,kbecd;
char serialname[256];

int cdplus;

int brightness;
bool on_circle, on_ends;
bool show_in_front, enableNumberPushedLog;


bool on_rainbow;
bool contain_rainbow;

int num_set, using_set;
char rubbish[LONGTH];
struct node1 {
	char a[LONGTH];
};
node1 name_set[NUM_SET];

bool on_using_channel;
int num_using_channel, num_ignore_channel;
int using_channel[128], ignore_channel[128];

bool on_extend, on_remain;
int num_extend, num_remain;
int rm_times, rm_timer;

bool on_background;
int bright_background;

int color_default, color_background_default;

struct node2 {
	int key;
	int value;
};
node2 set_form[LOSET_FORM];




bool serialopen() {

	freopen("serial_name.txt", "r", stdin);
	scanf("%s", &serialname);
	freopen("CON", "r", stdin);

	//尝试打开串口
	comDeviceHandle = CreateFile(serialname,//串口名称（请自行通过设备管理器查询串口名称） 
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
	//return FALSE;

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
	if (bufferReaderIndex != bufferWriterIndex) {
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
		push();
	}
	else {
		Sleep(latencyTime);
		return;
	}
}


void effect1(int n) {
	putIntToBuffer(90);
	push();
	Sleep(latencyTime);
	for (int j = 1; j <= n; ++j) {
		putIntToBuffer(j);
		push();
		Sleep(latencyTime);
	}
	for (int j = n + 1; j <= 87; ++j) {
		putIntToBuffer(j);
		putIntToBuffer(j - n);
		push();
		Sleep(latencyTime);
	}
	for (int j = 88 - n; j <= 87; ++j) {
		putIntToBuffer(j);
		push();
		Sleep(latencyTime);
	}
	putIntToBuffer(91);
	push();
	Sleep(latencyTime);
	putIntToBuffer(88);
	push();
	Sleep(latencyTime);
}


/* read a number from console */
int get_number(char *prompt)
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


void show_set() {
	freopen("setting_list.txt", "r", stdin);
	scanf("%d", &num_set);
	cin.getline(rubbish, LONGTH);
	if (num_set >= NUM_SET) {
		num_set = NUM_SET;
	}
	cout << num_set << " settings has been found.\n";
	for (int i = 0; i < num_set; ++i) {
		scanf("%s", name_set[i].a);
		cin.getline(rubbish, LONGTH);
		cout << i + 1 << " : " << name_set[i].a << "\n";
	}
	freopen("CON", "r", stdin);

	return;
}

void select_set() {
	show_set();
	cout << "Type the number before the setting you want to use.\n";
	scanf("%d", &using_set);
	cout << "num " << using_set << " has been selected\n";
	using_set--;
	return;
}

int read_num() {
	int num;
	scanf("%s", rubbish);
	scanf("%d", &num);
	cin.getline(rubbish, LONGTH);
	return num;
}

void read_set(int useset) {
	char file_name[LONGTH];
	strcpy(file_name, name_set[useset].a);
	strcat(file_name, ".efpdata");
	cout << "file name= " << file_name << "\n";
	freopen(file_name, "r", stdin);
	latencyTime = read_num();
	show_in_front = read_num();
	enableNumberPushedLog = read_num();
	on_circle = read_num();
	on_ends = read_num();
	cin.getline(rubbish, LONGTH);
	//cout << "rubbish= " << rubbish << "\n";
	scanf("%s", rubbish);
	cin.getline(rubbish, LONGTH);
	scanf("%s", serialname);
	cin.getline(rubbish, LONGTH);
	scanf("%s", rubbish);
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
	cin.getline(rubbish, LONGTH);
	scanf("%s", rubbish);
	scanf("%d", &num_ignore_channel);
	for (int i = 0; i < num_ignore_channel; ++i) {
		scanf("%d", &ignore_channel[i]);
	}
	cin.getline(rubbish, LONGTH);
	brightness = read_num();
	on_extend = read_num();
	num_extend = read_num();
	on_remain = read_num();
	num_remain = read_num();
	color_default = read_num();
	color_default--;
	on_background = read_num();
	bright_background = read_num();
	color_background_default = read_num();
	color_background_default--;
	freopen("CON", "r", stdin);
	return;
}

void print_set(int useset) {
	cout << "latencyTime= " << latencyTime << "\n";
	cout << "show_in_front= " << show_in_front << "\n";
	cout << "show_number_log= " << enableNumberPushedLog << "\n";
	cout << "circle_on= " << on_circle << "\n";
	cout << "LEDs_at_two_end= " << on_ends << "\n";
	cout << "serial_name=\n" << serialname << "\n";
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
	cout << "extend_on= " << on_extend << "\n";
	cout << "extend_num= " << num_extend << "\n";
	cout << "remain_on= " << on_remain << "\n";
	cout << "remain_time= " << num_remain << "\n";
	cout << "color_default= " << color_default+1 << "\n";
	cout << "background_on= " << on_background << "\n";
	cout << "background_brightness= " << bright_background << "\n";
	cout << "background_color_default= " << color_background_default+1 << "\n";
	return;
}

void write_set(int useset) {
	char file_name[LONGTH];
	strcpy(file_name, name_set[useset].a);
	strcat(file_name, ".efpdata");
	//cout << "file name= " << file_name << "\n";
	freopen(file_name, "w", stdout);
	print_set(useset);
	freopen("CON", "w", stdout);
	return;
}

bool read_color(int useset) {
	char file_name[LONGTH];
	strcpy(file_name, name_set[useset].a);
	strcat(file_name, ".efpcolor");
	freopen(file_name, "r", stdin);
	scanf("%d", &num_color);
	if (num_color == 0) {
		cout << "\nNo color has been found.\n";
		return false;
	}
	else {
		for (int i = 0; i < num_color; ++i) {
			scanf("%d%d%d", &color[i].r, &color[i].g, &color[i].b);
		}
		freopen("CON", "r", stdin);
		cout << "\n" << num_color << " color(s) has been loaded.\n";
		return true;
	}
}

void print_color(int useset) {
	cout << num_color << " color(s) is in this setting\n";
	cout << "num	r	g	b\n";
	for (int i = 0; i < num_color; ++i) {
		cout << i+1 << "	" << color[i].r << "	" << color[i].g << "	" << color[i].b << "\n";
	}
	return;
}

void write_color(int useset) {
	char file_name[LONGTH];
	strcpy(file_name, name_set[useset].a);
	strcat(file_name, ".efpcolor");
	freopen(file_name, "w", stdout);
	cout << num_color << "\n";
	for (int i = 0; i < num_color; ++i) {
		cout << color[i].r << " " << color[i].g << " " << color[i].b << "\n";
	}
	freopen("CON", "w", stdout);
	cout << "\n" << num_color << " color(s) has been write to " << file_name << "\n";
	return;
}

bool same(char a[], char b[]) {
	if (strcmp(a, b) == 0) {
		return true;
	}
	else {
		return false;
	}
}

bool get_bg_color(int colora,int bgcolor) {
	if (bright_background == 0) {
		on_background = false;
		return false;
	}
	else {
		float vs_float;
		vs_float = (float)bright_background / 256;
		color_background = color[bgcolor];
		color_bg_real.r = color_background.r*vs_float;
		color_bg_real.g = color_background.g*vs_float;
		color_bg_real.b = color_background.b*vs_float;
		color_plus.r = color[colora].r - color_bg_real.r;
		color_plus.g = color[colora].g - color_bg_real.g;
		color_plus.b = color[colora].b - color_bg_real.b;
		cout << "\n" << color[colora].r <<"	"<< color[colora].g <<"	"<< color[colora].b;
		cout << "\n" << color_bg_real.r << "	" << color_bg_real.g << "	" << color_bg_real.b;
		cout << "\n";
		return true;
	}
}
void refresh_bg() {
	//bool a = get_bg_color(color_default, color_background_default);
	putIntToBuffer(103);
	putIntToBuffer(102);
	putIntToBuffer(color_bg_real.r);
	putIntToBuffer(color_bg_real.g);
	putIntToBuffer(color_bg_real.b);
	push();
	putIntToBuffer(89);
	putIntToBuffer(color_plus.r);
	putIntToBuffer(color_plus.g);
	putIntToBuffer(color_plus.b);
	//cout << "colorp=" << color_plus.r << "	" << color_plus.g << "	" << color_plus.b << "\n";
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
	putIntToBuffer(color[color_default].r);
	putIntToBuffer(color[color_default].g);
	putIntToBuffer(color[color_default].b);

	if (get_bg_color(color_default,color_background_default) == true) {
		if (on_background == true) {
			refresh_bg();
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
	
	

	if (on_circle == TRUE) {
		putIntToBuffer(91);
		push();
	}
	else {
		putIntToBuffer(90);
		push();
	}
	if (on_ends == FALSE) {
		putIntToBuffer(97);
		push();
	}
	else {
		putIntToBuffer(92);
		push();
	}
	if (on_remain == TRUE) {
		putIntToBuffer(98);
		putIntToBuffer(num_remain);
		push();
	}
	else {
		putIntToBuffer(99);
		push();
	}
	if (on_extend == TRUE) {
		putIntToBuffer(96);
		putIntToBuffer(num_extend);
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



void con_mode() {
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
					write_set(using_set);
					cout << "\nBrightness : " << brightness << "\n";
					write_set(using_set);
				}
				else {
					cout << "\nInvalid brightness value . This number should be in the range [10,255]\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "extend")) {
				cout << "Type the number of LEDs you want to extend:\n";
				scanf("%d", &num_extend);
				if (num_extend > 10) {
					num_extend = 10;
					cout << "\nThe max value of the number is 10\n";
				}
				else if (num_extend < 0) {
					num_extend = 0;
					cout << "\nThe min value of the number is 0\n";
				}
				if (on_extend == true) {
					putIntToBuffer(96);
					putIntToBuffer(num_extend);
					push();
				}
				write_set(using_set);
				cout << "\nThe number of LEDs to extend : " << num_extend << "\n";
				type = 0;
				continue;
			}
			else if (same(com, "remain")) {
				cout << "Type the time you want the LEDs to remain (second,allow float):\n";
				float rm;
				scanf("%f", &rm);
				num_remain = (int)(rm * 10);
				if (num_remain > 200) {
					num_remain = 200;
					cout << "\nThe max value of the number is 20\n";
				}
				else if (num_remain < 0) {
					num_remain = 0;
					cout << "\nThe min value of the number is 0\n";
				}
				if (on_remain == true) {
					putIntToBuffer(98);
					putIntToBuffer(num_remain);
					push();
				}
				write_set(using_set);
				type = 0;
				continue;
			}
			else if (same(com, "select")) {
				select_set();
				putIntToBuffer(125);
				push();
				start(using_set);
				read_color(using_set);
				type = 0;
				continue;
			}
			else if (same(com, "background")) {
				scanf("%s", com);
				if (same(com, "color_default")) {
					scanf("%d", &color_background_default);
					write_set(using_set);
					cout << "Default background color : \n" << color[color_background_default].r << "	" << color[color_background_default].g << "	" << color[color_background_default].b << "\n";
					type = 0;
					continue;
				}
				else if (same(com, "brightness")) {
					scanf("%d", &bright_background);
					if (bright_background <= 0 || bright_background >= 256) {
						cout << "This value should be in the range of (0,255]";
						type = 0;
						continue;
					}
					else {
						if (get_bg_color(color_default, color_background_default) == false) {
							cout << "Disabled background light.\n";
						}
						else {
							cout << "Background brightness = " << bright_background;
							if (on_background == true) {
								refresh_bg();
							}
							write_set(using_set);
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
					write_set(using_set);
					cout << "\nThe number logs will be shown.\n";
				}
				else {
					enableNumberPushedLog = 0;
					write_set(using_set);
					cout << "\nThe number logs will not be shown.\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "set")) {
				print_set(using_set);
				type = 0;
				continue;
			}
			else if (same(com, "set_name")) {
				cout <<"set name : "<< name_set[using_set].a << "\n";
				type = 0;
				continue;
			}
			else if (same(com, "set_list")) {
				cout << "num" << " " << "name\n";
				for (int i = 0; i < num_set; ++i) {
					cout << i + 1 << " : " << name_set[i].a << "\n";
				}
				type = 0;
				continue;
			}
			else if (same(com, "color")) {
				print_color(using_set);
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


void main_test_input() {
    PmStream * midi;
    PmError status, length;
    PmEvent buffer[1];
	int cmpignore;
	bool flag_ignore,flag_using;
    //int num = 100;
    int i = get_number("Type input number: ");
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

		
		// 组合键：[Shift] + [.]
		if ((KEY_DOWN(VK_SHIFT)||KEY_DOWN(VK_LSHIFT)) && KEY_DOWN(VK_OEM_PERIOD)) {
			con_mode();
		}
		
		// 大写锁定键按下
		if (CAPSLOCK_ACTIVE == TRUE) {
			// Esc
			if (KEY_DOWN(VK_ESCAPE)) {
				putIntToBuffer(125);
				push();
				break;
			}
			for (int i = 0; i < num_set; ++i) {
				if (KEY_DOWN(set_form[i].key)) {
					using_set = set_form[i].value;
					read_set(using_set);
					read_color(using_set);
					putIntToBuffer(125);
					push();
					start(using_set);
				}
			}
			for (int ch = 49; ch < 59; ++ch) {
				if (KEY_DOWN(ch) && kbcd <= 10) {
					if (CTRL_DOWN) {
						color_background_default = ch - 49;
						write_set(using_set);
						if (get_bg_color(color_default, color_background_default)) {
							if (on_background) {
								refresh_bg();
							}
							write_set(using_set);
						}
						else {
							cout << "\nDisabled background light.\n";
						}
						kbcd += cdplus;
						cout << "\nChanged background light color : " << color[color_background_default].r << "	" << color[color_background_default].g << "	" << color[color_background_default].b << "\n";
					}
					else {
						if (on_background == false) {
							putIntToBuffer(89);
							putIntToBuffer(color[ch - 49].r);
							putIntToBuffer(color[ch - 49].g);
							putIntToBuffer(color[ch - 49].b);
							push();
							color_default = ch - 49;
							write_set(using_set);
						}
						else {
							color_default = ch - 49;
							get_bg_color(color_default, color_background_default);
							refresh_bg();
							write_set(using_set);
						}
						kbcd += cdplus;
						printf("\nChange_Color:%d %d %d\n", color[ch - 49].r, color[ch - 49].g, color[ch - 49].b);
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
				if (on_circle == TRUE) {
					on_circle = FALSE;
					write_set(using_set);
					putIntToBuffer(90);
					push();
					printf("\nCircle off\n");
					kbcd += cdplus;
				}
				else {
					on_circle = TRUE;
					write_set(using_set);
					putIntToBuffer(91);
					push();
					printf("\nCircle on\n");
					kbcd += cdplus;
				}
			}
			if (KEY_DOWN('V') && kbcd <= 10) {
				if (on_ends == TRUE) {
					on_ends = FALSE;
					write_set(using_set);
					putIntToBuffer(97);
					push();
					printf("\nThe LEDs on both ends are off\n");
					kbcd += cdplus;
				}
				else {
					on_ends = TRUE;
					write_set(using_set);
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
					if (on_circle == TRUE) {
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


					if (on_circle == TRUE) {
						putIntToBuffer(91);
						push();
						on_circle = TRUE;
					}
				}
				kbcd += cdplus ;
			}
			if (KEY_DOWN('Z') && kbcd <= 10) {
				if (on_extend == TRUE) {
					on_extend = FALSE;
					putIntToBuffer(101);
					push();
					//num_extend = 0;
					write_set(using_set);
					printf("\nExtension Off\n");
				}
				else {
					on_extend = TRUE;
					//scanf("%*[^\n]%*c");
					putIntToBuffer(96);
					putIntToBuffer(num_extend);
					push();
					write_set(using_set);
					printf("\nExtension On\n");
				}
				kbcd += cdplus ;
			}
			if (KEY_DOWN('X') && kbcd <= 10) {
				if (on_remain == TRUE) {
					on_remain = FALSE;
					putIntToBuffer(99);
					push();
					//num_remain = 0;
					write_set(using_set);
					printf("\nRemain off\n");
				}
				else {
					on_remain = TRUE;
					rm_times = num_remain *1000/ 200 / latencyTime;
					putIntToBuffer(98);
					putIntToBuffer(num_remain);
					push();
					write_set(using_set);
					printf("\nRemain on\n");
				}
				kbcd += cdplus;
			}
			else if (KEY_DOWN('B') && kbcd <= 10) {
				if (on_background == true) {
					on_background = false;
					putIntToBuffer(103);
					push();
					write_set(using_set);
					cout << "\nBackground light off\n";
					kbcd += cdplus;
				}
				else {
					if (get_bg_color(color_default, color_background_default) == true) {
						on_background = true;
						refresh_bg();
						write_set(using_set);
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
                /*printf("time %ld, %d %d %2lx\n",
                       
                       (long) buffer[0].timestamp,
                       (long) Pm_MessageStatus(buffer[0].message),
                       (long) Pm_MessageData1(buffer[0].message),
                       (long) Pm_MessageData2(buffer[0].message));
					   */
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
		if (on_remain == TRUE) {
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
	

	select_set();
	read_set(using_set);
	//print_set(using_set);
	cdplus = 300 / latencyTime;
	if (serialopen() == FALSE) {
		return 0;
	}
	read_color(using_set);
	start(using_set);
	cout << "\n";

    /* list device information */
	test_input = 1;
    default_in = Pm_GetDefaultInputDeviceID();
    default_out = Pm_GetDefaultOutputDeviceID();
    for (i = 0; i < Pm_CountDevices(); i++) {
        char *deflt;
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
