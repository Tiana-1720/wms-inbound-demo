import { theme } from 'antd'
import { Outlet } from 'react-router-dom'

/** 桌面预览用 375px 竖屏容器；边框仅标出机框，不是作业页视觉的一部分 */
export function PdaDeviceFrame() {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        background: token.colorBgLayout,
        display: 'flex',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 375,
          maxWidth: '100%',
          height: 'calc(100vh - 88px)',
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}
