import lang from '@renderer/lang'
import { useState } from 'react'

function ConfigMenu(): JSX.Element {
  const txt = lang()
  const [activeMenu, setActiveMenu] = useState(0)

  return (
    <>
      <div className="over-hidden absolute top-24 size-full">
        <div className="main-panel mx-auto px-4 flex flex-col">
          <div className="flex flex-row relative">
            <div className="basis-1/12"></div>
            <div className="menu-side basis-1/6 text-center px-4">
              <div className="menu text-2xl fixed">
                <div
                  className={`animate__animated animate__fast px-5 cursor-pointer duration-500 menu-item p-2 rounded-md ${activeMenu === 0 ? 'bg-violet-900 animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
                  onClick={() => setActiveMenu(0)}
                >
                  {txt('menu.appearance')}
                </div>
                <div
                  className={`animate__animated animate__fast px-5 cursor-pointer duration-500 menu-item p-2 rounded-md ${activeMenu === 1 ? 'bg-violet-900 animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
                  onClick={() => setActiveMenu(1)}
                >
                  {txt('menu.devices')}
                </div>
                <div
                  className={`animate__animated animate__fast px-5 cursor-pointer duration-500 menu-item p-2 rounded-md ${activeMenu === 2 ? 'bg-violet-900 animate__bounceIn font-bold' : 'hover:bg-sky-500/[.06]'}`}
                  onClick={() => setActiveMenu(2)}
                >
                  {txt('menu.led')}
                </div>
              </div>
            </div>
            <div className="basis-2/3">
              <div className="content-page overflow-y-scroll">
                <h1>{txt('apperance.language')}</h1>
                <div className="config-item">
                  <label>{txt('apperance.language')}</label>
                  <select>
                    <option value="zh-cn">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
                <div>a</div>
              </div>
            </div>
            <div className="basis-1/12"></div>
          </div>
          <div className="flex-row"></div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
