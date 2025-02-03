import './index.styl'
import Fireflies from '../effects/Firefiles'

export default function loading(): JSX.Element {
  return (
    <div className="loading">
      <div className="loading__mask"></div>
      <Fireflies />
    </div>
  )
}
