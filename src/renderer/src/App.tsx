import { useState } from 'react'
import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [activeKeys, setActiveKeys] = useState<string[]>(['C7', 'C7#', 'A3'])

  return (
    <>
    鼠标点击效果没做
      <ConfigMenu />
      <Keyboard activeKeys={activeKeys} />
    </>
  )
}

export default App
