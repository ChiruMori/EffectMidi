import MenuSide from './MenuSide'
import Appearance from './Appearance'
import { useAppSelector } from '@renderer/common/store'
import { Devices } from './Devices'
import { bgImgSelector, menuSelector } from '@renderer/config'
import Lights from './Lights'
import './index.styl'

function ConfigMenu(): JSX.Element {
  const nowBgImg = useAppSelector(bgImgSelector)
  const menu = useAppSelector(menuSelector)

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
      <div className="overflow-y-hidden py-24 size-full absolute">
        <div className="h-full main-panel mx-auto px-4 grid grid-rows-1 grid-cols-12 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-2">
            <MenuSide />
          </div>
          <div className="col-span-8 overflow-y-scroll overflow-x-hidden rounded-md bg-neutral-800/50 content-page">
            <Appearance hidden={menu !== 'appearance'} />
            <Devices hidden={menu !== 'devices'} />
            <Lights hidden={menu !== 'led'} />
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
