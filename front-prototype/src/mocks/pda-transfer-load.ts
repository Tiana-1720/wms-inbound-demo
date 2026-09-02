import type {
  TransferLoadLine,
  TransferLoadPlan,
} from '@/domain/pda-transfer-load/types'

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
]

const scanSessions = new Map<string, TransferLoadLine[]>()

function recalcSummary(plan: TransferLoadPlan) {
  const lines = scanSessions.get(plan.调拨计划单号) ?? plan.明细
  plan.明细 = lines
  plan.汇总箱数 = lines.reduce((sum, item) => sum + item.箱数, 0)
  plan.汇总重量 = lines.reduce((sum, item) => sum + item.重量, 0)
  plan.汇总体积 = lines.reduce((sum, item) => sum + item.体积, 0)
}

export function listPendingLoadPlans() {
  return plans.filter((item) => item.状态 === '待出库')
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

export function removeLoadLine(planNo: string, 运单号: string) {
  const session = getLoadSession(planNo)
  const next = session.filter((item) => item.运单号 !== 运单号)
  scanSessions.set(planNo, next)
  const plan = getLoadPlan(planNo)
  if (plan) recalcSummary(plan)
}

export function confirmDispatch(planNo: string) {
  const plan = getLoadPlan(planNo)
  if (!plan || plan.状态 !== '待出库') return false
  plan.状态 = '已出库'
  return true
}

export function getLoadableWaybill(运单号: string) {
  return loadableWaybills.find((item) => item.运单号 === 运单号)
}
