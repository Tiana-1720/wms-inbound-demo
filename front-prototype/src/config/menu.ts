import type { MenuDataItem } from '@ant-design/pro-components'

import {
  INBOUND_ORDER_LIST_PATH,
  OUTBOUND_ORDER_LIST_PATH,
  PDA_PUTAWAY_PATH,
  PDA_SORTING_PATH,
  PDA_TRANSFER_LOAD_PATH,
  SORTING_CONFIG_PATH,
  TRANSFER_PLAN_LIST_PATH,
} from '@/config/routes'

/** ProLayout 菜单：对齐现网「出库管理 → 出库列表」 */
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
      {
        path: SORTING_CONFIG_PATH,
        name: '分货参数',
      },
    ],
  },
  {
    name: '出库管理',
    children: [
      {
        path: OUTBOUND_ORDER_LIST_PATH,
        name: '出库列表',
      },
    ],
  },
  {
    name: 'PDA',
    children: [
      {
        name: '入库管理',
        children: [
          {
            path: PDA_SORTING_PATH,
            name: '分货',
          },
          {
            path: PDA_PUTAWAY_PATH,
            name: '上架',
          },
        ],
      },
      {
        name: '出库管理',
        children: [
          {
            path: PDA_TRANSFER_LOAD_PATH,
            name: '装车',
          },
        ],
      },
    ],
  },
]
