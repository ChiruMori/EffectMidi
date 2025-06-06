import { Score } from '@renderer/common/score'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import C from '@renderer/common/colors'
import { particleSelector, statisticsSlice, themeSelector } from '@renderer/config'
import { useEffect, useState, useCallback, useRef } from 'react'
import ipcClient from '@renderer/common/ipcClient'
import midi from './midi'
import Waterfall, { WaterfallRef } from './Waterfall'
import './index.styl'
import GlowEffect from '../effects/Glow'

const whiteKeyCnt = 52
const startScore = 'A1'

export default function Keyboard(): JSX.Element {
  const keyboards = [] as Score[][]
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const colorType = useAppSelector(themeSelector)
  const waterfallRef = useRef<WaterfallRef>(null)
  const particle = useAppSelector(particleSelector)
  const dispatch = useAppDispatch()

  // 初始化键盘
  let nextScore = Score.fromString(startScore)
  while (keyboards.length < whiteKeyCnt) {
    if (nextScore.sharp !== null) {
      keyboards[keyboards.length - 1].push(nextScore)
    } else {
      keyboards.push([nextScore])
    }
    nextScore = nextScore.nextHalfTone()
  }

  // 每秒最多更新一次统计信息
  let statisticsTimer: NodeJS.Timeout | null = null
  let padelIncr = 0
  let keyIncr = 0
  let updatePadel = false

  const updateStatistics = (padel = false): void => {
    if (padel) {
      padelIncr += 1
    } else {
      keyIncr += 1
    }
    if (statisticsTimer === null) {
      statisticsTimer = setTimeout(() => {
        if (updatePadel && padelIncr > 0) {
          dispatch(statisticsSlice.actions.incrPaddle(padelIncr))
          padelIncr = 0
          updatePadel = false
          statisticsTimer = null
          return
        }
        if (keyIncr > 0) {
          dispatch(statisticsSlice.actions.incrScore(keyIncr))
          keyIncr = 0
          updatePadel = true
          statisticsTimer = null
        }
      }, 1000)
    }
  }

  // 处理键盘事件，使用useCallback稳定事件处理器
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
    const [beginPerct, endPerct] = targetScore.getPerct(1 / whiteKeyCnt, (1 / whiteKeyCnt) * 0.6)
    waterfallRef.current?.rectBegin(key, beginPerct, endPerct)
    updateStatistics()
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
    waterfallRef.current?.rectEnd(key)
  }, [])

  useEffect(() => {
    window.api.onKeyDown(handleKeyDown)
    window.api.onKeyUp(handleKeyUp)
    midi.setMidiEventHandlers({
      keyDown: handleKeyDown,
      keyUp: handleKeyUp,
      paddleToggle: (down) => {
        if (down) {
          updateStatistics(true)
        }
        waterfallRef.current?.setPadel(down)
      }
    })
    return (): void => {
      window.api.offEvent('midi-keydown')
      window.api.offEvent('midi-keyup')
      midi.disconnectDevice()
      if (statisticsTimer) {
        clearTimeout(statisticsTimer)
      }
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <>
      {particle.enableWaterfall && (
        <>
          <Waterfall ref={waterfallRef} theme={colorType} />
          <GlowEffect theme={colorType} height={30} />
        </>
      )}
      <div className="absolute w-full h-1/6 bg-white bottom-0 z-40">
        <div className="flex flex-nowrap size-full kb-container">
          {keyboards.map((scoreTuple, idx) => (
            <div
              className={`kb kb-w ${activeKeys.has(scoreTuple[0].toString()) ? '' : 'bg-white'}`}
              style={
                activeKeys.has(scoreTuple[0].toString())
                  ? { backgroundImage: C(colorType).ingredient(0) }
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
                      ? { backgroundImage: C(colorType).ingredient(0) }
                      : {}
                  }
                  id={scoreTuple[1].toString()}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
