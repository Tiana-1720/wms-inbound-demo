import { UserOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-components'
import { Dropdown, Space } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { appMenuData } from '@/config/menu'
import { APP_ROLES, useCurrentUser } from '@/session/CurrentUserContext'

export function ProAppLayout() {
  const location = useLocation()
  const { user, setRole } = useCurrentUser()

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
        title: `${user.name}（${user.role}）`,
        render: (_, dom) => (
          <Dropdown
            menu={{
              selectedKeys: [user.role],
              items: APP_ROLES.map((role) => ({
                key: role,
                label: role,
              })),
              onClick: ({ key }) => setRole(key as (typeof APP_ROLES)[number]),
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
