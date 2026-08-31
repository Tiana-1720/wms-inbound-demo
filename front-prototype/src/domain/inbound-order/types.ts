import type { InboundOrderStatus } from '@/domain/inbound-order/constants'
import {
  BUSINESS_OWNERSHIPS,
  BUSINESS_TYPES,
  TRANSPORT_TYPES,
} from '@/domain/inbound-order/constants'

export type BusinessType = (typeof BUSINESS_TYPES)[number]
export type BusinessOwnership = (typeof BUSINESS_OWNERSHIPS)[number]
export type TransportType = (typeof TRANSPORT_TYPES)[number]
export type CustomerGrade = 'S'

/** 收货订单列表行（字段均来自《收货订单-入库单字段清单》） */
export type InboundOrder = {
  收货单号: string
  运单号: string
  参考号: string | null
  客户代码: string
  客户等级: CustomerGrade | null
  目的国: string
  目的仓库: string
  渠道: string | null
  预报箱数: number
  预报重量: number
  预报体积: number
  预报仓库: string
  收货箱数: number | null
  收货重量: number | null
  收货体积: number | null
  收货仓库: string | null
  预计到仓时间: string
  业务类型: BusinessType
  业务归属: BusinessOwnership
  运输类型: TransportType
  收货人: string | null
  收货时间: string | null
  异常类型: string | null
  状态: InboundOrderStatus
  入库类型: string
  创建时间: string
  最后修改时间: string
  箱号列表?: string[]
  托号列表?: string[]
}

/** 列表页查询区 12 项（Demo PRD V1.1 §1.3） */
export type InboundOrderFilters = {
  运单号: string
  参考号: string
  收货单号: string
  客户代码: string
  渠道: string
  收货仓库: string[]
  目的国: string[]
  业务类型: BusinessType | ''
  业务归属: BusinessOwnership | ''
  运输类型: TransportType | ''
  预计到仓时间起: string
  预计到仓时间止: string
  收货时间起: string
  收货时间止: string
}

export const EMPTY_FILTERS: InboundOrderFilters = {
  运单号: '',
  参考号: '',
  收货单号: '',
  客户代码: '',
  渠道: '',
  收货仓库: [],
  目的国: [],
  业务类型: '',
  业务归属: '',
  运输类型: '',
  预计到仓时间起: '',
  预计到仓时间止: '',
  收货时间起: '',
  收货时间止: '',
}
