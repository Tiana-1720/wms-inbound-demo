import { ScanOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import type { InputRef } from 'antd'
import { useEffect, useRef, useState } from 'react'

type ScanInputProps = {
  placeholder: string
  disabled?: boolean
  loading?: boolean
  onScan: (value: string) => void
}

/** Demo `ScanInput`：回车即校验，无搜索按钮 */
export function ScanInput({
  placeholder,
  disabled,
  loading,
  onScan,
}: ScanInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const submit = () => {
    const next = value.trim()
    if (!next || loading || disabled) return
    onScan(next)
    setValue('')
  }

  return (
    <Input
      ref={inputRef}
      size="large"
      allowClear
      disabled={disabled}
      prefix={<ScanOutlined />}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onPressEnter={submit}
    />
  )
}
