import { Card, Empty, Tag, theme } from 'antd'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { getTransferLoadWorkPath } from '@/config/routes'
import { TRANSFER_PLAN_STATUS_COLOR } from '@/domain/transfer-plan/constants'
import { listPendingLoadPlans } from '@/mocks/pda-transfer-load'

export function LoadPlanListPage() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const plans = useMemo(() => listPendingLoadPlans(), [])

  const panelStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
  } as const

  return (
    <div
      data-anno="pda-load-list-page"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: token.colorBgLayout,
        borderLeft: `1px solid ${token.colorBorder}`,
        borderRight: `1px solid ${token.colorBorder}`,
      }}
    >
      <PdaNavBar title="装车" />

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {plans.length === 0 ? (
          <div style={{ ...panelStyle, padding: 24 }}>
            <Empty description="暂无可装车调拨计划" />
          </div>
        ) : (
          plans.map((plan) => (
            <Card
              key={plan.调拨计划单号}
              size="small"
              hoverable
              style={{ marginBottom: 8, ...panelStyle }}
              onClick={() => navigate(getTransferLoadWorkPath(plan.调拨计划单号))}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {plan.调拨计划单号}
              </div>
              <div style={{ color: token.colorTextSecondary, marginBottom: 8 }}>
                {plan.调出仓库} → {plan.调入仓库}
              </div>
              <div style={{ color: token.colorTextSecondary, marginBottom: 8 }}>
                合计：{plan.汇总箱数}箱
              </div>
              <Tag color={TRANSFER_PLAN_STATUS_COLOR[plan.状态]}>{plan.状态}</Tag>
              {plan.出库单状态 !== '未生成' ? (
                <Tag color={plan.出库单状态 === '已复核' ? 'orange' : 'default'}>
                  出库单{plan.出库单状态}
                </Tag>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
