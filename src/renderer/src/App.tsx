import ConfigMenu from './components/ConfigMenu'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <ConfigMenu />
      
    </>
  )
}

export default App
