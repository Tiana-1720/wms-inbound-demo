import type {
  TransferLoadDriverInfo,
  TransferLoadLine,
  TransferLoadPlan,
} from '@/domain/pda-transfer-load/types'
import { TRANSFER_PLAN_LOADABLE_STATUSES } from '@/domain/transfer-plan/constants'
import {
  isWaybillLoadable,
  occupyWaybills,
} from '@/domain/pda-transfer-load/inventory'

export type LoadableWaybill = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
  目的仓: string
  已上架: boolean
  箱号列表: string[]
}

const loadableWaybills: LoadableWaybill[] = [
  {
    运单号: 'DSL26010128343',
    客户代码: 'CUST001',
    箱数: 30,
    重量: 125.5,
    体积: 1.25,
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000001'],
  },
  {
    运单号: 'DSL26010128344',
    客户代码: 'CUST002',
    箱数: 30,
    重量: 118.0,
    体积: 1.1,
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000401'],
  },
  {
    运单号: 'DSL26010128345',
    客户代码: 'CUST003',
    箱数: 20,
    重量: 80.0,
    体积: 0.8,
    目的仓: 'DS-OTHER-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000501'],
  },
  {
    运单号: 'DSL26010128346',
    客户代码: 'CUST004',
    箱数: 15,
    重量: 60.0,
    体积: 0.6,
    目的仓: 'DS-JH-01',
    已上架: false,
    箱号列表: ['FBA1988W5Y0GU000601'],
  },
]

const plans: TransferLoadPlan[] = [
  {
    调拨计划单号: 'AT26010100001',
    调出仓库: 'NC-LS-01',
    调入仓库: 'DS-JH-01',
    状态: '待出库',
    出库单状态: '未生成',
    汇总箱数: 0,
    汇总重量: 0,
    汇总体积: 0,
    明细: [],
  },
  {
    调拨计划单号: 'AT26010100002',
    调出仓库: 'NC-LS-01',
    调入仓库: 'DS-JH-01',
    状态: '已出库',
    出库单状态: '已出库',
    汇总箱数: 60,
    汇总重量: 243.5,
    汇总体积: 2.35,
    明细: [
      {
        运单号: 'DSL26010128343',
        客户代码: 'CUST001',
        箱数: 30,
        重量: 125.5,
        体积: 1.25,
      },
      {
        运单号: 'DSL26010128344',
        客户代码: 'CUST002',
        箱数: 30,
        重量: 118.0,
        体积: 1.1,
      },
    ],
  },
  {
    调拨计划单号: 'AT26010100003',
    调出仓库: 'NC-LS-01',
    调入仓库: 'DS-JH-01',
    状态: '待出库',
    出库单状态: '未生成',
    汇总箱数: 0,
    汇总重量: 0,
    汇总体积: 0,
    明细: [],
  },
]

// 已装车/已出库计划：初始化占用状态
for (const plan of plans) {
  if (plan.状态 === '已出库' || plan.出库单状态 === '已复核') {
    occupyWaybills(
      plan.调拨计划单号,
      plan.明细.map((item) => item.运单号),
    )
  }
}

const scanSessions = new Map<string, TransferLoadLine[]>()
const driverSessions = new Map<string, TransferLoadDriverInfo>()

const emptyDriver = (): TransferLoadDriverInfo => ({
  司机: '',
  电话: '',
  车牌号: '',
})

function recalcSummary(plan: TransferLoadPlan) {
  const lines = scanSessions.get(plan.调拨计划单号) ?? plan.明细
  plan.明细 = lines
  plan.汇总箱数 = lines.reduce((sum, item) => sum + item.箱数, 0)
  plan.汇总重量 = lines.reduce((sum, item) => sum + item.重量, 0)
  plan.汇总体积 = lines.reduce((sum, item) => sum + item.体积, 0)
}

export function listPendingLoadPlans() {
  return plans.filter(
    (item) =>
      item.状态 === '待出库' &&
      item.出库单状态 !== '已复核' &&
      item.出库单状态 !== '已出库',
  )
}

export function getLoadPlan(planNo: string) {
  return plans.find((item) => item.调拨计划单号 === planNo) ?? null
}

export function getLoadSession(planNo: string) {
  const plan = getLoadPlan(planNo)
  if (!plan) return []
  if (!scanSessions.has(planNo)) {
    scanSessions.set(planNo, [...plan.明细])
  }
  return scanSessions.get(planNo)!
}

export function resetLoadSession(planNo: string) {
  scanSessions.set(planNo, [])
  const plan = getLoadPlan(planNo)
  if (plan) recalcSummary(plan)
}

export type LoadScanLookup =
  | { kind: 'missing' }
  | { kind: 'notOnShelf' }
  | { kind: 'occupied' }
  | { kind: 'destMismatch' }
  | { kind: 'duplicate' }
  | { kind: 'hit'; line: TransferLoadLine }

export function scanLoadBox(
  planNo: string,
  raw: string,
): LoadScanLookup {
  const plan = getLoadPlan(planNo)
  if (!plan) return { kind: 'missing' }

  const boxNo = raw.trim().toUpperCase()
  const waybill = loadableWaybills.find((item) =>
    item.箱号列表.includes(boxNo),
  )
  if (!waybill) return { kind: 'missing' }

  if (!waybill.已上架) return { kind: 'notOnShelf' }
  if (!isWaybillLoadable(waybill.运单号, planNo)) {
    return { kind: 'occupied' }
  }
  if (waybill.目的仓 !== plan.调入仓库) return { kind: 'destMismatch' }

  const session = getLoadSession(planNo)
  if (session.some((item) => item.运单号 === waybill.运单号)) {
    return { kind: 'duplicate' }
  }

  const line: TransferLoadLine = {
    运单号: waybill.运单号,
    客户代码: waybill.客户代码,
    箱数: waybill.箱数,
    重量: waybill.重量,
    体积: waybill.体积,
  }
  session.push(line)
  recalcSummary(plan)
  return { kind: 'hit', line }
}

export function getLoadDriverInfo(planNo: string): TransferLoadDriverInfo {
  return driverSessions.get(planNo) ?? emptyDriver()
}

export function setLoadDriverInfo(
  planNo: string,
  patch: Partial<TransferLoadDriverInfo>,
) {
  const current = getLoadDriverInfo(planNo)
  driverSessions.set(planNo, { ...current, ...patch })
}

export function isLoadDriverReady(info: TransferLoadDriverInfo) {
  return Boolean(info.司机.trim() && info.电话.trim() && info.车牌号.trim())
}

export function removeLoadLine(planNo: string, 运单号: string) {
  const session = getLoadSession(planNo)
  const next = session.filter((item) => item.运单号 !== 运单号)
  scanSessions.set(planNo, next)
  const plan = getLoadPlan(planNo)
  if (plan) recalcSummary(plan)
}

export function confirmDispatch(planNo: string) {
  const plan = getLoadPlan(planNo)
  if (
    !plan ||
    !TRANSFER_PLAN_LOADABLE_STATUSES.includes(plan.状态) ||
    plan.出库单状态 === '已出库'
  ) {
    return false
  }

  if (!isLoadDriverReady(getLoadDriverInfo(planNo))) return false

  const session = getLoadSession(planNo)
  if (session.length === 0) return false

  const merged = new Map(plan.明细.map((item) => [item.运单号, item]))
  for (const line of session) {
    merged.set(line.运单号, line)
  }
  plan.明细 = [...merged.values()]
  plan.状态 = '待出库'
  plan.出库单状态 = '已复核'
  occupyWaybills(
    planNo,
    plan.明细.map((item) => item.运单号),
  )
  recalcSummary(plan)
  scanSessions.set(planNo, [...plan.明细])
  return true
}

export function getLoadableWaybill(运单号: string) {
  return loadableWaybills.find((item) => item.运单号 === 运单号)
}
