/** 收货订单状态枚举（字段清单 §一「状态」） */
export const INBOUND_ORDER_STATUSES = [
  '待收货',
  '收货中',
  '已收货',
  '已绑托',
  '已上架',
  '已取消',
] as const

export type InboundOrderStatus = (typeof INBOUND_ORDER_STATUSES)[number]

/** 列表页状态 Tab（含「异常」，过滤逻辑见 Demo PRD §1.2） */
export const STATUS_TAB_KEYS = [
  '全部',
  ...INBOUND_ORDER_STATUSES,
  '异常',
] as const

export type StatusTabKey = (typeof STATUS_TAB_KEYS)[number]

/** 状态 Tag 配色（Demo PRD §1.5，集中维护；对应 Ant Design Tag color） */
export const STATUS_TAG_COLOR: Record<InboundOrderStatus, string> = {
  待收货: 'blue',
  收货中: 'cyan',
  已收货: 'green',
  已绑托: 'orange',
  已上架: 'success',
  已取消: 'default',
}

/** @deprecated 迁移至 Ant Design 后请使用 STATUS_TAG_COLOR */
export const STATUS_BADGE_CLASS: Record<InboundOrderStatus, string> = {
  待收货: 'border-transparent bg-muted text-muted-foreground',
  收货中: 'border-transparent bg-blue-100 text-blue-700',
  已收货: 'border-transparent bg-blue-100 text-blue-700',
  已绑托: 'border-transparent bg-green-100 text-green-700',
  已上架: 'border-transparent bg-yellow-100 text-yellow-800',
  已取消: 'border-transparent bg-red-100 text-red-700',
}

/** 业务类型（字段清单 §一） */
export const BUSINESS_TYPES = ['整柜', '散货'] as const

/** 业务归属（字段清单 §一） */
export const BUSINESS_OWNERSHIPS = ['德速', '速达', '德捷'] as const

/** 运输类型（字段清单 §一） */
export const TRANSPORT_TYPES = ['海运', '空运', '快递'] as const

/** 客户等级（字段清单 §一） */
export const CUSTOMER_GRADES = ['S'] as const

/** 入库类型（字段清单 §一；列表仅展示常规入库） */
export const INBOUND_TYPE_REGULAR = '常规入库' as const

/** 列表默认每页条数（Demo PRD §1.5） */
export const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

/** 收货仓库 / 预报仓库选项（Mock 仓库档案） */
export const WAREHOUSE_OPTIONS = [
  { code: 'YW', name: '义乌紫鑫仓' },
  { code: 'NC', name: '南昌加盟仓' },
  { code: 'GZ', name: '赣州加盟仓' },
  { code: 'DG', name: '东莞集货仓' },
] as const

/** 目的国选项（Mock 国家二字码字典） */
export const COUNTRY_OPTIONS = [
  { code: 'US', label: '美国' },
  { code: 'DE', label: '德国' },
  { code: 'GB', label: '英国' },
  { code: 'JP', label: '日本' },
  { code: 'AU', label: '澳大利亚' },
] as const

export function formatWarehouse(code: string, name: string) {
  return `${code}(${name})`
}

export function formatTabCount(count: number) {
  if (count > 99) return '99+'
  return String(count)
}
