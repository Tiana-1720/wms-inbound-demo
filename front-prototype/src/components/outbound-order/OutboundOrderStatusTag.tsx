import { Tag } from 'antd'

import { OUTBOUND_STATUS_COLOR } from '@/domain/outbound-order/constants'
import type { OutboundOrderStatus } from '@/domain/outbound-order/constants'

type OutboundOrderStatusTagProps = {
  status: OutboundOrderStatus
}

export function OutboundOrderStatusTag({ status }: OutboundOrderStatusTagProps) {
  return <Tag color={OUTBOUND_STATUS_COLOR[status]}>{status}</Tag>
}
