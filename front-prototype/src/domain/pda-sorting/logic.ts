import type {
  BindPalletError,
  PalletSlot,
  ScanAssignError,
  ScannedBox,
  SortingSession,
  SortingWaybill,
} from '@/domain/pda-sorting/types'

export type SortingParams = {
  /** 小票阈值 M */
  smallTicketThreshold: number
  /** 小票混托票数上限 P */
  smallTicketMixMax: number
}

export function isSmallTicket(预报箱数: number, m: number) {
  return 预报箱数 <= m
}

export function getPalletWaybills(pallet: PalletSlot) {
  return [...new Set(pallet.boxes.map((item) => item.运单号))]
}

export function countWaybillOnPallet(pallet: PalletSlot, 运单号: string) {
  return pallet.boxes.filter((item) => item.运单号 === 运单号).length
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

export function formatPalletNo(seq: number) {
  return `PL250101${String(seq).padStart(5, '0')}`
}

export function createPalletSlot(): PalletSlot {
  return {
    托号: null,
    boxes: [],
  }
}

export function createSession(slotCount: number): SortingSession {
  return {
    pallets: Array.from({ length: slotCount }, () => createPalletSlot()),
    activePalletIndex: 0,
    highlightedBoxNo: null,
  }
}

function canPlaceOnPallet(
  pallet: PalletSlot,
  waybill: SortingWaybill,
  waybillMap: Map<string, SortingWaybill>,
  params: SortingParams,
): ScanAssignError | null {
  if (pallet.boxes.length === 0) return null

  const waybillsOnPallet = getPalletWaybills(pallet)
  if (waybillsOnPallet.includes(waybill.运单号)) return null

  if (!isSmallTicket(waybill.预报箱数, params.smallTicketThreshold)) {
    return 'largeTicketMix'
  }

  for (const no of waybillsOnPallet) {
    const existing = waybillMap.get(no)
    if (
      existing &&
      !isSmallTicket(existing.预报箱数, params.smallTicketThreshold)
    ) {
      return 'largeTicketMix'
    }
  }

  if (waybillsOnPallet.length >= params.smallTicketMixMax) {
    return 'mixLimitExceeded'
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
  params: SortingParams,
): number | null {
  if (!isSmallTicket(waybill.预报箱数, params.smallTicketThreshold)) {
    return null
  }
  const index = session.pallets.findIndex(
    (pallet) =>
      pallet.boxes.length > 0 &&
      canPlaceOnPallet(pallet, waybill, waybillMap, params) == null,
  )
  return index >= 0 ? index : null
}

export function resolveTargetPalletIndex(
  session: SortingSession,
  waybill: SortingWaybill,
  waybillMap: Map<string, SortingWaybill>,
  params: SortingParams,
): number | ScanAssignError {
  const existing = getWaybillPalletIndex(session, waybill.运单号)
  if (existing != null) {
    const err = canPlaceOnPallet(
      session.pallets[existing],
      waybill,
      waybillMap,
      params,
    )
    if (err) return err
    return existing
  }

  const isSmall = isSmallTicket(waybill.预报箱数, params.smallTicketThreshold)

  // 小票首箱：优先落入已有小票混托格（N=1 / N>1 均适用）
  if (isSmall) {
    const mixIndex = findMixableSlotIndex(session, waybill, waybillMap, params)
    if (mixIndex != null) return mixIndex
  }

  // 大票首箱或无可混托格：占最小空闲格（新托）
  const emptyIndex = findMinEmptySlotIndex(session)
  if (emptyIndex != null) {
    const err = canPlaceOnPallet(
      session.pallets[emptyIndex],
      waybill,
      waybillMap,
      params,
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

export function validatePalletBind(
  pallet: PalletSlot,
  waybillMap: Map<string, SortingWaybill>,
  params: SortingParams,
): BindPalletError | null {
  if (pallet.boxes.length === 0) return 'emptyPallet'

  for (const 运单号 of getPalletWaybills(pallet)) {
    const waybill = waybillMap.get(运单号)
    if (!waybill) continue
    if (isSmallTicket(waybill.预报箱数, params.smallTicketThreshold)) {
      const scanned = countWaybillOnPallet(pallet, 运单号)
      if (scanned < waybill.预报箱数) {
        return 'smallTicketIncomplete'
      }
    }
  }

  return null
}

export function bindPallet(
  session: SortingSession,
  palletIndex: number,
  nextPalletSeq: number,
): {
  session: SortingSession
  nextSeq: number
  boundBoxes: ScannedBox[]
  托号: string
} | null {
  const pallet = session.pallets[palletIndex]
  if (!pallet || pallet.boxes.length === 0) return null

  const 托号 = formatPalletNo(nextPalletSeq)
  const boundBoxes = [...pallet.boxes]
  const pallets = session.pallets.map((item, index) =>
    index === palletIndex ? createPalletSlot() : item,
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
    托号,
  }
}

export const SCAN_ERROR_MESSAGE: Record<ScanAssignError, string> = {
  missing: '箱号不存在',
  noForecast: '无预报箱号，不可分货',
  alreadyBound: '该箱已绑托，不可重复扫描',
  alreadyScanned: '该箱已扫描',
  largeTicketMix: '大票不可混托',
  smallTicketWrongPallet: '小票须在同一托',
  mustBindCurrentPallet: '请先确认绑托释放托',
  noActivePallet: '无可用托',
  mixLimitExceeded: '混托票数已达上限',
}

export const BIND_ERROR_MESSAGE: Record<BindPalletError, string> = {
  emptyPallet: '当前格无扫描箱号',
  smallTicketIncomplete: '小票须扫齐全部箱方可绑托',
}
