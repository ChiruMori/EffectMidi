import { useSelector } from 'react-redux'
import { type RootState } from '@renderer/common/store'
import { get } from 'lodash'
import { useEffect, useState } from 'react'

export enum Lang {
  en = 'en',
  zh_cn = 'zh_cn'
}

export type LangData = {
  [key: string]: string
}

const parsedLangMap: { [key: string]: LangData } = {}

/**
 * 加载语言配置文件
 *
 * @param lang 语言代码
 */
const loadLangFile = async (lang: Lang) => {
  if (null === parsedLangMap[lang] || undefined === parsedLangMap[lang]) {
    const langFile = await import(`../lang/${lang}.yaml`)
    parsedLangMap[lang] = langFile.default
  }
}

/**
 * 自定义 Hook 用于获取多语言文本
 */
export default function useGetText() {
  const lang = useSelector((state: RootState) => state.lang)
  const [text, setText] = useState<LangData>({})

  useEffect(() => {
    loadLangFile(lang).then(() => {
      setText(parsedLangMap[lang])
    })
  }, [lang])

  /**
   * 多语言文本获取
   *
   * @param key 文本键，对应yaml文件中的键，多层级用.分隔
   * @returns 返回对应的文本，如果没有找到则返回key本身
   */
  const getText = (key: string): string => {
    return get(text, key, key) || key
  }

  return getText
}

export const selectLang = (state: RootState) => state.lang
