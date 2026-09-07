import type {
  OutboundOrderStatus,
  OutboundType,
  TransferType,
} from '@/domain/outbound-order/constants'

/** 出库单明细行（字段清单 §二） */
export type OutboundOrderLine = {
  运单号: string
  客户代码: string
  箱数: number
  重量: number
  体积: number
}

/** 出库详情/关联运单明细展示行（对齐现网出库明细 Tab 扩展列） */
export type OutboundDetailLine = OutboundOrderLine & {
  装柜顺序?: string | null
  出库渠道?: string | null
  品名?: string | null
  客户备注?: string | null
  内部备注?: string | null
  目的仓库?: string | null
  目的邮编?: string | null
  预计到仓时间?: string | null
  状态?: string | null
}

/** 列表查询区（现网出库列表） */
export type OutboundOrderFilters = {
  运单号: string
  计划单号: string
  出库类型: OutboundType | ''
}

export const EMPTY_OUTBOUND_ORDER_FILTERS: OutboundOrderFilters = {
  运单号: '',
  计划单号: '',
  出库类型: '',
}

/** 出库单（现网列表字段 + 加盟路径扩展） */
export type OutboundOrder = {
  出库单号: string
  /** 列表主键展示：计划单号 + 业务归属，如 LT260871425(SD) */
  计划单号: string
  调拨计划单号: string | null
  归属仓库: string
  业务归属: string
  备注: string | null
  计划件数: number
  计划订单数: number
  /** 在库件数 / 计划件数 × 100 */
  在库比例: number
  计划装柜时间: string | null
  是否锁单: '是' | '否'
  出库类型: OutboundType
  调拨类型: TransferType | null
  司机: string | null
  车牌号: string | null
  电话: string | null
  状态: OutboundOrderStatus
  创建人: string
  创建时间: string
  最后修改人: string
  最后修改时间: string
  明细: OutboundOrderLine[]
  /** 明细运单号，供查询区运单号筛选 */
  运单号列表: string[]
  /** PC 打印装柜单后标记，确认出库前置（空单调拨） */
  装柜单已打印?: boolean
  /** 现网出库作业页展示；关联运单页只读对齐 */
  柜号?: string | null
}

/** 可选运单（关联运单页 §2.4） */
export type CandidateWaybill = OutboundDetailLine & {
  /** 收货仓库代码，须与出库单归属仓库一致方可勾选 */
  收货仓库: string
  可关联: boolean
  占用方?: string
}
