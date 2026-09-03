import type { PutawayOrder, PutawayPallet, PutawayWaybillLine } from './types'

export type BoundBox = {
  箱号: string
  运单号: string
}

export type BoundPalletRecord = {
  托号: string
  boxes: BoundBox[]
}

function uniqueWaybills(boxes: BoundBox[]) {
  return [...new Set(boxes.map((item) => item.运单号))]
}

export function buildPutawayPallet(
  托号: string,
  boxes: BoundBox[],
  上架状态: PutawayPallet['上架状态'] = '待上架',
  目标库位: string | null = null,
): PutawayPallet {
  const 箱号列表 = boxes.map((item) => item.箱号)
  const 箱运单 = Object.fromEntries(boxes.map((item) => [item.箱号, item.运单号]))
  return {
    托号,
    件数: 箱号列表.length,
    首箱号: 箱号列表[0]!,
    箱号列表,
    箱运单,
    运单号列表: uniqueWaybills(boxes),
    上架状态,
    目标库位,
  }
}

export function buildPutawayWaybillLines(
  pallets: PutawayPallet[],
  historyByWaybill?: Record<string, string | undefined>,
): PutawayWaybillLine[] {
  const counts = new Map<string, number>()
  for (const pallet of pallets) {
    for (const no of pallet.箱号列表) {
      const 运单号 = pallet.箱运单[no]!
      counts.set(运单号, (counts.get(运单号) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([运单号, 件数]) => ({
    运单号,
    件数,
    ...(historyByWaybill?.[运单号]
      ? { 历史上架库位: historyByWaybill[运单号] }
      : {}),
  }))
}

export function buildPutawayOrder(
  作业单号: string,
  pallets: PutawayPallet[],
  historyByWaybill?: Record<string, string | undefined>,
): PutawayOrder {
  const 运单列表 = buildPutawayWaybillLines(pallets, historyByWaybill)
  const 件数 = pallets.reduce((sum, item) => sum + item.件数, 0)
  const headPallet = pallets[0]!
  return {
    作业单号,
    运单列表,
    作业类型: '收货上架',
    件数,
    托数: pallets.length,
    状态: '待上架',
    托号: headPallet.托号,
    初始库位: null,
    托明细: pallets,
  }
}

/** 托上运单去重 */
export function getPalletWaybillNos(record: BoundPalletRecord) {
  return uniqueWaybills(record.boxes)
}

/**
 * 判定本次绑托是否应触发生成上架单。
 * - 小票混托（托上多运单）：托满即生成一张上架单（R45 保证各票已扫齐）。
 * - 单运单：须该运单全部箱已绑托，汇总其全部托后生成一张上架单。
 */
export function resolvePutawayGeneration(
  record: BoundPalletRecord,
  allBound: BoundPalletRecord[],
  isWaybillFullyBound: (运单号: string) => boolean,
): { kind: 'mixed'; pallets: BoundPalletRecord[] } | { kind: 'waybill'; 运单号: string; pallets: BoundPalletRecord[] } | null {
  const waybills = getPalletWaybillNos(record)
  if (waybills.length > 1) {
    return { kind: 'mixed', pallets: [record] }
  }

  const 运单号 = waybills[0]
  if (!运单号 || !isWaybillFullyBound(运单号)) return null

  const pallets = allBound.filter((item) =>
    item.boxes.some((box) => box.运单号 === 运单号),
  )
  return { kind: 'waybill', 运单号, pallets }
}
