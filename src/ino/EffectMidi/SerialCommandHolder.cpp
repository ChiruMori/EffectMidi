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
  registerCommand(&SetResidualTimeCmd::getInstance(ledController));
  registerCommand(&SetDiffusionWidthCmd::getInstance(ledController));
  registerCommand(&SetEndLightsColorCmd::getInstance(ledController));
}

SerialCommand *SerialCommandHolder::getCommand(const int cmdNameByte)
{
  if (cmdNameByte >= CMD_OFFSET_KEY_DOWN && cmdNameByte < CMD_OFFSET_KEY_UP)
  {
    return commands[CMD_BYTE_KEY_DOWN];
  }
  if (cmdNameByte >= CMD_OFFSET_KEY_UP)
  {
    return commands[CMD_BYTE_KEY_UP];
  }
  if (cmdNameByte < 0) {
    return nullptr;
  }
  if (commands[cmdNameByte])
  {
    return commands[cmdNameByte];
  }
  return nullptr;
}

void SerialCommandHolder::processByte(const int byte, const bool noData, OledController &oled)
{
  if (state == STATE_INIT)
  {
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
    // 无需参数的指令，直接执行
    // key 指令执行前，需要检查 switch 状态
    auto keyEnabled = digitalRead(KEY_SWITCH_PIN) == LOW;
    // key down
    uint8_t *args = nullptr;
    if (keyEnabled && byte >= CMD_OFFSET_KEY_DOWN && byte < CMD_OFFSET_KEY_UP)
    {
      args = new uint8_t[1];
      args[0] = byte - CMD_OFFSET_KEY_DOWN;
    }
    else if (keyEnabled && byte >= CMD_OFFSET_KEY_UP)
    {
      args = new uint8_t[1];
      args[0] = byte - CMD_OFFSET_KEY_UP;
    }
    command->execute(args);
    state = STATE_INIT;
    Serial.write(SUCCESS_RESP_BYTE);
    delete[] args;
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
  // 读取参数，参数数量足够时执行指令
  argsBuffer[state++] = byte;
  if (state == currentCommand->getArgCount())
  {
    currentCommand->execute(argsBuffer);
    // oled.displayData(currentCommand->getNameByte(), argsBuffer, state);
    state = STATE_INIT;
    Serial.write(SUCCESS_RESP_BYTE);
  }
}
