import { Score } from '@renderer/common/score'
import { useAppSelector } from '@renderer/common/store'
import C from '@renderer/common/colors'
import { themeSelector } from '@renderer/config'
import { useEffect, useState } from 'react'
import './index.styl'

const whiteKeyCnt = 52
const startScore = 'A1'

export default function Keyboard(): JSX.Element {
  const keyboards = [] as Score[][]
  const [activeKeys, setActiveKeys] = useState<string[]>([])
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
  useEffect(() => {
    window.api.onKeyDown((index) => {
      const targetScore = Score.fromMidi(index)
      setActiveKeys([...activeKeys, targetScore.toString()])
      console.debug('keydown', targetScore.toString())
    })
    window.api.onKeyUp((index) => {
      const targetScore = Score.fromMidi(index)
      setActiveKeys(activeKeys.filter((key) => key !== targetScore.toString()))
      console.debug('keyup', targetScore.toString())
    })
  }, [activeKeys])

  return (
    <div className="absolute w-full h-1/6 bg-white bottom-0 z-40">
      <div className="flex flex-nowrap size-full kb-container">
        {keyboards.map((scoreTuple, idx) => (
          <div
            className={`kb kb-w ${activeKeys.includes(scoreTuple[0].toString()) ? '' : 'bg-white'}`}
            style={
              activeKeys.includes(scoreTuple[0].toString())
                ? { backgroundImage: C(colorType).ingridient(0) }
                : {}
            }
            key={idx}
            id={scoreTuple[0].toString()}
          >
            {scoreTuple.length === 2 && (
              <div
                className={`kb kb-b ${activeKeys.includes(scoreTuple[1].toString()) ? '' : 'bg-black'}`}
                style={
                  activeKeys.includes(scoreTuple[1].toString())
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
