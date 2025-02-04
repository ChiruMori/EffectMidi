export enum ThemeTypeEnum {
  SKY = 'SKY',
  GREEN = 'GREEN',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  PURPLE = 'PURPLE',
  GRAY = 'GRAY'
}

const COLOR_DICT = {
  [ThemeTypeEnum.SKY]: {
    main: '#3B5CF0',
    sub: '#00BCD4'
  },
  [ThemeTypeEnum.GREEN]: {
    main: '#006400',
    sub: '#7FFF00'
  },
  [ThemeTypeEnum.PINK]: {
    main: '#E60000',
    sub: '#ff9f7d'
  },
  [ThemeTypeEnum.ORANGE]: {
    main: '#FF4500',
    sub: '#FFDEAD'
  },
  [ThemeTypeEnum.PURPLE]: {
    main: '#4B0082',
    sub: '#7B68EE'
  },
  [ThemeTypeEnum.GRAY]: {
    main: '#303030',
    sub: '#C0C0C0'
  }
}

export const getMidColor = (progress: number, fromColor: string, toColor: string): string => {
  const r =
    parseInt(fromColor.slice(1, 3), 16) +
    (parseInt(toColor.slice(1, 3), 16) - parseInt(fromColor.slice(1, 3), 16)) * progress
  const g =
    parseInt(fromColor.slice(3, 5), 16) +
    (parseInt(toColor.slice(3, 5), 16) - parseInt(fromColor.slice(3, 5), 16)) * progress
  const b =
    parseInt(fromColor.slice(5, 7), 16) +
    (parseInt(toColor.slice(5, 7), 16) - parseInt(fromColor.slice(5, 7), 16)) * progress
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

export type ColorFuncType = {
  main: string
  sub: string
  ingridient: (deg: number) => string
}

export function hexStringToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  if (max === min) {
    return 0
  } else if (max === r) {
    h = (60 * (g - b)) / (max - min)
  } else if (max === g) {
    h = (60 * (b - r)) / (max - min) + 120
  } else {
    h = (60 * (r - g)) / (max - min) + 240
  }
  return h < 0 ? h + 360 : h
}

export default function colorOf(type: ThemeTypeEnum): ColorFuncType {
  return {
    main: COLOR_DICT[type].main,
    sub: COLOR_DICT[type].sub,
    ingridient(deg: number): string {
      return `linear-gradient(${deg}deg, ${COLOR_DICT[type].main}, ${COLOR_DICT[type].sub})`
    }
  }
}
