import type { InboundOrderStatus } from '@/domain/inbound-order/constants'

export const SORTING_SLOT_COUNT_STORAGE_KEY = 'pda-sorting-slot-count'
export const SORTING_SLOT_COUNT_MIN = 1
export const SORTING_SLOT_COUNT_MAX = 99
export const SORTING_SLOT_COUNT_DEFAULT = 5

/** PDA 分货可扫描运单状态 */
export const SORTING_WAYBILL_QUERY_STATUSES: InboundOrderStatus[] = [
  '待收货',
  '已收货',
  '收货中',
]
