import { createSlice } from '@reduxjs/toolkit'
import { Lang } from '../lang'
import 'immer'
import { ThemeTypeEnum } from '@renderer/common/colors'
import { RootState } from '@renderer/common/store'

export const langSlice = createSlice({
  name: 'lang',
  initialState: {
    lang: Lang.zh_cn
  },
  reducers: {
    setLang: (state, action) => {
      return {
        ...state,
        lang: action.payload
      }
    }
  }
})

export const bgImgSlice = createSlice({
  name: 'bgImg',
  initialState: {
    bgImg: '',
    bgDataUrl: '',
    bgMaskOpacity: 80
  },
  reducers: {
    setBgImg: (state, action) => {
      return {
        ...state,
        bgImg: action.payload.path,
        bgDataUrl: action.payload.dataUrl
      }
    },
    setMaskOpacity: (state, action) => {
      return {
        ...state,
        bgMaskOpacity: action.payload
      }
    }
  }
})

export const embeddedSlice = createSlice({
  name: 'embedded',
  initialState: {
    embedded: ''
  },
  reducers: {
    setEmbedded: (state, action) => {
      return {
        ...state,
        embedded: action.payload
      }
    }
  }
})

export const enableEmbeddedSlice = createSlice({
  name: 'enableEmbedded',
  initialState: {
    enableEmbedded: false
  },
  reducers: {
    setEnableEmbedded: (state, action) => {
      return {
        ...state,
        enableEmbedded: action.payload
      }
    }
  }
})

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: ThemeTypeEnum.SKY
  },
  reducers: {
    setType: (state, action) => {
      return {
        ...state,
        theme: action.payload
      }
    }
  }
})

export const particleSlice = createSlice({
  name: 'particle',
  initialState: {
    enableFirefiles: true,
    enableClickGranule: true,
    enableWaterfall: true,
    waterfallSpeed: 20
  },
  reducers: {
    setFirefiles: (state, action) => {
      return {
        ...state,
        enableFirefiles: action.payload
      }
    },
    setClickGranule: (state, action) => {
      return {
        ...state,
        enableClickGranule: action.payload
      }
    },
    setWaterfall: (state, action) => {
      return {
        ...state,
        enableWaterfall: action.payload
      }
    },
    setWaterfallSpeed: (state, action) => {
      return {
        ...state,
        waterfallSpeed: action.payload
      }
    }
  }
})

export const ledSlice = createSlice({
  name: 'led',
  initialState: {
    bgColor: '#000000',
    fgColor: '#ffffff',
    endColor: '#000000',
    residue: 0,
    diffusion: 0
  },
  reducers: {
    setBgColor: (state, action) => {
      return {
        ...state,
        bgColor: action.payload
      }
    },
    setFgColor: (state, action) => {
      return {
        ...state,
        fgColor: action.payload
      }
    },
    setEndColor: (state, action) => {
      return {
        ...state,
        endColor: action.payload
      }
    },
    setResidue: (state, action) => {
      return {
        ...state,
        residue: action.payload
      }
    },
    setDiffusion: (state, action) => {
      return {
        ...state,
        diffusion: action.payload
      }
    }
  }
})

export const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    menu: 'appearance'
  },
  reducers: {
    setMenu: (state, action) => {
      return {
        ...state,
        menu: action.payload
      }
    }
  }
})

export const midiSlice = createSlice({
  name: 'midi',
  initialState: {
    midi: ''
  },
  reducers: {
    setMidi: (state, action) => {
      return {
        ...state,
        midi: action.payload
      }
    }
  }
})

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState: {
    statistics: {
      score: 0,
      paddle: 0
    }
  },
  reducers: {
    setStatistics: (state, action) => {
      return {
        ...state,
        statistics: action.payload
      }
    },
    incrScore: (state, action) => {
      return {
        ...state,
        statistics: {
          ...state.statistics,
          score: state.statistics.score + (action.payload ?? 1)
        }
      }
    },
    incrPaddle: (state, action) => {
      return {
        ...state,
        statistics: {
          ...state.statistics,
          paddle: state.statistics.paddle + (action.payload ?? 1)
        }
      }
    }
  }
})

export const langSelector = (state: RootState): Lang => state.lang?.lang || Lang.zh_cn
export const bgImgSelector = (
  state: RootState
): { bgImg: string; bgDataUrl: string; bgMaskOpacity: number } => {
  return (
    state.bg || {
      bgImg: '',
      bgDataUrl: '',
      bgMaskOpacity: 80
    }
  )
}
export const embeddedSelector = (state: RootState): string => state.embedded?.embedded || ''
export const enableEmbeddedSelector = (state: RootState): boolean =>
  state.enableEmbedded?.enableEmbedded || false
export const themeSelector = (state: RootState): ThemeTypeEnum =>
  state.theme?.theme || ThemeTypeEnum.SKY
export const particleSelector = (
  state: RootState
): {
  enableFirefiles: boolean
  enableClickGranule: boolean
  enableWaterfall: boolean
  waterfallSpeed: number
} => {
  return (
    state.particle || {
      enableFirefiles: true,
      enableClickGranule: true,
      enableWaterfall: true,
      waterfallSpeed: 20
    }
  )
}
export const ledSelector = (
  state: RootState
): { bgColor: string; fgColor: string; endColor: string; residue: number; diffusion: number } => {
  return (
    state.led || {
      bgColor: '#000000',
      fgColor: '#ffffff',
      endColor: '#000000',
      residue: 0,
      diffusion: 0
    }
  )
}
export const menuSelector = (state: RootState): string => state.menu?.menu || 'appearance'
export const midiSelector = (state: RootState): string => state.midi?.midi || ''
export const statisticsSelector = (state: RootState): { score: number; paddle: number } => {
  return (
    state.statistics?.statistics || {
      score: 0,
      paddle: 0
    }
  )
}
