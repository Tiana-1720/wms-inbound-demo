import { Navigate } from 'react-router-dom'

import { TRANSFER_PLAN_LIST_PATH } from '@/config/routes'
import { canCreateTransferPlan } from '@/domain/transfer-plan/permissions'
import { TransferPlanListPage } from '@/pages/transfer-plan/TransferPlanListPage'
import { useCurrentUser } from '@/session/CurrentUserContext'

/** `/order/TransferPlan/new` 深链：等价于列表页打开新增弹窗 */
export function TransferPlanCreatePage() {
  const { user } = useCurrentUser()

  if (!canCreateTransferPlan(user.role)) {
    return <Navigate to={TRANSFER_PLAN_LIST_PATH} replace />
  }

  return <TransferPlanListPage initialCreateModalOpen />
}
