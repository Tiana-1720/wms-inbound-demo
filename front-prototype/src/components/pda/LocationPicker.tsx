import { RightOutlined } from '@ant-design/icons'
import { Drawer, Input, List, theme } from 'antd'
import { useMemo, useState } from 'react'

import { PUTAWAY_STOCK_LOCATIONS } from '@/domain/putaway/constants'

type LocationPickerProps = {
  value: string | null
  disabled?: boolean
  onChange: (location: string) => void
}

/** Demo LocationPicker：卡片右侧「库位 >」，底部 Drawer + 可搜索选择 */
export function LocationPicker({
  value,
  disabled,
  onChange,
}: LocationPickerProps) {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const options = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return PUTAWAY_STOCK_LOCATIONS
    return PUTAWAY_STOCK_LOCATIONS.filter((item) =>
      item.toLowerCase().includes(q),
    )
  }, [keyword])

  if (disabled) {
    return (
      <span style={{ color: token.colorTextSecondary }}>
        {value ?? '库位'}
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          color: value ? token.colorText : token.colorTextSecondary,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {value ?? '库位'}
        <RightOutlined style={{ fontSize: 12 }} />
      </button>
      <Drawer
        title="选择备货库位"
        placement="bottom"
        height="60%"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <Input
          allowClear
          placeholder="搜索库位"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        <List
          dataSource={[...options]}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => {
                onChange(item)
                setOpen(false)
                setKeyword('')
              }}
            >
              {item}
            </List.Item>
          )}
        />
      </Drawer>
    </>
  )
}
