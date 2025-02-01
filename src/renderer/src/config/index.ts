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

export const residueSlice = createSlice({
  name: 'residue',
  initialState: {
    enableResidue: true,
    residueTime: 500
  },
  reducers: {
    setTime: (state, action) => {
      return {
        ...state,
        residueTime: action.payload
      }
    },
    setEnableResidue: (state, action) => {
      return {
        ...state,
        enableResidue: action.payload
      }
    }
  }
})

export const diffusionSlice = createSlice({
  name: 'diffusion',
  initialState: {
    enableDiffusion: false,
    diffusionWidth: 2
  },
  reducers: {
    setWidth: (state, action) => {
      return {
        ...state,
        diffusionWidth: action.payload
      }
    },
    setDiffusion: (state, action) => {
      state.enableDiffusion = action.payload
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
export const themeSelector = (state: RootState): ThemeTypeEnum =>
  state.theme?.theme || ThemeTypeEnum.SKY
export const residueSelector = (
  state: RootState
): { enableResidue: boolean; residueTime: number } => {
  return (
    state.residue || {
      enableResidue: true,
      residueTime: 500
    }
  )
}
export const diffusionSelector = (
  state: RootState
): {
  enableDiffusion: boolean
  diffusionWidth: number
} => {
  return (
    state.diffusion || {
      enableDiffusion: false,
      diffusionWidth: 2
    }
  )
}
