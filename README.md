# EffectMidi

进展&规划：[CHANGELOG.log](CHANGELOG.md)

## 说明

本项目受[Effect_Piano_light_controller](https://github.com/esun-z/Effect_Piano_light_controller)启发，通过桌面端控制 MIDI 键盘的外置灯光效果，通过读取 MIDI 键盘输入，控制灯带的效果。

项目代码会在 Windows 的控制端和开发板上运行，需要以下设备：

- Arduino 开发板
- WS2812B 灯带
- MIDI 键盘（88键）
- Windows 设备（暂不支持其他平台）

### 使用方法

[原项目帮助文档](https://www.bilibili.com/read/cv6327363)

### 工作原理

1. Windows 控制端读取 MIDI 输入设备的 MIDI 信号
2. Windows 控制端通过 USB 串口发送指定的信号到 Arduino 开发板
3. Arduino 开发板接受控制信号后控制 LED 的效果

## 开发环境

### 硬件设备

见[说明](#说明)部分，不能缺少。

### PC 控制端

项目使用 [electron-vite](https://electron-vite.org/config/) 构建，推荐使用 [Visual Studio Code](https://code.visualstudio.com/) 编辑器（并建议安装 `Tailwind CSS IntelliSense`, `Prettier - Code formatter`, `EditorConfig for VS Code`, `stylus`）。

开发环境下，启动后可以通过 `F12` 打开开发者工具。

- `pnpm install` 安装依赖
- `pnpm dev` 启动开发环境
- `pnpm build:win` 打包 Windows 版本
- `pnpm build:mac` 打包 macOS 版本
- `pnpm build:linux` 打包 Linux 版本

### Arduino 开发板端

推荐使用 [Arduino IDE](https://www.arduino.cc/en/software)。暂未发现 VSCode 上 Arduino 的合适插件，仍需依赖 Arduino IDE 完成开发（验证、上传、依赖）。

依赖下列库：

- [FastLED](https://fastled.io/)
