import { Card, Empty, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'

import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { getTransferLoadWorkPath } from '@/config/routes'
import {
  getLoadScanStats,
  listPendingLoadPlans,
} from '@/mocks/pda-transfer-load'

export function LoadPlanListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const plans = listPendingLoadPlans()
  void location.key

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
          plans.map((plan) => {
            const scanStats = getLoadScanStats(plan.调拨计划单号)
            return (
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
              <div style={{ color: token.colorTextSecondary, marginBottom: 4 }}>
                调出：{plan.调出仓库}
              </div>
              <div style={{ color: token.colorTextSecondary, marginBottom: 4 }}>
                调入：{plan.调入仓库}
              </div>
              <div style={{ color: token.colorTextSecondary }}>
                已扫：{scanStats.票数}票 / {scanStats.托数}托
              </div>
            </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
