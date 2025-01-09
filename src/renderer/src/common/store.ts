import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import * as configManger from '../config'
import 'redux'
import 'redux-thunk'

export const store = configureStore({
  reducer: {
    // 语言设置，
    lang: configManger.langSlice.reducer,
    // 主背景图设置
    bg: configManger.bgImgSlice.reducer,
    // 启用的串口
    com: configManger.comSlice.reducer,
    // 主题颜色
    theme: configManger.themeSlice.reducer,
    // 残留模式
    residue: configManger.residueSlice.reducer,
    // 扩散模式
    diffusion: configManger.diffusionSlice.reducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>
