import type {
  TransferLoadDriverInfo,
  TransferLoadLine,
  TransferLoadPlan,
} from '@/domain/pda-transfer-load/types'
import { TRANSFER_PLAN_LOADABLE_STATUSES } from '@/domain/transfer-plan/constants'
import { releaseOccupiedByPlan, getOccupyingPlanForBox, occupyBoxes, occupyWaybills } from '@/domain/pda-transfer-load/inventory'

type LoadableWaybillOnPallet = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
}

type LoadablePallet = {
  托号: string
  目的仓: string
  已上架: boolean
  箱号列表: string[]
  运单列表: LoadableWaybillOnPallet[]
}

const loadablePallets: LoadablePallet[] = [
  {
    托号: 'PL25010100001',
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000001'],
    运单列表: [
      {
        运单号: 'DSL26010128343',
        客户代码: 'CUST001',
        箱数: 30,
        重量: 125.5,
        体积: 1.25,
      },
    ],
  },
  {
    托号: 'PL25010100005',
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000002'],
    运单列表: [
      {
        运单号: 'DSL26010128343',
        客户代码: 'CUST001',
        箱数: 30,
        重量: 125.5,
        体积: 1.25,
      },
    ],
  },
  {
    托号: 'PL25010100002',
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000401'],
    运单列表: [
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
    托号: 'PL25010100020',
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: [
      'FBA1988W5Y0GU000381',
      'FBA1988W5Y0GU000389',
      'FBA1988W5Y0GU000394',
    ],
    运单列表: [
      {
        运单号: 'DSL26010128302',
        客户代码: 'CUST005',
        箱数: 8,
        重量: 32.0,
        体积: 0.32,
      },
      {
        运单号: 'DSL26010128303',
        客户代码: 'CUST006',
        箱数: 5,
        重量: 20.0,
        体积: 0.2,
      },
      {
        运单号: 'DSL26010128304',
        客户代码: 'CUST007',
        箱数: 6,
        重量: 24.0,
        体积: 0.24,
      },
    ],
  },
  {
    托号: 'PL25010100004',
    目的仓: 'DS-JH-01',
    已上架: false,
    箱号列表: ['FBA1988W5Y0GU000601'],
    运单列表: [
      {
        运单号: 'DSL26010128346',
        客户代码: 'CUST004',
        箱数: 15,
        重量: 60.0,
        体积: 0.6,
      },
    ],
  },
  {
    托号: 'PL25010100021',
    目的仓: 'DS-JH-01',
    已上架: true,
    箱号列表: ['FBA1988W5Y0GU000701', 'FBA1988W5Y0GU000702'],
    运单列表: [
      {
        运单号: 'DSL26010128399',
        客户代码: 'CUST008',
        箱数: 2,
        重量: 8.0,
        体积: 0.08,
      },
    ],
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
        托号: 'PL25010100001',
      },
      {
        运单号: 'DSL26010128344',
        客户代码: 'CUST002',
        箱数: 30,
        重量: 118.0,
        体积: 1.1,
        托号: 'PL25010100002',
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

function clonePlan(plan: TransferLoadPlan): TransferLoadPlan {
  return {
    ...plan,
    明细: plan.明细.map((item) => ({ ...item })),
  }
}

/** 原型初始快照：刷新页面时用于恢复演示数据（装车提交后不回滚） */
const initialPlanSnapshots = new Map(
  plans.map((plan) => [plan.调拨计划单号, clonePlan(plan)]),
)

const scanSessions = new Map<string, TransferLoadLine[]>()
const driverSessions = new Map<string, TransferLoadDriverInfo>()

const LOAD_SESSION_STORAGE_PREFIX = 'wms-prototype-load-session:'

function readStoredSession(planNo: string): TransferLoadLine[] | null {
  try {
    const raw = sessionStorage.getItem(LOAD_SESSION_STORAGE_PREFIX + planNo)
    if (!raw) return null
    return JSON.parse(raw) as TransferLoadLine[]
  } catch {
    return null
  }
}

function writeStoredSession(planNo: string, lines: TransferLoadLine[]) {
  sessionStorage.setItem(
    LOAD_SESSION_STORAGE_PREFIX + planNo,
    JSON.stringify(lines),
  )
}

function clearStoredSession(planNo: string) {
  sessionStorage.removeItem(LOAD_SESSION_STORAGE_PREFIX + planNo)
}

function commitSession(planNo: string, lines: TransferLoadLine[]) {
  scanSessions.set(planNo, lines)
  writeStoredSession(planNo, lines)
  const plan = getLoadPlan(planNo)
  if (plan) recalcSummary(plan)
}

const emptyDriver = (): TransferLoadDriverInfo => ({
  司机: '',
  电话: '',
  车牌号: '',
})

function findPalletByBox(boxNo: string) {
  return loadablePallets.find((item) => item.箱号列表.includes(boxNo)) ?? null
}

function getPalletIdsForWaybill(运单号: string) {
  return loadablePallets
    .filter((item) => item.运单列表.some((waybill) => waybill.运单号 === 运单号))
    .map((item) => item.托号)
}

function getScannedPalletIds(session: TransferLoadLine[]) {
  const ids = new Set<string>()
  for (const line of session) {
    for (const part of line.托号.split(',')) {
      const id = part.trim()
      if (id) ids.add(id)
    }
  }
  return ids
}

function mergeLoadLine(
  existing: TransferLoadLine,
  incoming: TransferLoadLine,
): TransferLoadLine {
  const palletIds = [
    ...new Set(
      [...existing.托号.split(','), ...incoming.托号.split(',')]
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  ]
  return {
    ...existing,
    箱数: existing.箱数 + incoming.箱数,
    重量: existing.重量 + incoming.重量,
    体积: existing.体积 + incoming.体积,
    托号: palletIds.join(','),
  }
}

function appendScanLines(
  session: TransferLoadLine[],
  newLines: TransferLoadLine[],
) {
  const next = session.map((line) => ({ ...line }))
  for (const line of newLines) {
    const idx = next.findIndex((item) => item.运单号 === line.运单号)
    if (idx >= 0) {
      next[idx] = mergeLoadLine(next[idx], line)
    } else {
      next.push(line)
    }
  }
  return next
}

function getInProgressWaybills(session: TransferLoadLine[]) {
  const scannedPalletIds = getScannedPalletIds(session)
  const waybillNos = new Set(session.map((item) => item.运单号))

  return [...waybillNos].filter((运单号) => {
    const palletIds = getPalletIdsForWaybill(运单号)
    const scannedCount = palletIds.filter((id) => scannedPalletIds.has(id)).length
    return scannedCount > 0 && scannedCount < palletIds.length
  })
}

function findUnavailableBoxOnPallet(pallet: LoadablePallet, planNo: string) {
  for (const boxNo of pallet.箱号列表) {
    const occupier = getOccupyingPlanForBox(boxNo)
    if (occupier && occupier !== planNo) {
      return { boxNo, occupier }
    }
  }
  return null
}

function toLoadLine(
  pallet: LoadablePallet,
  waybill: LoadableWaybillOnPallet,
): TransferLoadLine {
  return {
    运单号: waybill.运单号,
    客户代码: waybill.客户代码,
    箱数: waybill.箱数,
    重量: waybill.重量,
    体积: waybill.体积,
    托号: pallet.托号,
  }
}

function recalcSummary(plan: TransferLoadPlan) {
  const lines = scanSessions.get(plan.调拨计划单号) ?? plan.明细
  plan.明细 = lines
  plan.汇总箱数 = lines.reduce((sum, item) => sum + item.箱数, 0)
  plan.汇总重量 = lines.reduce((sum, item) => sum + item.重量, 0)
  plan.汇总体积 = lines.reduce((sum, item) => sum + item.体积, 0)
}

export function getLoadScanStats(planNo: string) {
  const lines = getLoadSession(planNo)
  const 票数 = lines.length
  const 托数 = getScannedPalletIds(lines).size
  return { 票数, 托数 }
}

/** 将调拨计划恢复为原型初始数据，并清空本次装车会话 */
export function resetLoadPlanDemo(planNo: string) {
  const snapshot = initialPlanSnapshots.get(planNo)
  const plan = getLoadPlan(planNo)
  if (!snapshot || !plan) return

  const restored = clonePlan(snapshot)
  plan.状态 = restored.状态
  plan.出库单状态 = restored.出库单状态
  plan.汇总箱数 = restored.汇总箱数
  plan.汇总重量 = restored.汇总重量
  plan.汇总体积 = restored.汇总体积
  plan.明细 = restored.明细

  releaseOccupiedByPlan(planNo)
  scanSessions.delete(planNo)
  clearStoredSession(planNo)
  driverSessions.delete(planNo)
}

export function listPendingLoadPlans() {
  return plans.filter((item) => item.出库单状态 !== '已出库')
}

export function getLoadPlan(planNo: string) {
  return plans.find((item) => item.调拨计划单号 === planNo) ?? null
}

export function getLoadSession(planNo: string) {
  const plan = getLoadPlan(planNo)
  if (!plan) return []

  if (!scanSessions.has(planNo)) {
    const stored = readStoredSession(planNo)
    if (stored) {
      scanSessions.set(planNo, stored)
      plan.明细 = stored.map((item) => ({ ...item }))
      recalcSummary(plan)
    } else if (plan.明细.length > 0) {
      scanSessions.set(planNo, plan.明细.map((item) => ({ ...item })))
    } else {
      scanSessions.set(planNo, [])
    }
  }

  return scanSessions.get(planNo)!
}

export type LoadScanLookup =
  | { kind: 'missing' }
  | { kind: 'notOnShelf' }
  | { kind: 'boxOccupied'; boxNo: string; occupier: string }
  | { kind: 'duplicate' }
  | { kind: 'incompleteWaybill' }
  | { kind: 'hit'; lines: TransferLoadLine[] }

export function scanLoadBox(
  planNo: string,
  raw: string,
): LoadScanLookup {
  const plan = getLoadPlan(planNo)
  if (!plan) return { kind: 'missing' }

  const boxNo = raw.trim().toUpperCase()
  const pallet = findPalletByBox(boxNo)
  if (!pallet) return { kind: 'missing' }

  if (!pallet.已上架) return { kind: 'notOnShelf' }

  const unavailable = findUnavailableBoxOnPallet(pallet, planNo)
  if (unavailable) {
    return { kind: 'boxOccupied', ...unavailable }
  }

  const session = getLoadSession(planNo)
  if (getScannedPalletIds(session).has(pallet.托号)) {
    return { kind: 'duplicate' }
  }

  const scanningWaybills = new Set(pallet.运单列表.map((waybill) => waybill.运单号))
  const inProgressWaybills = getInProgressWaybills(session)
  if (inProgressWaybills.some((运单号) => !scanningWaybills.has(运单号))) {
    return { kind: 'incompleteWaybill' }
  }

  const lines = pallet.运单列表.map((waybill) => toLoadLine(pallet, waybill))
  commitSession(planNo, appendScanLines(session, lines))
  return { kind: 'hit', lines }
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

function collectBoxNosForSession(session: TransferLoadLine[]) {
  const palletIds = getScannedPalletIds(session)
  const boxNos: string[] = []
  for (const pallet of loadablePallets) {
    if (palletIds.has(pallet.托号)) {
      boxNos.push(...pallet.箱号列表)
    }
  }
  return boxNos
}

/** 移除整托（混托时同托多票一并移除，不拆票）；多托同票时移除该运单全部已扫托 */
export function removeLoadLine(planNo: string, 运单号: string) {
  const session = getLoadSession(planNo)
  const target = session.find((item) => item.运单号 === 运单号)
  if (!target) return
  const palletIds = new Set(
    target.托号
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  )
  const next = session.filter((item) => {
    const itemPalletIds = item.托号
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    return !itemPalletIds.some((id) => palletIds.has(id))
  })
  commitSession(planNo, next)
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

  plan.明细 = session.map((item) => ({ ...item }))
  recalcSummary(plan)
  plan.状态 = '已复核'
  plan.出库单状态 = '已复核'

  occupyBoxes(planNo, collectBoxNosForSession(session))
  occupyWaybills(
    planNo,
    session.map((item) => item.运单号),
  )

  scanSessions.delete(planNo)
  clearStoredSession(planNo)
  return true
}

export function getLoadableWaybill(运单号: string) {
  for (const pallet of loadablePallets) {
    const waybill = pallet.运单列表.find((item) => item.运单号 === 运单号)
    if (waybill) {
      return {
        ...waybill,
        目的仓: pallet.目的仓,
        已上架: pallet.已上架,
        箱号列表: pallet.箱号列表,
      }
    }
  }
  return undefined
}
