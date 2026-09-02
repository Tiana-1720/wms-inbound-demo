import { SMALL_TICKET_MAX_PIECES } from '@/domain/pda-sorting/constants'
import type {
  PalletSlot,
  ScanAssignError,
  ScannedBox,
  SortingSession,
  SortingWaybill,
} from '@/domain/pda-sorting/types'

export function isSmallTicket(预报箱数: number) {
  return 预报箱数 <= SMALL_TICKET_MAX_PIECES
}

export function getPalletWaybills(pallet: PalletSlot) {
  return [...new Set(pallet.boxes.map((item) => item.运单号))]
}

export function getWaybillPalletIndex(
  session: SortingSession,
  运单号: string,
): number | null {
  const index = session.pallets.findIndex((pallet) =>
    pallet.boxes.some((item) => item.运单号 === 运单号),
  )
  return index >= 0 ? index : null
}

export function createPalletSlot(seq: number): PalletSlot {
  return {
    托号: `PL250101${String(seq).padStart(5, '0')}`,
    boxes: [],
  }
}

export function createSession(
  slotCount: number,
  palletSeqStart = 1,
): SortingSession {
  return {
    pallets: Array.from({ length: slotCount }, (_, index) =>
      createPalletSlot(palletSeqStart + index),
    ),
    activePalletIndex: 0,
    highlightedBoxNo: null,
  }
}

function canPlaceOnPallet(
  pallet: PalletSlot,
  waybill: SortingWaybill,
  waybillMap: Map<string, SortingWaybill>,
): ScanAssignError | null {
  if (pallet.boxes.length === 0) return null

  const waybillsOnPallet = getPalletWaybills(pallet)
  if (waybillsOnPallet.includes(waybill.运单号)) return null

  if (!isSmallTicket(waybill.预报箱数)) {
    return 'largeTicketMix'
  }

  for (const no of waybillsOnPallet) {
    const existing = waybillMap.get(no)
    if (existing && !isSmallTicket(existing.预报箱数)) {
      return 'largeTicketMix'
    }
  }

  return null
}

function findMinEmptySlotIndex(session: SortingSession): number | null {
  const index = session.pallets.findIndex((pallet) => pallet.boxes.length === 0)
  return index >= 0 ? index : null
}

function findMixableSlotIndex(
  session: SortingSession,
  waybill: SortingWaybill,
  waybillMap: Map<string, SortingWaybill>,
): number | null {
  if (!isSmallTicket(waybill.预报箱数)) return null
  const index = session.pallets.findIndex(
    (pallet) =>
      pallet.boxes.length > 0 &&
      canPlaceOnPallet(pallet, waybill, waybillMap) == null,
  )
  return index >= 0 ? index : null
}

export function resolveTargetPalletIndex(
  session: SortingSession,
  waybill: SortingWaybill,
  slotCount: number,
  waybillMap: Map<string, SortingWaybill>,
): number | ScanAssignError {
  const existing = getWaybillPalletIndex(session, waybill.运单号)
  if (existing != null) {
    const err = canPlaceOnPallet(session.pallets[existing], waybill, waybillMap)
    if (err) return err
    return existing
  }

  // N=1：小票可混托到已有兼容格；N>1：新运单仅占用空闲格
  if (slotCount === 1) {
    const mixIndex = findMixableSlotIndex(session, waybill, waybillMap)
    if (mixIndex != null) return mixIndex
  }

  const emptyIndex = findMinEmptySlotIndex(session)
  if (emptyIndex != null) {
    const err = canPlaceOnPallet(
      session.pallets[emptyIndex],
      waybill,
      waybillMap,
    )
    if (err) return err
    return emptyIndex
  }

  return 'mustBindCurrentPallet'
}

export function appendBoxToSession(
  session: SortingSession,
  palletIndex: number,
  box: ScannedBox,
): SortingSession {
  return {
    ...session,
    pallets: session.pallets.map((pallet, index) =>
      index === palletIndex
        ? { ...pallet, boxes: [...pallet.boxes, box] }
        : pallet,
    ),
    activePalletIndex: palletIndex,
    highlightedBoxNo: box.箱号,
  }
}

export function bindPallet(
  session: SortingSession,
  palletIndex: number,
  nextPalletSeq: number,
): { session: SortingSession; nextSeq: number; boundBoxes: ScannedBox[] } | null {
  const pallet = session.pallets[palletIndex]
  if (!pallet || pallet.boxes.length === 0) return null

  const boundBoxes = [...pallet.boxes]
  const pallets = session.pallets.map((item, index) =>
    index === palletIndex ? createPalletSlot(nextPalletSeq) : item,
  )

  return {
    session: {
      ...session,
      pallets,
      highlightedBoxNo: null,
      activePalletIndex: palletIndex,
    },
    nextSeq: nextPalletSeq + 1,
    boundBoxes,
  }
}

export const SCAN_ERROR_MESSAGE: Record<ScanAssignError, string> = {
  missing: '箱号不存在',
  noForecast: '无预报箱号，不可分货',
  alreadyBound: '该箱已绑托，不可重复扫描',
  alreadyScanned: '该箱已扫描',
  largeTicketMix: '大票不可混托',
  smallTicketWrongPallet: '小票须在同一托',
  mustBindCurrentPallet: '请先确认绑托释放作业格',
  noActivePallet: '无可用作业格',
}
