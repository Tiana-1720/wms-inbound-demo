import {
  CURRENT_OPERATOR,
  TRANSFER_WAREHOUSE_OPTIONS,
  WAREHOUSE_TYPE_FRANCHISE,
} from '@/domain/transfer-plan/constants'
import type { TransferPlan } from '@/domain/transfer-plan/types'
import { transferPlanMockData } from '@/mocks/transfer-plans'

let plans: TransferPlan[] = transferPlanMockData.map((plan) => ({
  ...plan,
  明细: [...plan.明细],
  操作日志: [...plan.操作日志],
}))

function nowText() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function findWarehouse(code: string) {
  return TRANSFER_WAREHOUSE_OPTIONS.find((item) => item.code === code)
}

function nextPlanNo(createdAt: string) {
  const datePart = createdAt.slice(2, 10).replaceAll('-', '')
  const prefix = `AT${datePart}`
  const seqs = plans
    .filter((plan) => plan.调拨计划单号.startsWith(prefix))
    .map((plan) => Number(plan.调拨计划单号.slice(-5)))
  const next = (seqs.length ? Math.max(...seqs) : 0) + 1
  return `${prefix}${String(next).padStart(5, '0')}`
}

export function listTransferPlans() {
  return plans
}

export function getTransferPlan(planNo: string) {
  return plans.find((plan) => plan.调拨计划单号 === planNo)
}

export function createTransferPlan(调出仓库: string, 调入仓库: string) {
  if (!调出仓库 || !调入仓库) {
    return { ok: false as const, reason: 'missing' as const }
  }

  if (调出仓库 === 调入仓库) {
    return { ok: false as const, reason: 'same-warehouse' as const }
  }

  const fromWarehouse = findWarehouse(调出仓库)
  if (!fromWarehouse || fromWarehouse.type !== WAREHOUSE_TYPE_FRANCHISE) {
    return { ok: false as const, reason: 'type' as const }
  }

  const createdAt = nowText()
  const plan: TransferPlan = {
    调拨计划单号: nextPlanNo(createdAt),
    调出仓库,
    调入仓库,
    状态: '待出库',
    箱数: 0,
    重量: 0,
    体积: 0,
    创建人: CURRENT_OPERATOR,
    创建时间: createdAt,
    最后修改人: CURRENT_OPERATOR,
    最后修改时间: createdAt,
    明细: [],
    操作日志: [
      {
        操作内容: '创建调拨计划',
        操作时间: createdAt,
        操作人: CURRENT_OPERATOR,
      },
    ],
  }

  plans = [plan, ...plans]
  return { ok: true as const, plan }
}

/** 后期迭代：取消空单（主 PRD R17 预留）；本期无 UI 入口 */
export function cancelTransferPlan(planNo: string) {
  const plan = getTransferPlan(planNo)
  if (!plan) return 'not-found' as const
  if (plan.状态 !== '待出库') return 'bad-status' as const
  if (plan.明细.length > 0) return 'has-lines' as const

  const updatedAt = nowText()
  plan.状态 = '已取消'
  plan.最后修改人 = CURRENT_OPERATOR
  plan.最后修改时间 = updatedAt
  plan.操作日志 = [
    {
      操作内容: '取消调拨计划',
      操作时间: updatedAt,
      操作人: CURRENT_OPERATOR,
    },
    ...plan.操作日志,
  ]

  return 'ok' as const
}
