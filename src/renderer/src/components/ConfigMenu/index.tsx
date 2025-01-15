import { useState } from 'react'
import MenuSlide, { type MenuOptions } from '../MenuSlide'
import './index.styl'
import MenuContent from '../MenuContent'

function ConfigMenu(): JSX.Element {
  const [menu, setMenu] = useState<MenuOptions>('appearance')

  return (
    <>
      <div className="overflow-y-hidden py-24 size-full absolute">
        <div className="h-full main-panel mx-auto px-4 grid grid-rows-1 grid-cols-12 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-2">
            <MenuSlide menu={menu} onChange={setMenu} />
          </div>
          <div className="col-span-8 overflow-y-scroll overflow-x-hidden rounded-md bg-neutral-800 content-page">
            <MenuContent menu={menu} />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
