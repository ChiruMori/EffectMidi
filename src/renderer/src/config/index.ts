import { createSlice } from '@reduxjs/toolkit'
import { Lang } from '../lang'
import 'immer'

export const langSlice = createSlice({
  name: 'lang',
  initialState: Lang.zh_cn,
  reducers: {
    setLang: (state, action) => {
      state = action.payload
    }
  }
})

export const bgImgSlice = createSlice({
  name: 'bgImg',
  initialState: {
    img: '',
    maskColor: '#000000',
    maskOpacity: 0.2
  },
  reducers: {
    setBgImg: (state, action) => {
      state.img = action.payload
    },
    setMaskColor: (state, action) => {
      state.maskColor = action.payload
    },
    setMaskOpacity: (state, action) => {
      state.maskOpacity = action.payload
    }
  }
})

export const comSlice = createSlice({
  name: 'com',
  initialState: '',
  reducers: {
    setCom: (state, action) => {
      state = action.payload
    }
  }
})

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    main: '#1976D2',
    sub: '#424242',
    enableRainbow: false
  },
  reducers: {
    setMain: (state, action) => {
      state.main = action.payload
    },
    setSub: (state, action) => {
      state.sub = action.payload
    },
    toggleRainbow: (state) => {
      state.enableRainbow = !state.enableRainbow
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
