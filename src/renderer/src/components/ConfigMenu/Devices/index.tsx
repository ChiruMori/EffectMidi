import { useEffect, useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import EmSelect from '@renderer/components/basic/EmSelect'
import { comSelector, comSlice } from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import { PortInfo } from '@renderer/common/common'
import ipc from '@renderer/common/ipcClient'
import lang from '@renderer/lang'
import './index.styl'

export const Devices = ({ hidden }: { hidden: boolean }): JSX.Element => {
  const [ports, setPorts] = useState<PortInfo[]>([])
  const nowCom = useAppSelector(comSelector)
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
        label={txt('devices.serial-port')}
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
    </div>
  )
}
