import { UserOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-components'
import { Dropdown, Space } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { appMenuData } from '@/config/menu'

export function ProAppLayout() {
  const location = useLocation()

  return (
    <ProLayout
      title="德速OMS"
      logo={false}
      layout="mix"
      fixSiderbar
      location={{ pathname: location.pathname }}
      route={{ path: '/', routes: appMenuData }}
      menuItemRender={(item, dom) =>
        item.path ? <Link to={item.path}>{dom}</Link> : dom
      }
      avatarProps={{
        icon: <UserOutlined />,
        title: '管理员（占位）',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [{ key: 'profile', label: '个人中心（占位）' }],
            }}
          >
            <Space>{dom}</Space>
          </Dropdown>
        ),
      }}
      contentStyle={{ padding: 0 }}
    >
      <Outlet />
    </ProLayout>
  )
}
