import { Description, Field, Label, Switch } from '@headlessui/react'
import { themeSelector } from '@renderer/config'
import { useEffect, useState } from 'react'
import { EmFormProps } from '../types'
import { useAppSelector } from '@renderer/common/store'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

interface EmSwitchProps extends EmFormProps<boolean> {}

export default function EmSwitch({
  label,
  description,
  initValue,
  onChange
}: EmSwitchProps): JSX.Element {
  const [enabled, setEnabled] = useState(initValue)
  const theme = useAppSelector(themeSelector)

  useEffect(() => {
    setEnabled(initValue)
  }, [initValue])

  return (
    <div className="py-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50 mb-2">{description}</Description>
        <Switch
          checked={enabled}
          onChange={async () => {
            const cancel = onChange && (await onChange(!enabled))
            if (cancel) {
              return
            }
            setEnabled(!enabled)
          }}
          className={`group inline-flex h-6 w-11 items-center rounded-full transition bg-${enabled ? theme + '-main' : 'gray-200'}`}
        >
          <span
            className={`size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6 text-${theme}-sub`}
          >
            {/* ICON */}
            {enabled ? <CheckCircleIcon /> : <XCircleIcon />}
          </span>
        </Switch>
      </Field>
    </div>
  )
}
