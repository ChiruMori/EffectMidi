# 进展&规划

## 开发日志

### V1.0

[里程碑版本](https://github.com/ChiruMori/EffectMidi/milestone/1)，实现预期的基本功能

- 调研（Done）
  - 调研 Firmdata 协议
  - 调研 Rust 图形化相关技术、组件库
- 实施
  - 图形化重建（Processing）
  - UI设计、交互实现
  - 重新设计与开发板的指令交互
  - 配置：色彩、残留、扩散、多语言
  - 更多可控、可交互的灯光效果

### [effect_piano 重构](https://github.com/ChiruMori/EffectMidi/tree/effect_piano_refactor)

修复了影响使用的 BUG，重构了双端代码，重构了控制端项目结构

- 解读项目代码、整理（Done）
  - 修复第 88 键BUG，右侧端点灯不亮的问题（Done）
  - ~~当前记键位的使用方式重写为命令行菜单方式~~
  - ~~必要的文档编写~~

## 更多

- 自动更新
- 外接视频源
