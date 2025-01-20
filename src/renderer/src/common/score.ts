const HALF_TONE_TABLE = {
  0: ['C'],
  1: ['C#', 'Db'],
  2: ['D'],
  3: ['D#', 'Eb'],
  4: ['E'],
  5: ['F'],
  6: ['F#', 'Gb'],
  7: ['G'],
  8: ['G#', 'Ab'],
  9: ['A'],
  10: ['A#', 'Bb'],
  11: ['B']
}

export class Score {
  // 音符
  letter: string
  // 八度
  octave: number
  // 升降号
  sharp: '#' | 'b' | null = null

  constructor(letter: string, octave: number, sharp: '#' | 'b' | null = null) {
    this.letter = letter
    this.octave = octave
    this.sharp = sharp
  }

  /**
   * 从字符串构造音符
   */
  static fromString(scoreStr: string): Score {
    // CDEFGAB
    const letter = scoreStr[0]
    // 八度
    const octave = parseInt(scoreStr[1])
    // #、b
    let sharp: '#' | 'b' | null = null
    if (scoreStr.length === 3) {
      sharp = scoreStr[2] as '#' | 'b'
    }
    return new Score(letter, octave, sharp)
  }

  /**
   * 下一个半音
   */
  nextHalfTone(): Score {
    const halfTone = this.letter + (this.sharp == null ? '' : this.sharp)
    let halfToneIndex = -1
    for (let i = 0; i < 12; i++) {
      if (HALF_TONE_TABLE[i].includes(halfTone)) {
        halfToneIndex = i
        break
      }
    }
    halfToneIndex = (halfToneIndex + 1) % 12
    const nextHalfTone = HALF_TONE_TABLE[halfToneIndex]
    return new Score(
      nextHalfTone[0].charAt(0),
      this.octave + (halfToneIndex === 0 ? 1 : 0),
      nextHalfTone[0].charAt(1) === '#' ? '#' : null
    )
  }

  toString(): string {
    return this.letter + this.octave + (this.sharp == null ? '' : this.sharp)
  }
}
