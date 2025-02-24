import ipcClient from '@renderer/common/ipcClient'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import EmColorPicker from '@renderer/components/basic/EmColorPicker'
import C from '@renderer/common/colors'
import EmRangeSlider from '@renderer/components/basic/EmRangeSlider'
import { ledSelector, ledSlice, themeSelector } from '@renderer/config'
import lang from '@renderer/lang'

export default function Lights({ hidden }: { hidden: boolean }): JSX.Element {
  const txt = lang()
  const dispatch = useAppDispatch()
  const led = useAppSelector(ledSelector)
  const nowColorType = useAppSelector(themeSelector)

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
      <EmColorPicker
        label={txt('led.end-color-label')}
        description={txt('led.end-color-desc')}
        onChange={(color) => {
          ipcClient.setEndColor(color)
          dispatch(ledSlice.actions.setEndColor(color))
        }}
        initValue={led.endColor}
      />
      <EmRangeSlider
        min={0}
        max={3}
        fromColor={C(nowColorType).main}
        toColor={C(nowColorType).sub}
        label={txt('led.diffusion-width-label')}
        description={txt('led.diffusion-width-desc')}
        onChange={(value) => {
          ipcClient.setDiffusionWidth(value)
          dispatch(ledSlice.actions.setDiffusionWidth(value))
        }}
        initValue={led.diffusion}
      />
      <EmRangeSlider
        min={0}
        max={100}
        fromColor={C(nowColorType).main}
        toColor={C(nowColorType).sub}
        label={txt('led.residual-time-label')}
        description={txt('led.residual-time-desc')}
        onChange={(value) => {
          ipcClient.setResidualTime(value)
          dispatch(ledSlice.actions.setResidualTime(value))
        }}
        initValue={led.residual}
      />
    </div>
  )
}
