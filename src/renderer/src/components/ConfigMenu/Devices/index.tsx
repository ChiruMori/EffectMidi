import { useEffect, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import EmSelect from '@renderer/components/basic/EmSelect'
import { comSelector, comSlice, enableComSelector, enableComSlice } from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import { PortInfo } from '@renderer/common/common'
import ipc from '@renderer/common/ipcClient'
import lang from '@renderer/lang'
import EmSwitch from '@renderer/components/basic/EmSwitch'
import './index.styl'
import { useNotification } from '@renderer/components/basic/EmNotifacation'

export const Devices = ({ hidden }: { hidden: boolean }): JSX.Element => {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const nowCom = useAppSelector(comSelector)
  const enableCom = useAppSelector(enableComSelector)
  const { notify } = useNotification()
  const txt = lang()
  const dispatch = useAppDispatch()

  useEffect(() => {
    ipc.listSerialPorts().then((ports) => {
      setPorts(ports)
    })
  }, [])

  return (
    <div
      hidden={hidden}
      className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
    >
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
        onChange={(value) => {
          if (nowCom === '' || ports.length === 0) {
            notify({
              type: 'error',
              title: txt('notify.serial-unselected-title'),
              content: txt('notify.serial-unselected-content'),
              key: 'serial-unselected'
            })
            // 不要改变 enableCom 的值
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
