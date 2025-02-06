import EmColorPicker from '@renderer/components/basic/EmColorPicker'

export default function Lights({ hidden }: { hidden: boolean }): JSX.Element {
  return (
    <div
      hidden={hidden}
      className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
    >
      <EmColorPicker
        label="Color"
        description="Choose the color of the lights"
        onChange={() => {}}
        initValue={'#000000'}
      />
    </div>
  )
}
