import ConfigMenu from './components/ConfigMenu'
import Keyboard from './components/Keyboard'
import { particleSelector, themeSelector } from '@renderer/config'
import ClickGranule from './components/effects/ClickGranule'
import Filefiles from './components/effects/Firefiles'
import { useAppSelector } from './common/store'
import { useEffect } from 'react'
import { NotificationProvider } from './components/basic/EmNotifacation'

function App(): JSX.Element {
  const theme = useAppSelector(themeSelector)
  const particleConfig = useAppSelector(particleSelector)

  useEffect(() => {
    window.api.onPing(() => {
      console.log('Pong!')
    })
  }, [])

  return (
    <>
      <NotificationProvider>
        {particleConfig.enableFirefiles && <Filefiles theme={theme} />}
        {particleConfig.enableClickGranule && <ClickGranule theme={theme} />}
        <ConfigMenu />
        <Keyboard />
      </NotificationProvider>
    </>
  )
}

export default App
