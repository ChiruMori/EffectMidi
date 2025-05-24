import { useEffect, useRef, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import EmSelect from '@renderer/components/basic/EmSelect'
import {
  embeddedSelector,
  embeddedSlice,
  enableEmbeddedSelector,
  enableEmbeddedSlice,
  menuSlice,
  midiSelector,
  midiSlice
} from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import ipc from '@renderer/common/ipcClient'
import lang from '@renderer/lang'
import EmSwitch from '@renderer/components/basic/EmSwitch'
import { useNotification } from '@renderer/components/basic/EmNotifacation'
import midi from '@renderer/components/Keyboard/midi'
import './index.styl'

const simpleHash = (str: string, len: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16).slice(0, len)
}

export const Devices = ({ hidden }: { hidden: boolean }): JSX.Element => {
  const [embeddeds, setEmbeddeds] = useState<string[]>([])
  const nowEmbedded = useAppSelector(embeddedSelector)
  const enableEmbedded = useAppSelector(enableEmbeddedSelector)
  const { notify } = useNotification()
  const dispatch = useAppDispatch()
  const selectedDeviceId = useAppSelector(midiSelector)
  const txt = lang()
  // 引用容器，使回调函数中的 txt 保持最新
  const txtRef = useRef(txt)
  useEffect(() => {
    txtRef.current = txt
  }, [txt])

  const embeddedAbortedNotify = (): void => {
    console.log(txt('notify.embedded-abort-title'))
    notify({
      type: 'info',
      title: txt('notify.embedded-abort-title'),
      content: txt('notify.embedded-abort-content'),
      key: 'embedded-abort'
    })
  }

  const connectDeviceById = (deviceId: string): void => {
    midi
      .connectDevice(deviceId, () => {
        dispatch(midiSlice.actions.setMidi(''))
      })
      .catch(() => {
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

  useEffect(() => {
    window.api.onSerialAbort(() => {
      // 选项置为未开启，置为空
      dispatch(enableEmbeddedSlice.actions.setEnableEmbedded(false))
      dispatch(embeddedSlice.actions.setEmbedded(''))
      embeddedAbortedNotify()
      // 跳转到当前页面
      dispatch(menuSlice.actions.setMenu('devices'))
    })
    ipc.listEmbeddeds().then(setEmbeddeds)
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
        options={midi.listAllDevices().map((device) => ({
          val: device.id,
          label: device.name || device.manufacturer || txt('devices.unknown-midi-device')
        }))}
        onChange={connectDeviceById}
        initValue={selectedDeviceId}
        suffixBtn={
          <button
            className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-9 ref-btn"
            onClick={() => connectDeviceById(selectedDeviceId)}
          >
            <ArrowPathIcon className="group pointer-events-none size-4 fill-white/60 animate__animated" />
          </button>
        }
      />
      <EmSelect
        label={txt('devices.embedded-label')}
        description={txt('devices.embedded-desc')}
        options={embeddeds.map((device) => ({
          val: device,
          // path 过长，hash 处理为 8 位长度用于展示
          label: txt('devices.embedded-option-prefix') + simpleHash(device, 8)
        }))}
        onChange={(value) => {
          // 切换设备，需要关闭当前设备
          if (value !== nowEmbedded) {
            ipc.closeLed()
            dispatch(enableEmbeddedSlice.actions.setEnableEmbedded(false))
            dispatch(embeddedSlice.actions.setEmbedded(value))
          }
        }}
        initValue={nowEmbedded}
        suffixBtn={
          <button
            className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-9 ref-btn"
            onClick={() => {
              ipc.listEmbeddeds().then(setEmbeddeds)
            }}
          >
            <ArrowPathIcon className="group pointer-events-none size-4 fill-white/60 animate__animated" />
          </button>
        }
      />
      <EmSwitch
        label={txt('devices.embedded-enable-label')}
        description={txt('devices.embedded-enable-desc')}
        initValue={enableEmbedded}
        onChange={async (value) => {
          console.log('USB: ', nowEmbedded, value)
          // 通知主进程操作串口
          if (value && nowEmbedded) {
            ipc.initLed()
          } else {
            ipc.closeLed()
          }
          dispatch(enableEmbeddedSlice.actions.setEnableEmbedded(value))
          return false
        }}
      />
    </div>
  )
}
