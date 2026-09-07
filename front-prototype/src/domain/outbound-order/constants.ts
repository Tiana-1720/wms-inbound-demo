/** 现网出库单列表状态（WMS_V1.0 §出库列表；空单调拨沿用现网 Tab 全量） */
export const OUTBOUND_ORDER_STATUSES = [
  '待出库',
  '已下架',
  '已复核',
  '已出库',
  '已取消',
] as const

export type OutboundOrderStatus = (typeof OUTBOUND_ORDER_STATUSES)[number]

/** 列表页状态 Tab（现网出库列表） */
export const OUTBOUND_TAB_KEYS = ['全部', ...OUTBOUND_ORDER_STATUSES] as const

export type OutboundTabKey = (typeof OUTBOUND_TAB_KEYS)[number]

/** 出库类型（现网查询区 & 列表列） */
export const OUTBOUND_TYPES = ['计划出库', '调拨出库'] as const

export type OutboundType = (typeof OUTBOUND_TYPES)[number]

/** 调拨类型（行操作分支：计划调拨沿用现网，空单调拨走加盟增量） */
export const TRANSFER_TYPES = ['计划调拨', '空单调拨'] as const

export type TransferType = (typeof TRANSFER_TYPES)[number]

/** 状态列配色（现网语义：待出库橙、已下架紫、已取消红等） */
export const OUTBOUND_STATUS_COLOR: Record<OutboundOrderStatus, string> = {
  待出库: 'warning',
  已下架: 'purple',
  已复核: 'orange',
  已出库: 'success',
  已取消: 'error',
}

export const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

export const CURRENT_OPERATOR = '管理员'

export function formatTabCount(count: number) {
  if (count > 99) return '99+'
  return String(count)
}
