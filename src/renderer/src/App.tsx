import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <ConfigMenu />
      <Keyboard />
    </>
  )
}

export default App
