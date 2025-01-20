import { Score } from '@renderer/common/score'
import './index.styl'

const whiteKeyCnt = 52
const startScore = 'A1'

export default function Keyboard({ activeKeys }: { activeKeys: string[] }): JSX.Element {
  const keyboards = [] as Score[][]
  let nextScore = Score.fromString(startScore)
  while (keyboards.length < whiteKeyCnt) {
    if (nextScore.sharp !== null) {
      keyboards[keyboards.length - 1].push(nextScore)
    } else {
      keyboards.push([nextScore])
    }
    nextScore = nextScore.nextHalfTone()
  }

  return (
    <div className="absolute w-full h-1/6 bg-white bottom-0">
      <div className="flex flex-nowrap size-full kb-container">
        {keyboards.map((scoreTuple, idx) => (
          <div
            className={`kb kb-w ${activeKeys.includes(scoreTuple[0].toString()) ? 'bg-red-700' : 'bg-white'}`}
            key={idx}
            id={scoreTuple[0].toString()}
          >
            {scoreTuple.length === 2 && (
              <div
                className={`kb kb-b ${activeKeys.includes(scoreTuple[1].toString()) ? 'bg-red-700' : 'bg-black'}`}
                id={scoreTuple[1].toString()}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
