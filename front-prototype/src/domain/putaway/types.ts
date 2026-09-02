export type PutawayPalletStatus = '待上架' | '已上架'

export type PutawayOrderStatus = '待上架' | '已完成'

export type PutawayPallet = {
  托号: string
  件数: number
  首箱号: string
  箱号列表: string[]
  上架状态: PutawayPalletStatus
  目标库位: string | null
}

export type PutawayOrder = {
  作业单号: string
  运单号: string
  作业类型: '收货上架'
  件数: number
  托数: number
  状态: PutawayOrderStatus
  /** 列表展示用；大票多托取值待确认 */
  托号: string
  初始库位: string | null
  托明细: PutawayPallet[]
  /** 跨库位提醒：该运单历史上架库位 */
  历史上架库位?: string
}
