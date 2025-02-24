import { useEffect, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import EmSelect from '@renderer/components/basic/EmSelect'
import {
  comSelector,
  comSlice,
  enableComSelector,
  enableComSlice,
  menuSlice,
  midiSelector,
  midiSlice
} from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import { PortInfo } from '@renderer/common/common'
import ipc from '@renderer/common/ipcClient'
import lang from '@renderer/lang'
import EmSwitch from '@renderer/components/basic/EmSwitch'
import { useNotification } from '@renderer/components/basic/EmNotifacation'
import midi from '@renderer/components/Keyboard/midi'
import './index.styl'

export const Devices = ({ hidden }: { hidden: boolean }): JSX.Element => {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const nowCom = useAppSelector(comSelector)
  const enableCom = useAppSelector(enableComSelector)
  const { notify } = useNotification()
  const txt = lang()
  const dispatch = useAppDispatch()
  const selectedDeviceId = useAppSelector(midiSelector)

  const comAbortedNotify = (): void => {
    notify({
      type: 'info',
      title: txt('notify.serial-abort-title'),
      content: txt('notify.serial-abort-content'),
      key: 'serial-abort'
    })
  }

  const connectDeviceById = (deviceId: string): void => {
    if (deviceId) {
      midi.connectDevice(deviceId, () => {
        dispatch(midiSlice.actions.setMidi(''))
        notify({
          type: 'info',
          title: txt('notify.midi-connect-error-title'),
          content: txt('notify.midi-connect-error-content'),
          key: 'midi-disconnected'
        })
      }).catch(() => {
        dispatch(midiSlice.actions.setMidi(''))
        notify({
          type: 'error',
          title: txt('notify.midi-connect-error-title'),
          content: txt('notify.midi-connect-error-content'),
          duration: 10000,
          key: 'midi-error'
        })
      })
      dispatch(midiSlice.actions.setMidi(deviceId))
    }
  }

  useEffect(() => {
    window.api.onSerialAbort(() => {
      // 选项置为未开启，串口置为空
      dispatch(enableComSlice.actions.setEnableCom(false))
      dispatch(comSlice.actions.setCom(''))
      comAbortedNotify()
      // 跳转到当前页面
      dispatch(menuSlice.actions.setMenu('devices'))
    })
    ipc.listSerialPorts().then((ports) => {
      setPorts(ports)
    })
    // 连接 MIDI 设备
    connectDeviceById(selectedDeviceId)
    return (): void => {
      window.api.offEvent('serial-abort')
      midi.disconnectDevice()
    }
  }, [])

  return (
    <div
      hidden={hidden}
      className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
    >
      <EmSelect
        label={txt('devices.midi-device-label')}
        description={txt('devices.midi-device-desc')}
        options={midi.listAllDevices().map(device => ({
          val: device.id,
          label: device.name || device.manufacturer || txt('devices.unknown-midi-device')
        }))}
        onChange={connectDeviceById}
        initValue={selectedDeviceId}
        suffixBtn={
          <button
            className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-9 ref-btn"
            onClick={() => connectDeviceById(selectedDeviceId)}>
            <ArrowPathIcon className="group pointer-events-none size-4 fill-white/60 animate__animated" />
          </button>
        }
      />
      <EmSelect
        label={txt('devices.serial-port-label')}
        description={txt('devices.serial-port-desc')}
        options={ports.map((port) => ({
          val: port.path,
          label: port.friendlyName || port.path
        }))}
        onChange={(value) => {
          dispatch(comSlice.actions.setCom(value))
        }}
        initValue={nowCom}
        suffixBtn={
          <button
            className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-9 ref-btn"
            onClick={() => {
              ipc.listSerialPorts().then((ports) => {
                setPorts(ports)
              })
            }}
          >
            <ArrowPathIcon className="group pointer-events-none size-4 fill-white/60 animate__animated" />
          </button>
        }
      />
      <EmSwitch
        label={txt('devices.serial-enable-label')}
        description={txt('devices.serial-enable-desc')}
        initValue={enableCom}
        onChange={async (value) => {
          // 强制获取最新端口列表
          const latestPorts = await ipc.listSerialPorts()
          setPorts(latestPorts)

          // 检查串口是否有效
          const isValidPort = latestPorts.some(p => p.path === nowCom)

          if (!isValidPort) {
            notify({
              type: 'error',
              title: txt('notify.serial-unselected-title'),
              content: txt('notify.serial-unselected-content'),
              key: 'serial-unselected'
            })
            // 尝试启用的串口无效，阻止状态变化
            dispatch(comSlice.actions.setCom(''))
            return true
          }
          console.log('enableCom', value, nowCom)
          // 通知主进程操作串口
          if (value) {
            ipc.initLed()
          } else {
            ipc.closeLed()
          }
          dispatch(enableComSlice.actions.setEnableCom(value))
          return false
        }}
      />
    </div>
  )
}
