import type { TransferPlanStatus } from '@/domain/transfer-plan/constants'

export type TransferLoadDriverInfo = {
  司机: string
  电话: string
  车牌号: string
}

export type OutboundOrderStatus = '未生成' | '已复核' | '已出库'

export type TransferLoadPlanStatus = TransferPlanStatus

export type TransferLoadLine = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
  /** 装车扫描按托关联；小票混托时多票共一托 */
  托号: string
}

export type TransferLoadPlan = {
  调拨计划单号: string
  调出仓库: string
  调入仓库: string
  状态: TransferLoadPlanStatus
  出库单状态: OutboundOrderStatus
  汇总箱数: number
  汇总重量: number
  汇总体积: number
  明细: TransferLoadLine[]
}
