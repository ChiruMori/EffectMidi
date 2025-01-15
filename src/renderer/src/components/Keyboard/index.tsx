import { Score } from '@renderer/common/score'
import './index.styl'

const whiteKeyCnt = 52
const startScore = 'A1'

export default function Keyboard(): JSX.Element {
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
          <div className="kb kb-w" key={idx}>
            {/* <span>{scoreTuple[0].toString()}</span> */}
            {scoreTuple.length === 2 && (
              <div
                className="kb kb-b"
                style={{ left: `${((idx + 0.5) * 100) / whiteKeyCnt + 100}%` }}
              >
                {/* <span>{scoreTuple[1].toString()}</span> */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
