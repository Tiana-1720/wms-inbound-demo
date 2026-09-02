import { App, Button, Card, Empty, Modal, Tag, theme } from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  PDA_PRIMARY_BUTTON_STYLE,
  PdaBottomBar,
} from '@/components/pda/PdaBottomBar'
import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { ScanInput } from '@/components/pda/ScanInput'
import { PDA_TRANSFER_LOAD_PATH } from '@/config/routes'
import {
  confirmDispatch,
  getLoadPlan,
  getLoadSession,
  removeLoadLine,
  resetLoadSession,
  scanLoadBox,
} from '@/mocks/pda-transfer-load'

const LOAD_SCAN_ERROR = {
  missing: '箱号不存在',
  notOnShelf: '货物未上架或不在库',
  destMismatch: '目的仓与调入仓库不一致',
  duplicate: '该运单已关联',
} as const

export function LoadWorkPage() {
  const { planNo = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const [tick, setTick] = useState(0)

  const plan = useMemo(() => getLoadPlan(planNo), [planNo, tick])
  const lines = useMemo(() => getLoadSession(planNo), [planNo, tick])

  const panelStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
  } as const

  if (!plan) {
    return (
      <div style={{ height: '100%', background: token.colorBgLayout }}>
        <PdaNavBar title="装车" />
        <div style={{ padding: 16 }}>调拨计划不存在</div>
      </div>
    )
  }

  const readonly = plan.状态 !== '待出库'
  const showBottom = !readonly && lines.length > 0

  const handleScan = (raw: string) => {
    const result = scanLoadBox(planNo, raw)
    if (result.kind !== 'hit') {
      message.error(LOAD_SCAN_ERROR[result.kind])
      return
    }
    setTick((v) => v + 1)
  }

  const handleReset = () => {
    resetLoadSession(planNo)
    setTick((v) => v + 1)
  }

  const handleDispatch = () => {
    Modal.confirm({
      title: '装车',
      content: '装车？将扣减库位库存并生成出库单与调入仓入库单',
      okText: '装车',
      cancelText: '取消',
      onOk: () => {
        if (!confirmDispatch(planNo)) return
        message.success('装车成功')
        navigate(PDA_TRANSFER_LOAD_PATH)
      },
    })
  }

  return (
    <div
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

      <div
        style={{
          flexShrink: 0,
          margin: 12,
          marginBottom: 0,
          padding: '12px 16px',
          ...panelStyle,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{plan.调拨计划单号}</div>
        <div style={{ marginBottom: 8 }}>
          调出：{plan.调出仓库}　调入：{plan.调入仓库}
        </div>
        <Tag color={plan.状态 === '待出库' ? 'blue' : 'default'}>{plan.状态}</Tag>
      </div>

      {!readonly ? (
        <div
          style={{
            flexShrink: 0,
            margin: 12,
            marginBottom: 0,
            padding: 12,
            ...panelStyle,
          }}
        >
          <ScanInput placeholder="请扫描箱号装车" onScan={handleScan} />
        </div>
      ) : null}

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {lines.length === 0 ? (
          <div style={{ ...panelStyle, padding: 24 }}>
            <Empty
              description={
                readonly ? '暂无装车明细' : '请扫描箱号开始装车'
              }
            />
          </div>
        ) : (
          lines.map((line) => (
            <Card
              key={line.运单号}
              size="small"
              style={{ marginBottom: 8, ...panelStyle }}
              extra={
                !readonly ? (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => {
                      removeLoadLine(planNo, line.运单号)
                      setTick((v) => v + 1)
                    }}
                  >
                    移除
                  </Button>
                ) : null
              }
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                运单号 {line.运单号}
              </div>
              <div style={{ color: token.colorTextSecondary, marginBottom: 4 }}>
                客户：{line.客户代码}
              </div>
              <div style={{ color: token.colorTextSecondary }}>
                {line.箱数}箱　{line.重量.toFixed(2)}KG　
                {line.体积.toFixed(6)}CBM
              </div>
            </Card>
          ))
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          margin: 12,
          marginTop: 0,
          padding: '12px 16px',
          ...panelStyle,
        }}
      >
        <div>合计：{plan.汇总箱数}箱</div>
        <div style={{ marginTop: 4 }}>{plan.汇总重量.toFixed(2)}KG</div>
        <div style={{ marginTop: 4 }}>{plan.汇总体积.toFixed(6)}CBM</div>
      </div>

      {showBottom ? (
        <PdaBottomBar>
          <Button
            style={{
              ...PDA_PRIMARY_BUTTON_STYLE,
              color: token.colorPrimary,
              borderColor: token.colorPrimary,
            }}
            onClick={handleReset}
          >
            重置
          </Button>
          <Button
            type="primary"
            style={PDA_PRIMARY_BUTTON_STYLE}
            onClick={handleDispatch}
          >
            装车
          </Button>
        </PdaBottomBar>
      ) : null}
    </div>
  )
}
