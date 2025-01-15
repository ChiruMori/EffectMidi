import lang from '@renderer/lang'
import './index.styl'

export type MenuOptions = 'appearance' | 'devices' | 'led' | 'about'

export default function MenuSlide({
  menu,
  onChange
}: {
  menu: MenuOptions
  onChange: (menu: MenuOptions) => void
}): JSX.Element {
  const txt = lang()
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
            className={`ani-bg animate__animated animate__fast bg-violet-900 absolute ${menu === 'appearance' ? 'animate__lightSpeedInLeft' : ''}`}
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
            className={`ani-bg animate__animated animate__fast bg-violet-900 absolute ${menu === 'devices' ? 'animate__lightSpeedInLeft' : ''}`}
          ></div>
        </div>
        <div className="menu-item cursor-pointer" onClick={() => onChange('led')}>
          <div
            className={`animate__animated animate__fast ani-txt text-nowrap ${menu === 'led' ? 'animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
          >
            {txt('menu.led')}
          </div>
          <div
            hidden={menu !== 'led'}
            className={`ani-bg animate__animated animate__fast bg-violet-900 absolute ${menu === 'led' ? 'animate__lightSpeedInLeft' : ''}`}
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
            className={`ani-bg animate__animated animate__fast bg-violet-900 absolute ${menu === 'about' ? 'animate__lightSpeedInLeft' : ''}`}
          ></div>
        </div>
      </div>
    </div>
  )
}
