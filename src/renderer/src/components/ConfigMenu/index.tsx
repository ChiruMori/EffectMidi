import MenuSide from './MenuSide'
import Appearance from './Appearance'
import { useAppSelector } from '@renderer/common/store'
import { Devices } from './Devices'
import { bgImgSelector, menuSelector } from '@renderer/config'
import Lights from './Lights'
import './index.styl'
import About from './About'
import { useState } from 'react'
import { ChevronDoubleRightIcon } from '@heroicons/react/20/solid'

function ConfigMenu(): JSX.Element {
  const nowBgImg = useAppSelector(bgImgSelector)
  const menu = useAppSelector(menuSelector)
  const [fold, setFold] = useState(false)

  return (
    <>
      <div
        className="absolute w-full h-full bg-cover bg-center -z-10"
        style={
          nowBgImg.bgImg === ''
            ? {}
            : {
                backgroundImage: 'url(' + (nowBgImg.bgDataUrl || nowBgImg.bgImg) + ')'
              }
        }
      >
        {nowBgImg.bgImg === '' ? (
          ''
        ) : (
          <div
            className="absolute w-full h-full bg-black z-10"
            style={{ opacity: nowBgImg.bgMaskOpacity / 100 }}
          ></div>
        )}
      </div>
      <div className="fixed top-20 left-0 z-50">
        <button
          className="p-2 bg-neutral-800/50 text-gray-400 rounded-r-xl"
          onClick={() => setFold(!fold)}
        >
          <ChevronDoubleRightIcon
            className={`w-6 h-6 transition-transform duration-300 ${fold ? '' : 'rotate-180'}`}
          />
        </button>
      </div>
      <div
        className={`overflow-hidden py-24 absolute top-0 left-0 transition-all duration-500 ${fold ? 'w-0 h-0' : 'size-full'}`}
      >
        <div className="h-full main-panel mx-auto px-4 grid grid-rows-1 grid-cols-12 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-2">
            <MenuSide />
          </div>
          <div className="col-span-8 overflow-y-scroll overflow-x-hidden rounded-md bg-neutral-800/50 content-page">
            <Appearance hidden={menu !== 'appearance'} />
            <Devices hidden={menu !== 'devices'} />
            <Lights hidden={menu !== 'led'} />
            <About hidden={menu !== 'about'} />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
