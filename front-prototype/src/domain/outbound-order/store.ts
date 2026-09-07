import { CURRENT_OPERATOR } from '@/domain/outbound-order/constants'
import { parseBatchValues } from '@/domain/outbound-order/filter'
import type {
  CandidateWaybill,
  OutboundDetailLine,
  OutboundOrder,
  OutboundOrderLine,
} from '@/domain/outbound-order/types'
import {
  candidateWaybillPool,
  outboundOrderMockData,
} from '@/mocks/outbound-orders'
import {
  confirmTransferPlanOutbound,
  getTransferPlan,
  printTransferPlanContainerList,
} from '@/domain/transfer-plan/store'

function normalizeLines(明细: OutboundOrderLine[] | undefined) {
  return (明细 ?? []).filter(
    (line): line is OutboundOrderLine => Boolean(line?.运单号),
  )
}

function normalizeOrder(order: OutboundOrder): OutboundOrder {
  const 明细 = normalizeLines(order.明细)
  return {
    ...order,
    明细,
    运单号列表: 明细.map((line) => line.运单号),
  }
}

let orders: OutboundOrder[] = outboundOrderMockData.map((order) =>
  normalizeOrder({ ...order, 明细: [...order.明细] }),
)

function nowText() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function touchOrder(order: OutboundOrder, 操作人 = CURRENT_OPERATOR) {
  const updatedAt = nowText()
  order.最后修改人 = 操作人
  order.最后修改时间 = updatedAt
}

function getOrderLines(order: OutboundOrder) {
  return normalizeLines(order.明细)
}

export function listOutboundOrders() {
  return orders
}

export function getOutboundOrder(outboundNo: string) {
  const order = orders.find((item) => item.出库单号 === outboundNo)
  return order ? normalizeOrder(order) : undefined
}

/** PC 打印装柜单（不变库存，Demo PRD §1.5） */
export function printOutboundContainerList(outboundNo: string) {
  const order = getOutboundOrder(outboundNo)
  if (!order) return 'not-found' as const
  if (order.状态 !== '已复核') return 'bad-status' as const

  order.装柜单已打印 = true
  touchOrder(order)

  const plan = order.调拨计划单号
    ? getTransferPlan(order.调拨计划单号)
    : undefined
  if (plan?.状态 === '已复核') {
    printTransferPlanContainerList(order.调拨计划单号!)
  }

  return 'ok' as const
}

/** PC 确认出库（须先打印装柜单，Demo PRD §1.6） */
export function confirmOutboundOrder(outboundNo: string) {
  const order = getOutboundOrder(outboundNo)
  if (!order) return 'not-found' as const
  if (order.状态 !== '已复核') return 'bad-status' as const
  if (!order.装柜单已打印) return 'not-printed' as const

  order.状态 = '已出库'
  touchOrder(order)

  const plan = order.调拨计划单号
    ? getTransferPlan(order.调拨计划单号)
    : undefined
  if (plan?.状态 === '已复核') {
    confirmTransferPlanOutbound(order.调拨计划单号!)
  }

  return 'ok' as const
}

function isWaybillLinked(运单号: string, excludeOutboundNo?: string) {
  return orders.some((order) => {
    if (order.出库单号 === excludeOutboundNo) return false
    return getOrderLines(order).some((line) => line.运单号 === 运单号)
  })
}

function lineToCandidate(
  line: OutboundOrderLine,
  收货仓库: string,
): CandidateWaybill {
  return {
    运单号: line.运单号,
    客户代码: line.客户代码,
    收货仓库,
    箱数: line.箱数,
    重量: line.重量,
    体积: line.体积,
    可关联: true,
  }
}

function candidateToDetailLine(
  candidate: CandidateWaybill | OutboundOrderLine,
): OutboundDetailLine {
  return {
    运单号: candidate.运单号,
    客户代码: candidate.客户代码,
    箱数: candidate.箱数,
    重量: candidate.重量,
    体积: candidate.体积,
    装柜顺序: '装柜顺序' in candidate ? candidate.装柜顺序 : null,
    出库渠道: '出库渠道' in candidate ? candidate.出库渠道 : null,
    品名: '品名' in candidate ? candidate.品名 : null,
    客户备注: '客户备注' in candidate ? candidate.客户备注 : null,
    内部备注: '内部备注' in candidate ? candidate.内部备注 : null,
    目的仓库: '目的仓库' in candidate ? candidate.目的仓库 : null,
    目的邮编: '目的邮编' in candidate ? candidate.目的邮编 : null,
    预计到仓时间:
      '预计到仓时间' in candidate ? candidate.预计到仓时间 : null,
    状态: '状态' in candidate ? candidate.状态 : '已上架',
  }
}

function findCandidateMeta(运单号: string) {
  return candidateWaybillPool.find((item) => item.运单号 === 运单号)
}

/** 出库详情/关联运单明细（对齐现网出库明细 Tab） */
export function listOutboundDetailLines(outboundNo: string): OutboundDetailLine[] {
  const order = getOutboundOrder(outboundNo)
  if (!order) return []

  return getOrderLines(order).map((line) => {
    const meta = findCandidateMeta(line.运单号)
    return candidateToDetailLine(meta ?? line)
  })
}

/** 可选运单列表（同仓、已上架库存 Mock + 本单已关联运单） */
export function listCandidateWaybills(
  outboundNo: string,
  运单号 = '',
): CandidateWaybill[] {
  const order = getOutboundOrder(outboundNo)
  if (!order) return []

  const currentWarehouse = order.归属仓库
  const savedLines = getOrderLines(order)
  const savedKeys = new Set(savedLines.map((line) => line.运单号))

  const matchesWaybillQuery = (waybillNo: string) => {
    const values = parseBatchValues(运单号)
    if (values.length === 0) return true
    const lower = waybillNo.toLowerCase()
    return values.some((value) => lower === value.toLowerCase())
  }

  const fromPool = candidateWaybillPool
    .filter((item) => item?.运单号)
    .filter((item) => item.收货仓库 === currentWarehouse)
    .filter((item) => {
      if (!matchesWaybillQuery(item.运单号)) {
        return false
      }
      const linkedElsewhere = isWaybillLinked(item.运单号, outboundNo)
      return savedKeys.has(item.运单号) || !linkedElsewhere
    })
    .map((item) => {
      if (savedKeys.has(item.运单号)) {
        return { ...item, 可关联: true }
      }
      const occupied = isWaybillLinked(item.运单号, outboundNo)
      return {
        ...item,
        可关联: !occupied && item.可关联,
        占用方: occupied ? item.占用方 : undefined,
      }
    })

  const poolKeys = new Set(fromPool.map((item) => item.运单号))
  const fromSaved = savedLines
    .filter((line) => !poolKeys.has(line.运单号))
    .filter((line) => matchesWaybillQuery(line.运单号))
    .map((line) => lineToCandidate(line, currentWarehouse))

  return [...fromSaved, ...fromPool]
}

/** 关联运单页预览明细（历史已保存 + 本次待保存） */
export function mergeOutboundDetailPreview(
  outboundNo: string,
  pendingCandidates: CandidateWaybill[],
): OutboundDetailLine[] {
  const order = getOutboundOrder(outboundNo)
  if (!order) return []

  const saved = getOrderLines(order)
  const savedKeys = new Set(saved.map((line) => line.运单号))
  const pending = pendingCandidates.filter(
    (item) => item?.运单号 && !savedKeys.has(item.运单号),
  )

  return [
    ...saved.map((line) =>
      candidateToDetailLine(findCandidateMeta(line.运单号) ?? line),
    ),
    ...pending.map((item) => candidateToDetailLine(item)),
  ]
}

/** PC 关联运单保存（不变更出库单状态，Demo PRD §2.6） */
export function saveOutboundWaybillLinks(
  outboundNo: string,
  newWaybillNos: string[],
) {
  const order = getOutboundOrder(outboundNo)
  if (!order) return 'not-found' as const
  if (!['待出库', '已复核'].includes(order.状态)) return 'bad-status' as const

  const existing = new Set(getOrderLines(order).map((line) => line.运单号))
  const toAdd = newWaybillNos.filter((no) => no && !existing.has(no))
  if (toAdd.length === 0) return 'no-selection' as const

  const linesToAdd: OutboundOrderLine[] = []

  for (const waybillNo of toAdd) {
    const candidate = listCandidateWaybills(outboundNo).find(
      (item) => item.运单号 === waybillNo,
    )
    if (!candidate) return 'not-found-waybill' as const
    if (!candidate.可关联 && !existing.has(waybillNo)) {
      return 'insufficient-stock' as const
    }
    if (isWaybillLinked(waybillNo, outboundNo)) {
      return 'insufficient-stock' as const
    }
    linesToAdd.push({
      运单号: candidate.运单号,
      客户代码: candidate.客户代码,
      箱数: candidate.箱数,
      重量: candidate.重量,
      体积: candidate.体积,
    })
  }

  order.明细 = normalizeOrder({
    ...order,
    明细: [...getOrderLines(order), ...linesToAdd],
  }).明细
  order.运单号列表 = order.明细.map((line) => line.运单号)
  order.计划件数 = order.明细.reduce((sum, line) => sum + line.箱数, 0)
  order.计划订单数 = order.明细.length
  order.在库比例 =
    order.计划件数 > 0
      ? Math.min(100, Math.round((order.计划件数 / order.计划件数) * 100))
      : 0
  touchOrder(order)
  return 'ok' as const
}
