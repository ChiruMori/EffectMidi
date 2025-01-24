import { Description, Field, Input, Label } from '@headlessui/react'
import React from 'react'

interface EmInputProps {
  label: string
  description: string
  placeholder?: string
  initValue?: string
  file?: boolean
  onChange?: (value: string) => void
}

const EmInput: React.FC<EmInputProps> = ({
  label,
  description,
  placeholder = '',
  initValue = '',
  onChange
}) => {
  return (
    <div className="py-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50">{description}</Description>
        <Input
          placeholder={placeholder}
          className={
            'mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          }
          defaultValue={initValue}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      </Field>
    </div>
  )
}

export default EmInput
