import type { OutboundTabKey } from '@/domain/outbound-order/constants'
import type {
  OutboundOrder,
  OutboundOrderFilters,
} from '@/domain/outbound-order/types'

export function parseBatchValues(value: string) {
  return value
    .split(/[,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function matchBatchExact(fieldValue: string, query: string) {
  const values = parseBatchValues(query)
  if (values.length === 0) return true
  return values.includes(fieldValue)
}

function matchBatchAny(fieldValues: string[], query: string) {
  const values = parseBatchValues(query)
  if (values.length === 0) return true
  return values.some((value) => fieldValues.includes(value))
}

export function applyOutboundFilters(
  orders: OutboundOrder[],
  filters: OutboundOrderFilters,
) {
  return orders.filter((order) => {
    if (!matchBatchAny(order.运单号列表 ?? [], filters.运单号)) return false
    if (
      filters.计划单号 &&
      !matchBatchExact(order.计划单号, filters.计划单号) &&
      !matchBatchExact(order.调拨计划单号 ?? '', filters.计划单号)
    ) {
      return false
    }
    if (filters.出库类型 && order.出库类型 !== filters.出库类型) return false
    return true
  })
}

export function applyOutboundTabFilter(
  orders: OutboundOrder[],
  tab: OutboundTabKey,
) {
  if (tab === '全部') return orders
  return orders.filter((order) => order.状态 === tab)
}

export function countByOutboundTab(
  orders: OutboundOrder[],
): Record<OutboundTabKey, number> {
  const counts = {
    全部: orders.length,
    待出库: 0,
    已下架: 0,
    已复核: 0,
    已出库: 0,
    已取消: 0,
  } satisfies Record<OutboundTabKey, number>

  for (const order of orders) {
    counts[order.状态] += 1
  }

  return counts
}

/** 现网默认：按计划装柜时间升序（无则排后），再按创建时间升序 */
export function sortOutboundOrders(orders: OutboundOrder[]) {
  return [...orders].sort((a, b) => {
    const aTime = a.计划装柜时间
      ? new Date(a.计划装柜时间).getTime()
      : Number.POSITIVE_INFINITY
    const bTime = b.计划装柜时间
      ? new Date(b.计划装柜时间).getTime()
      : Number.POSITIVE_INFINITY
    if (aTime !== bTime) return aTime - bTime
    return new Date(a.创建时间).getTime() - new Date(b.创建时间).getTime()
  })
}

export function paginateOutboundOrders<T>(
  orders: T[],
  page: number,
  pageSize: number,
) {
  const total = orders.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    items: orders.slice(start, start + pageSize),
    total,
    totalPages,
    currentPage,
  }
}

export function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

export function mapProTableParamsToOutboundFilters(
  params: Record<string, unknown>,
): OutboundOrderFilters {
  return {
    运单号: String(params.运单号 ?? ''),
    计划单号: String(params.计划单号 ?? ''),
    出库类型: (params.出库类型 as OutboundOrderFilters['出库类型']) ?? '',
  }
}
