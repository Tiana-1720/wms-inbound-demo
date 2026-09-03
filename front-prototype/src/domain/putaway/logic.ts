import type { PutawayOrder, PutawayPallet } from '@/domain/putaway/types'

/** 同运单首托上架后确定的备货库位，后续托自动继承 */
export function getOrderPutawayLocation(order: PutawayOrder): string | null {
  const firstDone = order.托明细.find(
    (pallet) => pallet.上架状态 === '已上架' && pallet.目标库位,
  )
  return firstDone?.目标库位 ?? null
}

export function isLocationLocked(order: PutawayOrder): boolean {
  return getOrderPutawayLocation(order) != null
}

export function formatWaybillNos(order: PutawayOrder): string {
  return order.运单列表.map((item) => item.运单号).join('、')
}

export function getWaybillHistoryLocation(
  order: PutawayOrder,
  运单号: string,
): string | undefined {
  return order.运单列表.find((item) => item.运单号 === 运单号)?.历史上架库位
}

/** 确认上架前：托上任运单的历史库位与目标库位不一致则提示 */
export function findLocationMismatchOnPallet(
  order: PutawayOrder,
  pallet: PutawayPallet,
  targetLocation: string,
): { 运单号: string; 历史上架库位: string } | null {
  for (const 运单号 of pallet.运单号列表) {
    const history = getWaybillHistoryLocation(order, 运单号)
    if (history && history !== targetLocation) {
      return { 运单号, 历史上架库位: history }
    }
  }
  return null
}
