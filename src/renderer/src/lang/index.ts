import { useAppSelector } from '@renderer/common/store'
import { get } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { langSelector } from '@renderer/config'

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
const loadLangFile = async (lang: Lang): Promise<void> => {
  if (null === parsedLangMap[lang] || undefined === parsedLangMap[lang]) {
    const langFile = await import(`../lang/${lang}.yaml`)
    parsedLangMap[lang] = langFile.default
  }
}

/**
 * 自定义 Hook 用于获取多语言文本
 */
export default function useGetText(): (key: string) => string {
  const lang = useAppSelector(langSelector)
  const [text, setText] = useState<LangData>({})
  // 引用容器，使回调函数中的 text 保持最新
  const textRef = useRef(text)

  useEffect(() => {
    loadLangFile(lang).then(() => {
      const newText = parsedLangMap[lang]
      setText(newText)
      textRef.current = newText // 同步到引用
    })
  }, [lang])

  const getText = useCallback((key: string): string => {
    // 始终读取最新值
    return get(textRef.current, key, key)
  }, [])

  return getText
}
