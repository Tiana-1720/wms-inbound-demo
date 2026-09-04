import type { PutawayOrder, PutawayPallet } from '@/domain/putaway/types'

function boxNo(seq: number) {
  return `FBA1988W5Y0GU${String(seq).padStart(6, '0')}`
}

function palletBoxes(from: number, count: number) {
  return Array.from({ length: count }, (_, i) => boxNo(from + i))
}

function makePallet(
  托号: string,
  from: number,
  count: number,
  运单号: string,
  上架状态: PutawayPallet['上架状态'] = '待上架',
  目标库位: string | null = null,
): PutawayPallet {
  const 箱号列表 = palletBoxes(from, count)
  const 箱运单 = Object.fromEntries(箱号列表.map((no) => [no, 运单号]))
  return {
    托号,
    件数: count,
    首箱号: 箱号列表[0]!,
    箱号列表,
    箱运单,
    运单号列表: [运单号],
    上架状态,
    目标库位,
  }
}

const multiPalletOrder: PutawayOrder = {
  作业单号: 'TK2601010001',
  运单列表: [{ 运单号: 'DSL26010128343', 件数: 350, 历史上架库位: 'BH-A-01' }],
  作业类型: '收货上架',
  件数: 350,
  托数: 8,
  状态: '待上架',
  托号: 'PL25010100001',
  初始库位: null,
  托明细: [
    makePallet('PL25010100001', 1, 30, 'DSL26010128343'),
    makePallet('PL25010100002', 31, 45, 'DSL26010128343'),
    makePallet('PL25010100003', 76, 40, 'DSL26010128343'),
    makePallet('PL25010100004', 116, 50, 'DSL26010128343'),
    makePallet('PL25010100005', 166, 45, 'DSL26010128343'),
    makePallet('PL25010100006', 211, 40, 'DSL26010128343'),
    makePallet('PL25010100007', 251, 50, 'DSL26010128343'),
    makePallet('PL25010100008', 301, 50, 'DSL26010128343'),
  ],
}

const completedOrder: PutawayOrder = {
  作业单号: 'TK2601010002',
  运单列表: [{ 运单号: 'DSL26010128301', 件数: 30 }],
  作业类型: '收货上架',
  件数: 30,
  托数: 1,
  状态: '已完成',
  托号: 'PL25010100010',
  初始库位: null,
  托明细: [
    makePallet('PL25010100010', 351, 30, 'DSL26010128301', '已上架', 'BH-B-01'),
  ],
}

const putawayOrders: PutawayOrder[] = [multiPalletOrder, completedOrder]

const boxIndex = new Map<string, PutawayOrder>()

function clonePallet(pallet: PutawayPallet): PutawayPallet {
  return {
    ...pallet,
    箱号列表: [...pallet.箱号列表],
    箱运单: { ...pallet.箱运单 },
    运单号列表: [...pallet.运单号列表],
  }
}

function cloneOrder(order: PutawayOrder): PutawayOrder {
  return {
    ...order,
    运单列表: order.运单列表.map((item) => ({ ...item })),
    托明细: order.托明细.map(clonePallet),
  }
}

const initialPutawaySnapshots = putawayOrders.map(cloneOrder)

function rebuildBoxIndex() {
  boxIndex.clear()
  for (const order of putawayOrders) {
    for (const pallet of order.托明细) {
      for (const no of pallet.箱号列表) {
        boxIndex.set(no, order)
      }
    }
  }
}

rebuildBoxIndex()

/** 恢复上架 Mock 至初始快照（含移除分货动态生成的上架单） */
export function resetPutawayDemo() {
  putawayOrders.splice(
    0,
    putawayOrders.length,
    ...initialPutawaySnapshots.map(cloneOrder),
  )
  rebuildBoxIndex()
}

export function addPutawayOrder(order: PutawayOrder) {
  putawayOrders.push(order)
  rebuildBoxIndex()
}

export function hasPutawayForWaybill(运单号: string) {
  return putawayOrders.some((order) =>
    order.运单列表.some((line) => line.运单号 === 运单号),
  )
}

export function hasPutawayForMixedPallet(托号: string) {
  return putawayOrders.some(
    (order) =>
      order.运单列表.length > 1 &&
      order.托明细.some((pallet) => pallet.托号 === 托号),
  )
}

export function listPendingPutawayOrders() {
  return putawayOrders.filter((item) => item.状态 === '待上架')
}

export function getPutawayOrder(jobNo: string) {
  return putawayOrders.find((item) => item.作业单号 === jobNo) ?? null
}

export type PutawayBoxLookup =
  | { kind: 'missing' }
  | { kind: 'notBound' }
  | { kind: 'alreadyPutaway' }
  | { kind: 'hit'; order: PutawayOrder; boxNo: string; pallet: PutawayPallet }

export function lookupPutawayBox(raw: string): PutawayBoxLookup {
  const boxNo = raw.trim().toUpperCase()
  const order = boxIndex.get(boxNo)
  if (!order) return { kind: 'missing' }

  const pallet = order.托明细.find((item) => item.箱号列表.includes(boxNo))
  if (!pallet) return { kind: 'notBound' }
  if (pallet.上架状态 === '已上架') return { kind: 'alreadyPutaway' }
  if (order.状态 === '已完成') return { kind: 'alreadyPutaway' }

  return { kind: 'hit', order, boxNo, pallet }
}

export function calcPutawayProgress(order: PutawayOrder) {
  const 已上架托数 = order.托明细.filter((p) => p.上架状态 === '已上架').length
  const 未上架托数 = order.托数 - 已上架托数
  const 已上架箱数 = order.托明细
    .filter((p) => p.上架状态 === '已上架')
    .reduce((sum, p) => sum + p.件数, 0)
  const 未上架箱数 = order.件数 - 已上架箱数
  return { 已上架托数, 未上架托数, 已上架箱数, 未上架箱数 }
}

export function confirmPutawayPallet(
  jobNo: string,
  托号: string,
  目标库位: string,
) {
  const order = getPutawayOrder(jobNo)
  if (!order) return null
  const pallet = order.托明细.find((item) => item.托号 === 托号)
  if (!pallet || pallet.上架状态 === '已上架') return null

  const inherited = order.托明细.find(
    (item) => item.上架状态 === '已上架' && item.目标库位,
  )?.目标库位
  const finalLocation = inherited ?? 目标库位

  pallet.目标库位 = finalLocation
  pallet.上架状态 = '已上架'

  const progress = calcPutawayProgress(order)
  const completed =
    progress.未上架托数 === 0 && progress.未上架箱数 === 0
  if (completed) {
    order.状态 = '已完成'
  }
  return { order, completed }
}

export function getPutawayWorkContext(jobNo: string) {
  const order = getPutawayOrder(jobNo)
  if (!order || order.状态 !== '待上架') return null
  const pallet =
    order.托明细.find((item) => item.上架状态 === '待上架') ?? null
  if (!pallet) return null
  return { order, pallet, boxNo: pallet.首箱号 }
}
