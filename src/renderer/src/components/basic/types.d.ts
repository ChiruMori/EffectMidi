export interface EmFormProps<V> {
  label: string
  description?: string
  initValue?: V
  onChange?: (value: V) => boolean | void
}

export interface EmRangeProps extends EmFormProps<number> {
  min: number
  max: number
  fromColor?: string
  toColor?: string
}
