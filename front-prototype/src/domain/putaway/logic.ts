import type { PutawayOrder, PutawayPallet } from '@/domain/putaway/types'

/** 运单在该上架单下首托已上架的备货库位（按托明细顺序） */
export function getWaybillPutawayLocation(
  order: PutawayOrder,
  运单号: string,
): string | null {
  const done = order.托明细.find(
    (pallet) =>
      pallet.上架状态 === '已上架' &&
      pallet.目标库位 &&
      pallet.运单号列表.includes(运单号),
  )
  return done?.目标库位 ?? null
}

/** 当前托是否因运单已有上架托而锁定库位（取该运单首托已上架库位） */
export function getPalletInheritedLocation(
  order: PutawayOrder,
  pallet: PutawayPallet,
): string | null {
  for (const 运单号 of pallet.运单号列表) {
    const location = getWaybillPutawayLocation(order, 运单号)
    if (location) return location
  }
  return null
}

export function isPalletLocationLocked(
  order: PutawayOrder,
  pallet: PutawayPallet,
): boolean {
  return getPalletInheritedLocation(order, pallet) != null
}

export function resolvePutawayLocation(
  order: PutawayOrder,
  pallet: PutawayPallet,
  selectedLocation: string,
): string {
  return getPalletInheritedLocation(order, pallet) ?? selectedLocation
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
