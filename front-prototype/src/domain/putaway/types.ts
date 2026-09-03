export type PutawayPalletStatus = '待上架' | '已上架'

export type PutawayOrderStatus = '待上架' | '已完成'

/** 上架单关联运单（小票混托时一单多运单） */
export type PutawayWaybillLine = {
  运单号: string
  件数: number
  /** 跨库位提醒用 */
  历史上架库位?: string
}

export type PutawayPallet = {
  托号: string
  件数: number
  首箱号: string
  箱号列表: string[]
  /** 箱号 → 运单号；混托托上含多运单 */
  箱运单: Record<string, string>
  /** 本托涉及的运单号（去重） */
  运单号列表: string[]
  上架状态: PutawayPalletStatus
  目标库位: string | null
}

export type PutawayOrder = {
  作业单号: string
  /** 上架单下全部运单；大票通常 1 条，小票混托可多条 */
  运单列表: PutawayWaybillLine[]
  作业类型: '收货上架'
  件数: number
  托数: number
  状态: PutawayOrderStatus
  /** 列表展示用；多托时取首托或待上架首托 */
  托号: string
  初始库位: string | null
  托明细: PutawayPallet[]
}
