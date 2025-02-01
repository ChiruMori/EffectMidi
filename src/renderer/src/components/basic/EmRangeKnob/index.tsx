import React, { useState, useCallback } from 'react'
import './index.styl'
import { getMidColor } from '@renderer/common/colors'
import { EmRangeProps } from '../types'

const SKIP_GAP = 0.3

const EmRange: React.FC<EmRangeProps> = ({
  label,
  description,
  min,
  max,
  initValue = min,
  fromColor = '#FF5252',
  toColor = '#4CAF50',
  onChange = (): void => {}
}) => {
  const [value, setValue] = useState<number>(initValue)
  const debounced = useCallback(onChange, [])

  const radius = 100
  const center = radius + 10
  const circumference = 2 * Math.PI * radius

  const getRotation = (value: number): number => {
    const progress = ((value - min) / (max - min)) * (1 - SKIP_GAP)
    const angle = progress * 360 + 180 + (360 * SKIP_GAP) / 2
    return angle % 360
  }

  const strokeArray = (value: number): string => {
    const progress = ((value - min) / (max - min)) * (1 - SKIP_GAP)
    const overflow = progress + SKIP_GAP / 2 - 0.75
    const p1 = overflow > 0 ? overflow : 0
    const p2 = overflow > 0 ? 0.25 + SKIP_GAP / 2 - overflow : 0.25 + SKIP_GAP / 2
    const p3 = overflow > 0 ? (3 - 2 * SKIP_GAP) / (4 - 4 * SKIP_GAP) : progress
    return `${p1 * circumference} ${p2 * circumference} ${Math.max(5, p3 * circumference)} ${circumference}`
  }

  const getColor = (val: number): string => {
    const progress = (val - min) / (max - min)
    return getMidColor(progress, fromColor, toColor)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLElement>): void => {
    const dragStartY = event.clientY
    const handleMouseMove = function (e: Event): void {
      const deltaY = (-((e as MouseEvent).clientY - dragStartY) / (max - min)) * 30
      const newValue = ~~Math.min(max, Math.max(min, value + deltaY))
      setValue(newValue)
      debounced(newValue)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', handleMouseMove)
    })
  }

  return (
    <div className="em-range" onMouseDown={handleMouseDown}>
      <svg viewBox="0 0 220 220">
        <circle cx={center} cy={center} r={radius} stroke="#333" strokeWidth="10" fill="none" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColor(value)}
          strokeWidth="20"
          fill="none"
          strokeDasharray={strokeArray(value)}
        />
        <circle
          cx={center + radius * 0.75 * Math.cos(getRotation(value) * (Math.PI / 180) - Math.PI / 2)}
          cy={center + radius * 0.75 * Math.sin(getRotation(value) * (Math.PI / 180) - Math.PI / 2)}
          r="8"
          fill={getColor(value)}
        />
      </svg>
      <div className="value-display">
        {label}:{value}
        <small>{description}</small>
      </div>
    </div>
  )
}

export default EmRange
