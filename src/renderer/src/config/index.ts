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

export const comSlice = createSlice({
  name: 'com',
  initialState: {
    com: ''
  },
  reducers: {
    setCom: (state, action) => {
      return {
        ...state,
        com: action.payload
      }
    }
  }
})

export const enableComSlice = createSlice({
  name: 'enableCom',
  initialState: {
    enableCom: false
  },
  reducers: {
    setEnableCom: (state, action) => {
      return {
        ...state,
        enableCom: action.payload
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
    enableClickGranule: true
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
    }
  }
})

export const ledSlice = createSlice({
  name: 'led',
  initialState: {
    bgColor: '#000000',
    fgColor: '#ffffff',
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
export const comSelector = (state: RootState): string => state.com?.com || ''
export const enableComSelector = (state: RootState): boolean => state.enableCom?.enableCom || false
export const themeSelector = (state: RootState): ThemeTypeEnum =>
  state.theme?.theme || ThemeTypeEnum.SKY
export const particleSelector = (
  state: RootState
): { enableFirefiles: boolean; enableClickGranule: boolean } => {
  return (
    state.particle || {
      enableFirefiles: true,
      enableClickGranule: true
    }
  )
}
export const ledSelector = (
  state: RootState
): { bgColor: string; fgColor: string; residue: number; diffusion: number } => {
  return (
    state.led || {
      bgColor: '#000000',
      fgColor: '#ffffff',
      residue: 0,
      diffusion: 0
    }
  )
}
export const menuSelector = (state: RootState): string => state.menu?.menu || 'appearance'
