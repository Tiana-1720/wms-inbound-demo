import {
  buildPutawayOrder,
  buildPutawayPallet,
  resolvePutawayGeneration,
  type BoundBox,
  type BoundPalletRecord,
} from '@/domain/putaway/generate'
import { isWaybillFullyBound } from './pda-sorting'
import { addPutawayOrder, hasPutawayForMixedPallet, hasPutawayForWaybill } from './putaway'

const boundPallets: BoundPalletRecord[] = []

let jobSeq = 5

function nextJobNo() {
  const no = `TK260101${String(jobSeq).padStart(4, '0')}`
  jobSeq += 1
  return no
}

const WAYBILL_HISTORY: Record<string, string> = {
  DSL26010128343: 'BH-A-01',
}

export function recordBoundPallet(托号: string, boxes: BoundBox[]) {
  if (boundPallets.some((item) => item.托号 === 托号)) return
  boundPallets.push({ 托号, boxes: [...boxes] })
}

export function listBoundPallets() {
  return boundPallets
}

/** 分货托满绑托后调用：按规则生成上架单 */
export function syncPutawayFromBoundPallet(托号: string) {
  const record = boundPallets.find((item) => item.托号 === 托号)
  if (!record) return null

  const plan = resolvePutawayGeneration(record, boundPallets, isWaybillFullyBound)
  if (!plan) return null

  if (plan.kind === 'mixed') {
    if (hasPutawayForMixedPallet(托号)) return null
    const pallets = plan.pallets.map((item) =>
      buildPutawayPallet(item.托号, item.boxes),
    )
    const order = buildPutawayOrder(nextJobNo(), pallets, WAYBILL_HISTORY)
    addPutawayOrder(order)
    return order
  }

  if (hasPutawayForWaybill(plan.运单号)) return null
  const pallets = plan.pallets.map((item) =>
    buildPutawayPallet(item.托号, item.boxes),
  )
  const order = buildPutawayOrder(nextJobNo(), pallets, WAYBILL_HISTORY)
  addPutawayOrder(order)
  return order
}

export function resetPutawaySyncState() {
  boundPallets.length = 0
  jobSeq = 5
}
