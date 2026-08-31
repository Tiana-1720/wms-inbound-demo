import { Tag } from 'antd'

import { STATUS_TAG_COLOR } from '@/domain/inbound-order/constants'
import type { InboundOrderStatus } from '@/domain/inbound-order/constants'

type StatusTagProps = {
  status: InboundOrderStatus
}

export function StatusTag({ status }: StatusTagProps) {
  return <Tag color={STATUS_TAG_COLOR[status]}>{status}</Tag>
}
