import { Description, Field, Label } from '@headlessui/react'
import { useState } from 'react'

interface EmCheckertProps<V> {
  label: string
  description: string
  options: { color: string; val: V }[]
  initialValue: V
  onChange: (val: V) => void
}

export default function EmSelect<T>({
  label,
  description,
  options,
  onChange,
  initialValue
}: EmCheckertProps<T>): JSX.Element {
  const [selected, setSelected] = useState(initialValue)
  return (
    <div className="py-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50 mb-2">{description}</Description>
        <div className="inline">
          {options.map((opt) => (
            <div
              key={opt.color}
              className="w-5 h-5 rounded-md text-sm/6 text-white/90 cursor-pointer inline-block m-1 hover:scale-110 transition-transform hover:shadow-sm hover:shadow-white"
              style={{
                backgroundColor: opt.color.startsWith('#') ? opt.color : 'unset',
                backgroundImage:
                  opt.color.startsWith('url') || opt.color.includes('gradient')
                    ? opt.color
                    : 'unset',
                border: selected === opt.val ? '2px solid white' : 'none'
              }}
              onClick={() => {
                setSelected(opt.val)
                onChange(opt.val)
              }}
            ></div>
          ))}
        </div>
      </Field>
    </div>
  )
}
