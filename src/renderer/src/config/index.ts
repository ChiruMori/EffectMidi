import { createSlice } from '@reduxjs/toolkit'
import { Lang } from '../lang'
import 'immer'
import { ThemeTypeEnum } from '@renderer/common/colors'

export const langSlice = createSlice({
  name: 'lang',
  initialState: Lang.zh_cn,
  reducers: {
    setLang: (_, action) => action.payload
  }
})

export const bgImgSlice = createSlice({
  name: 'bgImg',
  initialState: {
    img: '',
    dataUrl: '',
    maskOpacity: 80
  },
  reducers: {
    setBgImg: (state, action) => {
      return {
        ...state,
        img: action.payload.path,
        dataUrl: action.payload.dataUrl
      }
    },
    setMaskOpacity: (state, action) => {
      return {
        ...state,
        maskOpacity: action.payload
      }
    }
  }
})

export const comSlice = createSlice({
  name: 'com',
  initialState: '',
  reducers: {
    setCom: (_, action) => action.payload
  }
})

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    type: ThemeTypeEnum.SKY
  },
  reducers: {
    setType: (state, action) => {
      return {
        ...state,
        type: action.payload
      }
    }
  }
})

export const residueSlice = createSlice({
  name: 'residue',
  initialState: {
    enable: true,
    time: 500
  },
  reducers: {
    setTime: (state, action) => {
      state.time = action.payload
    },
    toggleResidue: (state) => {
      state.enable = !state.enable
    }
  }
})

export const diffusionSlice = createSlice({
  name: 'diffusion',
  initialState: {
    enable: false,
    width: 2
  },
  reducers: {
    setWidth: (state, action) => {
      state.width = action.payload
    },
    toggleDiffusion: (state) => {
      state.enable = !state.enable
    }
  }
})
