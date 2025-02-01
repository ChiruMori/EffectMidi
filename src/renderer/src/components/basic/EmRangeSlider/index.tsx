import React, { useState, useCallback } from 'react'
import { EmRangeProps } from '../types'
import { getMidColor } from '@renderer/common/colors'
import './index.styl'
import { Description, Field, Label } from '@headlessui/react'

const RangeSelector: React.FC<EmRangeProps> = ({
  min,
  max,
  label,
  description = '',
  fromColor = '#FF5252',
  toColor = '#4CAF50',
  initValue = min,
  onChange = (): void => {}
}) => {
  const [value, setValue] = useState<number>(initValue)
  const debounced = useCallback(onChange, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(Number(event.target.value))
    debounced(Number(event.target.value))
  }

  const getTicks = (): number[] => {
    const ticks = [] as number[]
    for (let i = min; i <= max; i += 10) {
      // 每10个单位一个刻度
      ticks.push(i)
    }
    return ticks
  }

  return (
    <div className="pt-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        {description && (
          <Description className="text-sm/6 text-white/50">{description}</Description>
        )}

        <div className="flex flex-col items-center mt-3 px-2">
          <div className="slider relative w-full h-1 bg-gray-300 rounded-lg">
            <div
              className="absolute h-full rounded-lg z-0"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: getMidColor((value - min) / (max - min), fromColor, toColor)
              }}
            />
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={handleChange}
              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* 刻度线 */}
            <div className="absolute w-full flex justify-between -z-10">
              {getTicks().map((tick) => (
                <div key={tick} className="h-3 w-0.5 bg-gray-600 rounded-lg z-0" />
              ))}
            </div>

            {/* 游标 */}
            <div
              className="slider-cursor absolute w-4 h-4 rounded-full border-white cursor-pointer z-10"
              style={{
                left: `${((value - min) / (max - min)) * 100}%`,
                backgroundColor: getMidColor((value - min) / (max - min), fromColor, toColor)
              }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="font-semibold">{value}</span>
          </div>
        </div>
      </Field>
    </div>
  )
}

export default RangeSelector
