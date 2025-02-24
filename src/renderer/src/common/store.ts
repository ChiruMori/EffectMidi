/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import * as configManger from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import { thunk } from 'redux-thunk'
import ipc from './ipcClient'
import 'redux'

// 用于 redux-persist 的自定义存储

// 配置 redux-persist
const storePersistConfigOf = (
  key: string
): {
  key: string
  storage: {
    getItem: (key: string) => Promise<any>
    setItem: (key: string, value: any) => Promise<void>
    removeItem: (key: string) => Promise<void>
  }
} => ({
  key: key,
  storage: {
    getItem: async (key: string): Promise<any> => {
      return await ipc.storage.get(key)
    },
    setItem: async (key: string, value: any): Promise<void> => {
      return await ipc.storage.set(key, value)
    },
    removeItem: async (key: string): Promise<void> => {
      return await ipc.storage.remove(key)
    }
  }
})

// 不进行持久化存储的配置
const storeSessionConfigOf = (
  key: string
): {
  key: string
  storage: {
    getItem: (key: string) => Promise<any>
    setItem: (key: string, value: any) => Promise<void>
    removeItem: (key: string) => Promise<void>
  }
} => ({
  key: key,
  storage: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem: async (_: string): Promise<any> => {
      return Promise.resolve(null)
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setItem: async (_k: string, _v: any): Promise<void> => {
      return Promise.resolve()
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItem: async (_: string): Promise<void> => {
      return Promise.resolve()
    }
  }
})

export const store = configureStore({
  reducer: {
    // 语言设置，
    lang: persistReducer(storePersistConfigOf('lang'), configManger.langSlice.reducer),
    // 主背景图设置
    bg: persistReducer(storePersistConfigOf('bg'), configManger.bgImgSlice.reducer),
    // 启用的串口
    com: persistReducer(storePersistConfigOf('com'), configManger.comSlice.reducer),
    // 是否已激活串口设备（该配置不能持久化存储，每次启动程序都默认设置为否）
    enableCom: persistReducer(
      storeSessionConfigOf('enableCom'),
      configManger.enableComSlice.reducer
    ),
    // 主题颜色
    theme: persistReducer(storePersistConfigOf('theme'), configManger.themeSlice.reducer),
    // 粒子效果
    particle: persistReducer(storePersistConfigOf('particle'), configManger.particleSlice.reducer),
    // led 配置
    led: persistReducer(storePersistConfigOf('led'), configManger.ledSlice.reducer),
    // Menu 配置（非持久化）
    menu: persistReducer(storeSessionConfigOf('menu'), configManger.menuSlice.reducer),
    // Midi 配置
    midi: persistReducer(storePersistConfigOf('midi'), configManger.midiSlice.reducer)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(thunk)
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
