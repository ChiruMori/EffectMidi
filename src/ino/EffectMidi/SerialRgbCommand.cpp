#include "headers/SerialCommand.hpp"

CRGB SerialRgbCommand::parseColor(const String &cmd)
{
  auto args = cmd.substring(getName().length() + 1);
  auto colorR = args.substring(0, args.indexOf(',')).toInt();
  auto colorG = args.substring(args.indexOf(',') + 1, args.lastIndexOf(',')).toInt();
  auto colorB = args.substring(args.lastIndexOf(',') + 1).toInt();
  return CRGB(colorR, colorG, colorB);
}
