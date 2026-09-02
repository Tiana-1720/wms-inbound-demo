import { theme } from 'antd'
import type { ReactNode } from 'react'

type PdaBottomBarProps = {
  children: ReactNode
}

export function PdaBottomBar({ children }: PdaBottomBarProps) {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        gap: 8,
        padding: 12,
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {children}
    </div>
  )
}

export const PDA_PRIMARY_BUTTON_STYLE = { height: 44, flex: 1 } as const
