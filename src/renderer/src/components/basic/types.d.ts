export interface EmRangeProps {
  min: number
  max: number
  label: string
  description?: string
  initValue?: number
  fromColor?: string
  toColor?: string
  onChange?: (value: number) => void
}
