import { Score } from '@renderer/common/score'
import { useAppSelector } from '@renderer/common/store'
import C from '@renderer/common/colors'
import { themeSelector } from '@renderer/config'
import { useEffect, useState, useCallback } from 'react'
import midi from './midi'
import './index.styl'
import ipcClient from '@renderer/common/ipcClient'

const whiteKeyCnt = 52
const startScore = 'A1'

export default function Keyboard(): JSX.Element {
  const keyboards = [] as Score[][]
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  let nextScore = Score.fromString(startScore)
  while (keyboards.length < whiteKeyCnt) {
    if (nextScore.sharp !== null) {
      keyboards[keyboards.length - 1].push(nextScore)
    } else {
      keyboards.push([nextScore])
    }
    nextScore = nextScore.nextHalfTone()
  }
  const colorType = useAppSelector(themeSelector)

  // 使用useCallback稳定事件处理器
  const handleKeyDown = useCallback((index: number): void => {
    const targetScore = Score.fromMidi(index)
    const key = targetScore.toString()
    setActiveKeys((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      ipcClient.keyDown(index)
      return next
    })
  }, [])

  const handleKeyUp = useCallback((index: number): void => {
    const targetScore = Score.fromMidi(index)
    const key = targetScore.toString()
    setActiveKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      ipcClient.keyUp(index)
      return next
    })
  }, [])

  useEffect(() => {
    window.api.onKeyDown(handleKeyDown)
    window.api.onKeyUp(handleKeyUp)
    midi.setMidiEventHandlers({ keyDown: handleKeyDown, keyUp: handleKeyUp })
    return (): void => {
      window.api.offEvent('midi-keydown')
      window.api.offEvent('midi-keyup')
      midi.disconnectDevice()
    }
  }, [handleKeyDown, handleKeyUp]) // 依赖稳定的回调函数

  return (
    <div className="absolute w-full h-1/6 bg-white bottom-0 z-40">
      <div className="flex flex-nowrap size-full kb-container">
        {keyboards.map((scoreTuple, idx) => (
          <div
            className={`kb kb-w ${activeKeys.has(scoreTuple[0].toString()) ? '' : 'bg-white'}`}
            style={
              activeKeys.has(scoreTuple[0].toString())
                ? { backgroundImage: C(colorType).ingridient(0) }
                : {}
            }
            key={idx}
            id={scoreTuple[0].toString()}
          >
            {scoreTuple.length === 2 && (
              <div
                className={`kb kb-b ${activeKeys.has(scoreTuple[1].toString()) ? '' : 'bg-black'}`}
                style={
                  activeKeys.has(scoreTuple[1].toString())
                    ? { backgroundImage: C(colorType).ingridient(0) }
                    : {}
                }
                id={scoreTuple[1].toString()}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
