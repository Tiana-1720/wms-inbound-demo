import type { PutawayOrder } from '@/domain/putaway/types'

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
