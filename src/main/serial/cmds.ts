/* eslint-disable @typescript-eslint/no-explicit-any */
const CMD_BYTE_WAITING = 0x00
const CMD_BYTE_SET_FOREGROUND_COLOR = 0x01
const CMD_BYTE_SET_BACKGROUND_COLOR = 0x02
const CMD_BYTE_KEY_DOWN = 0x03
const CMD_BYTE_KEY_UP = 0x04
const CMD_BYTE_SET_BRIGHTNESS = 0x05
const CMD_BYTE_SET_RESIDUAL_TIME = 0x06
const CMD_BYTE_SET_DIFFUSION_WIDTH = 0x07
const CMD_BYTE_SET_END_LIGHTS_COLOR = 0x08
const CMD_BYTE_COLOR_PREVIEW = 0x09

function parseColor(colorHex: string): number[] {
  const r = parseInt(colorHex.substring(1, 3), 16)
  const g = parseInt(colorHex.substring(3, 5), 16)
  const b = parseInt(colorHex.substring(5, 7), 16)
  return [r, g, b]
}

export type CmdParser = (arg: any) => number[]

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  waiting: (_: any): number[] => [CMD_BYTE_WAITING],
  setForegroundColor: (colorHex: string): number[] => [
    CMD_BYTE_SET_FOREGROUND_COLOR,
    ...parseColor(colorHex)
  ],
  setBackgroundColor: (colorHex: string): number[] => [
    CMD_BYTE_SET_BACKGROUND_COLOR,
    ...parseColor(colorHex)
  ],
  keyDown: (key: number): number[] => [CMD_BYTE_KEY_DOWN, key],
  keyUp: (key: number): number[] => [CMD_BYTE_KEY_UP, key],
  setBrightness: (brightness: number): number[] => [CMD_BYTE_SET_BRIGHTNESS, brightness],
  setResidualTime: (residualTime: number): number[] => [CMD_BYTE_SET_RESIDUAL_TIME, residualTime],
  setDiffusionWidth: (diffusionWidth: number): number[] => [
    CMD_BYTE_SET_DIFFUSION_WIDTH,
    diffusionWidth
  ],
  setEndLightsColor: (colorHex: string): number[] => [
    CMD_BYTE_SET_END_LIGHTS_COLOR,
    ...parseColor(colorHex)
  ],
  colorPreview: (colorHex: string): number[] => [CMD_BYTE_COLOR_PREVIEW, ...parseColor(colorHex)]
} as Record<string, CmdParser>
