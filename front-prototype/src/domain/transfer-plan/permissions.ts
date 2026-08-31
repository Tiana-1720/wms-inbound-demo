import type { AppRole, CurrentUser } from '@/session/CurrentUserContext'
import type { TransferPlan } from '@/domain/transfer-plan/types'

/** 仅总部可新建空单（主 PRD R16 / Demo §1.4、§2.5） */
export function canCreateTransferPlan(role: AppRole) {
  return role === '总部作业部'
}

/** 预留：后期迭代取消（主 PRD R17）；本期无取消入口 */
export function canCancelTransferPlan(_role: AppRole, _plan: TransferPlan) {
  return false
}

/**
 * 调拨可见范围（主 PRD §七 / Demo §1.1）
 * - 总部 / 加盟仓：调出或调入命中可用仓
 * - 集货仓：调入仓命中本仓
 */
export function isTransferPlanVisible(user: CurrentUser, plan: TransferPlan) {
  if (user.role === '集货仓操作员') {
    return user.warehouses.includes(plan.调入仓库)
  }
  return (
    user.warehouses.includes(plan.调出仓库) ||
    user.warehouses.includes(plan.调入仓库)
  )
}
