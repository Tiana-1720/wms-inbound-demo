import { Tag } from 'antd'

import { TRANSFER_PLAN_STATUS_COLOR } from '@/domain/transfer-plan/constants'
import type { TransferPlanStatus } from '@/domain/transfer-plan/constants'

type TransferPlanStatusTagProps = {
  status: TransferPlanStatus
}

export function TransferPlanStatusTag({ status }: TransferPlanStatusTagProps) {
  return <Tag color={TRANSFER_PLAN_STATUS_COLOR[status]}>{status}</Tag>
}
