import lang from '@renderer/lang'
import { useAppSelector } from '@renderer/common/store'
import C from '@renderer/common/colors'
import './index.styl'
import { enableComSelector, themeSelector } from '@renderer/config'
import { useNotification } from '@renderer/components/basic/EmNotifacation'

export type MenuOptions = 'appearance' | 'devices' | 'led' | 'about'

export default function MenuSlide({
  menu,
  onChange
}: {
  menu: MenuOptions
  onChange: (menu: MenuOptions) => void
}): JSX.Element {
  const txt = lang()
  const colorType = useAppSelector(themeSelector)
  const enableCom = useAppSelector(enableComSelector)
  const { notify } = useNotification()
  return (
    <div className="menu-side text-center px-4 relative">
      <div className="menu text-2xl relative overflow-hidden">
        <div className="menu-item cursor-pointer" onClick={() => onChange('appearance')}>
          <div
            className={`animate__animated animate__fast ani-txt text-nowrap ${menu === 'appearance' ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
          >
            {txt('menu.appearance')}
          </div>
          <div
            hidden={menu !== 'appearance'}
            className={`ani-bg animate__animated animate__fast absolute ${menu === 'appearance' ? 'animate__lightSpeedInLeft' : ''}`}
            style={{ backgroundImage: C(colorType).ingridient(45) }}
          ></div>
        </div>
        <div className="menu-item cursor-pointer" onClick={() => onChange('devices')}>
          <div
            className={`animate__animated animate__fast ani-txt text-nowrap ${menu === 'devices' ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
          >
            {txt('menu.devices')}
          </div>
          <div
            hidden={menu !== 'devices'}
            className={`ani-bg animate__animated animate__fast absolute ${menu === 'devices' ? 'animate__lightSpeedInLeft' : ''}`}
            style={{ backgroundImage: C(colorType).ingridient(45) }}
          ></div>
        </div>
        <div
          className="menu-item cursor-pointer"
          onClick={() => {
            if (enableCom) {
              onChange('led')
              return
            }
            onChange('devices')
            // 添加 shake 动画
            const menu = document.getElementById('menu-led')
            menu?.classList.add('animate__headShake')
            setTimeout(() => {
              menu?.classList.remove('animate__headShake')
            }, 1000)
            // 提示
            notify({
              title: txt('notify.serial-disable-title'),
              content: txt('notify.serial-disable-content'),
              key: 'led-tip',
              type: 'error'
            })
          }}
        >
          <div
            id="menu-led"
            className={`animate__animated animate__fast ani-txt text-nowrap ${menu === 'led' ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
          >
            {txt('menu.led')}
          </div>
          <div
            hidden={menu !== 'led'}
            className={`ani-bg animate__animated animate__fast absolute ${menu === 'led' ? 'animate__lightSpeedInLeft' : ''}`}
            style={{ backgroundImage: C(colorType).ingridient(45) }}
          ></div>
        </div>
        <hr className="menu-hr my-4 border-gray-600 border-dashed max-w-48" />
        <div className="menu-item cursor-pointer" onClick={() => onChange('about')}>
          <div
            className={`animate__animated animate__fast ani-txt text-nowrap ${menu === 'about' ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
          >
            {txt('menu.about')}
          </div>
          <div
            hidden={menu !== 'about'}
            className={`ani-bg animate__animated animate__fast absolute ${menu === 'about' ? 'animate__lightSpeedInLeft' : ''}`}
            style={{ backgroundImage: C(colorType).ingridient(45) }}
          ></div>
        </div>
      </div>
    </div>
  )
}
