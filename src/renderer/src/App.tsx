import { useState } from 'react'
import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'
import ClickGranule from './components/effects/ClickGranule'
import Loading from './components/Loading'

function App(): JSX.Element {
  const [activeKeys, setActiveKeys] = useState<string[]>(['C7', 'C7#', 'A3'])

  return (
    <>
      <Loading />
      <ClickGranule />
      <ConfigMenu />
      <Keyboard activeKeys={activeKeys} />
    </>
  )
}

export default App
