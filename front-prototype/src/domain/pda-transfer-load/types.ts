export type TransferLoadPlanStatus = '待出库' | '已出库' | '已完成' | '已取消'

export type TransferLoadLine = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
}

export type TransferLoadPlan = {
  调拨计划单号: string
  调出仓库: string
  调入仓库: string
  状态: TransferLoadPlanStatus
  汇总箱数: number
  汇总重量: number
  汇总体积: number
  明细: TransferLoadLine[]
}
