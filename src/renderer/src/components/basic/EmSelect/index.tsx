import {
  Description,
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/react'
import lang from '@renderer/lang'
import { useState } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid'

interface EmSelectProps {
  label: string
  description: string
  options: { label: string; val: string }[]
  initialValue: string
  onChange: (val: string) => void
  suffixBtn?: JSX.Element
}

export default function EmSelect({
  label,
  description,
  options,
  onChange,
  initialValue,
  suffixBtn = undefined
}: EmSelectProps): JSX.Element {
  const [selected, setSelected] = useState(initialValue)
  const txt = lang()
  return (
    <div className="py-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50 mb-2">{description}</Description>
        <Listbox
          value={selected}
          onChange={(val) => {
            setSelected(val)
            onChange(val)
          }}
        >
          <div className="w-full flex gap-1">
            <ListboxButton
              className="grow relative block rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white
           focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
            >
              {options.filter((o) => o.val === selected)[0]?.label ??
                txt('components.select.no-selected')}
              <ChevronDownIcon
                className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            {suffixBtn}
          </div>
          <ListboxOptions
            anchor="bottom"
            transition
            className="w-[var(--button-width)] rounded-xl border border-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none
          transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 bg-zinc-800"
          >
            {options.map((opt) => (
              <ListboxOption
                key={opt.val}
                value={opt.val}
                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
              >
                <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                <div className="text-sm/6 text-white">{opt.label}</div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      </Field>
    </div>
  )
}
