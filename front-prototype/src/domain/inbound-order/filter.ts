import { INBOUND_TYPE_REGULAR } from '@/domain/inbound-order/constants'
import type { StatusTabKey } from '@/domain/inbound-order/constants'
import type { InboundOrder, InboundOrderFilters } from '@/domain/inbound-order/types'

function parseBatchValues(value: string) {
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

function matchFuzzy(fieldValue: string | null, query: string) {
  if (!query.trim()) return true
  if (!fieldValue) return false
  return fieldValue.toLowerCase().includes(query.trim().toLowerCase())
}

function matchMultiSelect(fieldValue: string | null, selected: string[]) {
  if (selected.length === 0) return true
  if (!fieldValue) return false
  return selected.some((item) => fieldValue.includes(item))
}

function matchDateRange(
  fieldValue: string | null,
  start: string,
  end: string,
) {
  if (!start && !end) return true
  if (!fieldValue) return false
  const datePart = fieldValue.slice(0, 10)
  if (start && datePart < start) return false
  if (end && datePart > end) return false
  return true
}

export function applyInboundOrderFilters(
  orders: InboundOrder[],
  filters: InboundOrderFilters,
) {
  return orders.filter((order) => {
    if (order.入库类型 !== INBOUND_TYPE_REGULAR) return false
    if (!matchBatchExact(order.运单号, filters.运单号)) return false
    if (!matchBatchExact(order.参考号 ?? '', filters.参考号)) return false
    if (!matchBatchExact(order.收货单号, filters.收货单号)) return false
    if (!matchFuzzy(order.客户代码, filters.客户代码)) return false
    if (!matchFuzzy(order.渠道, filters.渠道)) return false
    if (!matchMultiSelect(order.收货仓库, filters.收货仓库)) return false
    if (
      filters.目的国.length > 0 &&
      !filters.目的国.includes(order.目的国)
    ) {
      return false
    }
    if (filters.业务类型 && order.业务类型 !== filters.业务类型) return false
    if (filters.业务归属 && order.业务归属 !== filters.业务归属) return false
    if (filters.运输类型 && order.运输类型 !== filters.运输类型) return false
    if (
      !matchDateRange(
        order.预计到仓时间,
        filters.预计到仓时间起,
        filters.预计到仓时间止,
      )
    ) {
      return false
    }
    if (
      !matchDateRange(order.收货时间, filters.收货时间起, filters.收货时间止)
    ) {
      return false
    }
    return true
  })
}

export function applyStatusTabFilter(orders: InboundOrder[], tab: StatusTabKey) {
  if (tab === '全部') return orders
  if (tab === '异常') return orders.filter((order) => Boolean(order.异常类型))
  return orders.filter((order) => order.状态 === tab)
}

export function countByStatusTab(
  orders: InboundOrder[],
): Record<StatusTabKey, number> {
  const counts = {
    全部: orders.length,
    待收货: 0,
    收货中: 0,
    已收货: 0,
    已绑托: 0,
    已上架: 0,
    已取消: 0,
    异常: 0,
  } satisfies Record<StatusTabKey, number>

  for (const order of orders) {
    counts[order.状态] += 1
    if (order.异常类型) counts.异常 += 1
  }

  return counts
}

export function sortInboundOrders(orders: InboundOrder[]) {
  return [...orders].sort(
    (a, b) =>
      new Date(a.创建时间).getTime() - new Date(b.创建时间).getTime(),
  )
}

export function paginateInboundOrders<T>(
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

export function displayNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return '-'
  return String(value)
}

export function mapProTableParamsToFilters(
  params: Record<string, unknown>,
): InboundOrderFilters {
  const toArray = (value: unknown) =>
    Array.isArray(value) ? (value as string[]) : value ? [String(value)] : []

  return {
    运单号: String(params.运单号 ?? ''),
    参考号: String(params.参考号 ?? ''),
    收货单号: String(params.收货单号 ?? ''),
    客户代码: String(params.客户代码 ?? ''),
    渠道: String(params.渠道 ?? ''),
    收货仓库: toArray(params.收货仓库),
    目的国: toArray(params.目的国),
    业务类型: (params.业务类型 as InboundOrderFilters['业务类型']) ?? '',
    业务归属: (params.业务归属 as InboundOrderFilters['业务归属']) ?? '',
    运输类型: (params.运输类型 as InboundOrderFilters['运输类型']) ?? '',
    预计到仓时间起: String(params.预计到仓时间起 ?? ''),
    预计到仓时间止: String(params.预计到仓时间止 ?? ''),
    收货时间起: String(params.收货时间起 ?? ''),
    收货时间止: String(params.收货时间止 ?? ''),
  }
}
