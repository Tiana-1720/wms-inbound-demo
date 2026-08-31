import { INBOUND_ORDER_LIST_PATH, TRANSFER_PLAN_LIST_PATH } from '@/config/routes'

export type NavItem = {
  title: string
  path?: string
  children?: NavItem[]
}

export const navigation: NavItem[] = [
  {
    title: '订单管理',
    children: [
      {
        title: '收货订单',
        path: INBOUND_ORDER_LIST_PATH,
      },
      {
        title: '调拨计划',
        path: TRANSFER_PLAN_LIST_PATH,
      },
    ],
  },
]
