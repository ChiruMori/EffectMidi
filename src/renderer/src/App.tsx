import { useState } from 'react'
import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'
import { particleSelector, themeSelector } from '@renderer/config'
import ClickGranule from './components/effects/ClickGranule'
import Filefiles from './components/effects/Firefiles'
import { useAppSelector } from './common/store'

function App(): JSX.Element {
  const [activeKeys] = useState<string[]>(['C7', 'C7#', 'A3'])
  const theme = useAppSelector(themeSelector)
  const particleConfig = useAppSelector(particleSelector)

  return (
    <>
      {particleConfig.enableFirefiles && <Filefiles theme={theme} />}
      {particleConfig.enableClickGranule && <ClickGranule theme={theme} />}
      <ConfigMenu />
      <Keyboard activeKeys={activeKeys} />
    </>
  )
}

export default App
