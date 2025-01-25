import { useState } from 'react'
import MenuSlide, { type MenuOptions } from './MenuSlide'
import Appearance from './Appearance'
import EmRangeKnob from '../basic/EmRangeKnob'
import { type RootState, useAppSelector } from '@renderer/common/store'
import './index.styl'

function ConfigMenu(): JSX.Element {
  const [menu, setMenu] = useState<MenuOptions>('appearance')
  const nowBgImg = useAppSelector(
    (state: RootState): { img: string; dataUrl: string; maskOpacity: number } => state.bg
  )

  return (
    <>
      <div
        className="absolute w-full h-full bg-cover bg-center -z-10"
        style={
          nowBgImg.img === ''
            ? {}
            : {
                backgroundImage: 'url(' + (nowBgImg.dataUrl || nowBgImg.img) + ')'
              }
        }
      >
        {nowBgImg.img === '' ? (
          ''
        ) : (
          <div
            className="absolute w-full h-full bg-black z-10"
            style={{ opacity: nowBgImg.maskOpacity / 100 }}
          ></div>
        )}
      </div>
      <div className="overflow-y-hidden py-24 size-full absolute">
        <div className="h-full main-panel mx-auto px-4 grid grid-rows-1 grid-cols-12 gap-4">
          <div className="col-span-1"></div>
          <div className="col-span-2">
            <MenuSlide menu={menu} onChange={setMenu} />
          </div>
          <div className="col-span-8 overflow-y-scroll overflow-x-hidden rounded-md bg-neutral-800/50 content-page">
            <Appearance hidden={menu !== 'appearance'} />
            <div
              hidden={menu !== 'devices'}
              className={`animate__animated animate__faster w-32 ${menu === 'devices' ? 'animate__lightSpeedInRight' : ''}`}
            >
              <EmRangeKnob max={100} min={0} fromColor="#000000" toColor="#4CAF50" label="Label" />
            </div>
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
