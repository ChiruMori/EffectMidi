import { Button, Description, Field, Input, Label } from '@headlessui/react'
import { FolderIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { debounce } from 'lodash'
import React, { useCallback } from 'react'
import './index.styl'

const FILE_PATH_PREFIX = '[EM:file] '

interface EmInputProps {
  label: string
  description: string
  placeholder?: string
  initValue?: string
  file?: boolean
  onChange?: (value: { path: string; dataUrl?: string }) => void
}

const EmInput: React.FC<EmInputProps> = ({
  label,
  description,
  placeholder = '',
  initValue = '',
  onChange = (): void => {}
}) => {
  const [filename, setFilename] = React.useState(initValue)
  const debounced = useCallback(debounce(onChange, 300), [])

  return (
    <div className="py-2">
      <Field>
        <Label className="text-lg font-medium text-white">{label}</Label>
        <Description className="text-sm/6 text-white/50">{description}</Description>

        <div className="relative">
          <Input
            className="mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25 text-left"
            placeholder={placeholder}
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value)
              debounced({ path: e.target.value })
            }}
            disabled={filename !== '' && filename.startsWith(FILE_PATH_PREFIX)}
          />
          <label
            htmlFor={filename && 'file'}
            className="absolute top-0 right-0 h-full cursor-pointer"
          >
            <Button className="bg-white/5 text-white/50 text-lg rounded-lg px-3 py-1.5 flex items-center justify-center h-full">
              {filename ? (
                <>
                  <XCircleIcon
                    className="top-2.5 right-2.5 size-4 fill-white/60"
                    onClick={(e) => {
                      setFilename('')
                      onChange && onChange({ path: '' })
                      e.preventDefault()
                    }}
                  />
                </>
              ) : (
                <>
                  <FolderIcon className="top-2.5 right-2.5 size-4 fill-white/60" />
                </>
              )}
            </Button>
            {filename ? (
              ''
            ) : (
              <input
                type="file"
                className="absolute top-0 right-0 cursor-pointer h-0 w-0 opacity-0 pl-full pt-full fileinp"
                accept="image/gif,image/jpeg,image/png"
                id="file"
                onChange={(e) => {
                  const filepath = e.target.files?.[0]?.path
                  if (!filepath) {
                    return
                  }
                  setFilename(FILE_PATH_PREFIX + filepath)
                  const reader = new FileReader()
                  reader.onload = (e: ProgressEvent<FileReader>): void => {
                    onChange &&
                      onChange({
                        path: FILE_PATH_PREFIX + filepath,
                        dataUrl: e.target?.result as string
                      })
                  }
                  // 读取文件为 Data URL
                  reader.readAsDataURL(e.target.files?.[0] as Blob)
                }}
                title=""
              />
            )}
          </label>
        </div>
      </Field>
    </div>
  )
}

export default EmInput
