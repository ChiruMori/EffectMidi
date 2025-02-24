import { HexColorPicker } from 'react-colorful'
import { Button, Description, Field, Input, Label } from '@headlessui/react'
import { EyeDropperIcon } from '@heroicons/react/20/solid'
import { useCallback, useEffect, useState, useRef } from 'react'
import { debounce } from 'lodash'
import { EmFormProps } from '../types'
import './index.styl'

interface EmColorPickerProps extends EmFormProps<string> {}

export default function EmColorPicker({
  label,
  description,
  onChange = (): void => {},
  initValue = '#000000'
}: EmColorPickerProps): JSX.Element {
  const [color, setColor] = useState(initValue)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [enableFadeOut, setEnableFadeOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedOnChanged = useCallback(debounce(onChange, 100), [])

  // 组件失焦后隐藏颜色选择器
  useEffect(() => {
    setColor(initValue)
    const enableFadeOut = (e: MouseEvent): void => {
      // 点击了组件区域，不隐藏
      if (containerRef.current?.contains(e.target as Node)) {
        return
      }
      setShowColorPicker(false)
      setTimeout(() => {
        setEnableFadeOut(false)
      }, 500)
    }
    document.addEventListener('click', enableFadeOut)
    return (): void => {
      document.removeEventListener('click', enableFadeOut)
    }
  }, [initValue])

  return (
    <div className="py-2" ref={containerRef}>
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50 mb-2">{description}</Description>
        <div
          className="relative picker-container"
          onClick={() => {
            setShowColorPicker(true)
            setEnableFadeOut(true)
          }}
        >
          <div className="relative">
            <Input
              className="mt-3 block w-full rounded-lg border-none py-1.5 px-3 text-sm/6 cursor-pointer text-left z-0 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
              style={{
                backgroundColor: color + '88',
                color:
                  (parseInt(color.slice(1, 3), 16) +
                    parseInt(color.slice(3, 5), 16) +
                    parseInt(color.slice(5, 7), 16)) /
                    3 >
                  127
                    ? '#000'
                    : '#fff'
              }}
              value={color}
              onChange={(e) => {
                const cancel = debouncedOnChanged(e.target.value)
                if (cancel) {
                  return
                }
                setColor(e.target.value)
              }}
            />
            <div className="absolute right-0 top-0 h-full">
              <Button className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-full color-picker-btn">
                <EyeDropperIcon className="top-2.5 right-2.5 size-4 fill-white/60 animate__animated color-picker-icon" />
              </Button>
            </div>
          </div>
          <div
            className={`color-picker absolute top-full right-0 p-2 animate__animated animate__faster z-10 ${
              showColorPicker
                ? 'animate__fadeInDown'
                : enableFadeOut
                  ? 'animate__fadeOutUp'
                  : 'hidden'
            }`}
          >
            <HexColorPicker
              color={color}
              onChange={(color) => {
                setColor(color)
                debouncedOnChanged(color)
              }}
            />
          </div>
        </div>
      </Field>
    </div>
  )
}
