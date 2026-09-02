import type { MenuDataItem } from '@ant-design/pro-components'

import {
  INBOUND_ORDER_LIST_PATH,
  PDA_PUTAWAY_PATH,
  PDA_SORTING_PATH,
  PDA_TRANSFER_LOAD_PATH,
  TRANSFER_PLAN_LIST_PATH,
} from '@/config/routes'

/** ProLayout 菜单：后台订单管理 + PDA 作业（叶子才可点） */
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
