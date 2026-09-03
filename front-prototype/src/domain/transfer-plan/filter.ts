import type { TransferPlanTabKey } from '@/domain/transfer-plan/constants'
import type {
  TransferPlan,
  TransferPlanFilters,
  TransferPlanLine,
} from '@/domain/transfer-plan/types'

export function sumTransferPlanLines(lines: TransferPlanLine[]) {
  return lines.reduce(
    (acc, line) => ({
      箱数: acc.箱数 + line.箱数,
      重量: acc.重量 + line.重量,
      体积: acc.体积 + line.体积,
    }),
    { 箱数: 0, 重量: 0, 体积: 0 },
  )
}

function matchExact(fieldValue: string, query: string) {
  if (!query.trim()) return true
  return fieldValue === query.trim()
}

function matchMultiSelect(fieldValue: string, selected: string[]) {
  if (selected.length === 0) return true
  return selected.includes(fieldValue)
}

export function applyTransferPlanFilters(
  plans: TransferPlan[],
  filters: TransferPlanFilters,
) {
  return plans.filter((plan) => {
    if (!matchExact(plan.调拨计划单号, filters.调拨计划单号)) return false
    if (filters.运单号.trim()) {
      const waybill = filters.运单号.trim()
      if (!plan.明细.some((line) => line.运单号 === waybill)) return false
    }
    if (!matchMultiSelect(plan.调出仓库, filters.调出仓库)) return false
    if (!matchMultiSelect(plan.调入仓库, filters.调入仓库)) return false
    return true
  })
}

export function applyTransferPlanTabFilter(
  plans: TransferPlan[],
  tab: TransferPlanTabKey,
) {
  if (tab === '全部') return plans
  return plans.filter((plan) => plan.状态 === tab)
}

export function countByTransferPlanTab(
  plans: TransferPlan[],
): Record<TransferPlanTabKey, number> {
  const counts = {
    全部: plans.length,
    待出库: 0,
    已下架: 0,
    已复核: 0,
    已出库: 0,
    已完成: 0,
    已取消: 0,
  } satisfies Record<TransferPlanTabKey, number>

  for (const plan of plans) {
    counts[plan.状态] += 1
  }

  return counts
}

export function sortTransferPlans(plans: TransferPlan[]) {
  return [...plans].sort(
    (a, b) =>
      new Date(a.创建时间).getTime() - new Date(b.创建时间).getTime(),
  )
}

export function paginateTransferPlans<T>(
  items: T[],
  page: number,
  pageSize: number,
) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    currentPage,
  }
}

export function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

export function mapProTableParamsToTransferFilters(
  params: Record<string, unknown>,
): TransferPlanFilters {
  const toArray = (value: unknown) =>
    Array.isArray(value) ? (value as string[]) : value ? [String(value)] : []

  return {
    调拨计划单号: String(params.调拨计划单号 ?? ''),
    运单号: String(params.运单号 ?? ''),
    调出仓库: toArray(params.调出仓库),
    调入仓库: toArray(params.调入仓库),
  }
}
