import type { InboundOrderStatus } from '@/domain/inbound-order/constants'

export type SortingWaybill = {
  运单号: string
  预报箱数: number
  状态: InboundOrderStatus
  预报箱号: string[]
  已绑托箱号: string[]
}

export type ScannedBox = {
  箱号: string
  运单号: string
}

export type PalletSlot = {
  /** 点击托满确认绑托后由系统生成；作业中未绑托时为 null */
  托号: string | null
  boxes: ScannedBox[]
}

export type SortingSession = {
  pallets: PalletSlot[]
  /** 当前选中作业格索引 */
  activePalletIndex: number
  highlightedBoxNo: string | null
}

export type ScanAssignError =
  | 'missing'
  | 'noForecast'
  | 'alreadyBound'
  | 'alreadyScanned'
  | 'largeTicketMix'
  | 'smallTicketWrongPallet'
  | 'mustBindCurrentPallet'
  | 'noActivePallet'
  | 'mixLimitExceeded'

export type BindPalletError = 'emptyPallet' | 'smallTicketIncomplete'
