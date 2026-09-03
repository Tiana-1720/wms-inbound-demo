import { LeftOutlined } from '@ant-design/icons'
import { Button, theme } from 'antd'
import { useNavigate } from 'react-router-dom'

type PdaNavBarProps = {
  title: string
  onBack?: () => void
}

export function PdaNavBar({ title, onBack }: PdaNavBarProps) {
  const navigate = useNavigate()
  const { token } = theme.useToken()

  return (
    <div
      style={{
        flexShrink: 0,
        height: 44,
        display: 'grid',
        gridTemplateColumns: '44px 1fr 44px',
        alignItems: 'center',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Button
        type="text"
        aria-label="返回"
        icon={<LeftOutlined />}
        onClick={() => (onBack ? onBack() : navigate(-1))}
        style={{ height: 44, width: 44 }}
      />
      <div
        style={{
          textAlign: 'center',
          fontWeight: 600,
          color: token.colorText,
        }}
      >
        {title}
      </div>
    </div>
  )
}
