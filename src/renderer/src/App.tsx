import { useState } from 'react'
import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'
import ClickGranule from './components/effects/ClickGranule'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [activeKeys, setActiveKeys] = useState<string[]>(['C7', 'C7#', 'A3'])

  return (
    <>
      <ClickGranule />
      <ConfigMenu />
      <Keyboard activeKeys={activeKeys} />
    </>
  )
}

export default App
