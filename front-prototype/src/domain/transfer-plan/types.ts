import type { TransferPlanStatus } from '@/domain/transfer-plan/constants'

/** 调拨计划明细行（字段清单 §二；一行为一个实装运单） */
export type TransferPlanLine = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
}

/** 详情页操作日志（主 PRD §2 / Demo §3.8） */
export type TransferPlanLog = {
  操作内容: string
  操作时间: string
  操作人: string
}

/** 调拨计划单（字段清单 §一～§四） */
export type TransferPlan = {
  调拨计划单号: string
  调出仓库: string
  调入仓库: string
  状态: TransferPlanStatus
  箱数: number
  重量: number
  体积: number
  创建人: string
  创建时间: string
  最后修改人: string
  最后修改时间: string
  明细: TransferPlanLine[]
  操作日志: TransferPlanLog[]
}

/** 列表查询区（Demo PRD §1.3；状态仅通过 Tab 过滤，不进查询区） */
export type TransferPlanFilters = {
  调拨计划单号: string
  运单号: string
  调出仓库: string[]
  调入仓库: string[]
}

export const EMPTY_TRANSFER_PLAN_FILTERS: TransferPlanFilters = {
  调拨计划单号: '',
  运单号: '',
  调出仓库: [],
  调入仓库: [],
}
