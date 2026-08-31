import type { MenuDataItem } from '@ant-design/pro-components'

import { INBOUND_ORDER_LIST_PATH, TRANSFER_PLAN_LIST_PATH } from '@/config/routes'

/** ProLayout 菜单配置：订单管理 → 收货订单 */
export const appMenuData: MenuDataItem[] = [
  {
    path: '/order',
    name: '订单管理',
    children: [
      {
        path: INBOUND_ORDER_LIST_PATH,
        name: '收货订单',
      },
      {
        path: TRANSFER_PLAN_LIST_PATH,
        name: '调拨计划',
      },
    ],
  },
]
