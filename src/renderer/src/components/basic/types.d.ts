export interface EmRangeProps {
  min: number
  max: number
  label: string
  description?: string
  initValue?: string
  fromColor?: string
  toColor?: string
  onChange?: (value: number) => void
}
