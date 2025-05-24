import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import { enableEmbeddedSelector, menuSelector, menuSlice, themeSelector } from '@renderer/config'
import { useNotification } from '@renderer/components/basic/EmNotifacation'
import { useState } from 'react'
import C from '@renderer/common/colors'
import lang from '@renderer/lang'

export type MenuOptions = 'appearance' | 'devices' | 'led' | 'about'

export default function MenuItem({
  menuKey,
  children,
  disabled = false
}: {
  menuKey: MenuOptions
  children: React.ReactNode
  disabled?: boolean
}): JSX.Element {
  const activeMenu = useAppSelector(menuSelector)
  const dispatch = useAppDispatch()
  const isActive = activeMenu === menuKey
  const colorType = useAppSelector(themeSelector)
  const enableCom = useAppSelector(enableEmbeddedSelector)
  const { notify } = useNotification()
  const txt = lang()

  const [animating, setAnimating] = useState(false)

  return (
    <>
      <div
        className="menu-item cursor-pointer"
        onClick={() => {
          if (disabled) {
            return
          }
          if (menuKey !== 'led' || enableCom) {
            dispatch(menuSlice.actions.setMenu(menuKey))
            return
          }
          dispatch(menuSlice.actions.setMenu('devices'))
          // 添加 shake 动画
          setAnimating(true)
          setTimeout(() => setAnimating(false), 1000)
          // 提示
          notify({
            title: txt('notify.embedded-disable-title'),
            content: txt('notify.embedded-disable-content'),
            key: 'led-tip',
            type: 'error'
          })
        }}
      >
        <div
          className={`animate__animated animate__fast ani-txt text-nowrap ${isActive ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'} ${animating ? 'animate__headShake' : ''}`}
        >
          {children}
        </div>
        <div
          hidden={!isActive}
          className={`ani-bg animate__animated animate__fast absolute ${isActive ? 'animate__lightSpeedInLeft' : ''}`}
          style={{ backgroundImage: C(colorType).ingredient(45) }}
        ></div>
      </div>
    </>
  )
}
