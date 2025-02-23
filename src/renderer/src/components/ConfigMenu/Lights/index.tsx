import ipcClient from '@renderer/common/ipcClient'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import EmColorPicker from '@renderer/components/basic/EmColorPicker'
import { ledSelector, ledSlice } from '@renderer/config'
import lang from '@renderer/lang'

export default function Lights({ hidden }: { hidden: boolean }): JSX.Element {
  const txt = lang()
  const dispatch = useAppDispatch()
  const led = useAppSelector(ledSelector)
  return (
    <div
      hidden={hidden}
      className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
    >
      <EmColorPicker
        label={txt('led.bg-color-label')}
        description={txt('led.bg-color-desc')}
        onChange={(color) => {
          ipcClient.setBgColor(color)
          dispatch(ledSlice.actions.setBgColor(color))
        }}
        initValue={led.bgColor}
      />
      <EmColorPicker
        label={txt('led.fg-color-label')}
        description={txt('led.fg-color-desc')}
        onChange={(color) => {
          ipcClient.setFgColor(color)
          dispatch(ledSlice.actions.setFgColor(color))
        }}
        initValue={led.fgColor}
      />
    </div>
  )
}
