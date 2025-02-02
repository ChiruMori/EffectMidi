import './index.styl'
import StarRiver from '../effects/StarRiver'

export default function loading(): JSX.Element {
  return (
    <div className="loading">
      <div className="loading__mask"></div>
      <StarRiver />
    </div>
  )
}
