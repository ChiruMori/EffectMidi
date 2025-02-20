#include "headers/SerialCommandHolder.hpp"

SerialCommandHolder::SerialCommandHolder(LEDController &ledController) : ledController(ledController)
{
  commands = new SerialCommand *[COMMAND_NUM];
  for (uint8_t i = 0; i < COMMAND_NUM; ++i)
  {
    commands[i] = nullptr;
  }
  for (uint8_t i = 0; i < MAX_ARG_COUNT; ++i)
  {
    argsBuffer[i] = 0;
  }
  state = STATE_INIT;
  currentCommand = nullptr;
  startTime = 0;
}

void SerialCommandHolder::registerCommand(SerialCommand *command)
{
  commands[command->getNameByte()] = command;
}

void SerialCommandHolder::createAllCommands(LEDController &ledController)
{
  registerCommand(&WaitingCmd::getInstance(ledController));
  registerCommand(&SetBackgroundColorCmd::getInstance(ledController));
  registerCommand(&SetForegroundColorCmd::getInstance(ledController));
  registerCommand(&KeyDownCommand::getInstance(ledController));
  registerCommand(&KeyUpCommand::getInstance(ledController));
  registerCommand(&SetBrightnessCmd::getInstance(ledController));
  registerCommand(&SetResidualTimeCmd::getInstance(ledController));
  registerCommand(&SetDiffusionWidthCmd::getInstance(ledController));
  registerCommand(&SetEndLightsColorCmd::getInstance(ledController));
  registerCommand(&ColorPreviewCmd::getInstance(ledController));
}

SerialCommand *SerialCommandHolder::getCommand(const int cmdNameByte)
{
  if (commands[cmdNameByte])
  {
    return commands[cmdNameByte];
  }
  return nullptr;
}

void SerialCommandHolder::processByte(const int byte, const bool noData, OledController &oled)
{
  if (state == STATE_SPLIT)
  {
    if (byte == CMD_SPLIT_INT)
    {
      state = STATE_INIT;
    }
  }
  else if (state == STATE_INIT)
  {
    // TODO: 不按预期干活，出现 Timeout，Lead Byte 可能有问题，高频指令问题并未解决
    // 指令意外中断时，丢弃当前指令
    if (byte == CMD_SPLIT_INT)
    {
      state = STATE_SPLIT;
      Serial.write(FAIL_RESP_BYTE);
      oled.log("Split byte received before command byte.");
      return;
    }
    // 根据字节获取指令对象
    auto command = getCommand(byte);
    if (command == nullptr)
    {
      if (!noData)
      {
        oled.log("Unknown cmd byte: " + String(byte, HEX));
        Serial.write(FAIL_RESP_BYTE);
      }
      return;
    }
    // 可识别的指令，开始计时
    startTime = millis();
    auto argCount = command->getArgCount();
    if (argCount > 0)
    {
      state = 0;
      currentCommand = command;
      return;
    }
    command->execute(nullptr);
    state = STATE_INIT;
    // 仅有 Wait 指令不需要返回成功响应
    // Serial.write(SUCCESS_RESP_BYTE);
    return;
  }
  // 无数据
  if (noData)
  {
    // 总等待时间已超时，清空缓冲区，返回超时响应
    if (millis() - startTime > COMMAND_PARSE_TIMEOUT)
    {
      oled.log("Timeout: " + String(currentCommand->getNameByte()) + "Data: [" + String(argsBuffer[0], HEX) + "," + String(argsBuffer[1], HEX) + "," + String(argsBuffer[2], HEX) + "]");
      state = STATE_INIT;
      Serial.write(TIMEOUT_RESP_BYTE);
    }
    // 未超时，滚回去等数据
    return;
  }
  if (byte == CMD_SPLIT_INT)
  {
    // 指令中断，清空缓冲区，返回失败响应
    state = STATE_INIT;
    Serial.write(FAIL_RESP_BYTE);
    oled.log("Terminate: " + String(currentCommand->getNameByte()) + "Data: [" + String(argsBuffer[0], HEX) + "," + String(argsBuffer[1], HEX) + "," + String(argsBuffer[2], HEX) + "]");
    return;
  }
  // 读取参数，参数数量足够时执行指令
  argsBuffer[state++] = byte;
  if (state == currentCommand->getArgCount())
  {
    currentCommand->execute(argsBuffer);
    oled.displayData(currentCommand->getNameByte(), argsBuffer, state);
    state = STATE_INIT;
    Serial.write(SUCCESS_RESP_BYTE);
  }
}
