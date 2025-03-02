import './index.styl'
import Fireflies from '../effects/Firefiles'
import { ThemeTypeEnum } from '@renderer/common/colors'

export default function loading(): JSX.Element {
  return (
    <div className="loading">
      <div className="loading__mask"></div>
      <Fireflies theme={ThemeTypeEnum.SKY} />
    </div>
  )
}
