import { App, Button, Card, Empty, Input, Modal, theme } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  PDA_PRIMARY_BUTTON_STYLE,
  PdaBottomBar,
} from '@/components/pda/PdaBottomBar'
import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { ScanInput } from '@/components/pda/ScanInput'
import { PDA_TRANSFER_LOAD_PATH } from '@/config/routes'
import { TRANSFER_PLAN_LOADABLE_STATUSES } from '@/domain/transfer-plan/constants'
import {
  confirmDispatch,
  getLoadDriverInfo,
  getLoadPlan,
  getLoadScanStats,
  getLoadSession,
  isLoadDriverReady,
  removeLoadLine,
  scanLoadBox,
  setLoadDriverInfo,
} from '@/mocks/pda-transfer-load'

const LOAD_SCAN_ERROR = {
  missing: '箱号不存在',
  notOnShelf: '货物未上架或不在库',
  duplicate: '该运单已关联',
  incompleteWaybill: '请先扫齐当前运单全部托',
} as const

export function LoadWorkPage() {
  const { planNo = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const [tick, setTick] = useState(0)
  const [driverModalOpen, setDriverModalOpen] = useState(false)
  const [draftDriver, setDraftDriver] = useState(() => getLoadDriverInfo(planNo))

  const plan = useMemo(() => getLoadPlan(planNo), [planNo, tick])
  const lines = useMemo(() => getLoadSession(planNo), [planNo, tick])
  const scanStats = useMemo(() => getLoadScanStats(planNo), [planNo, tick])
  const driver = useMemo(() => getLoadDriverInfo(planNo), [planNo, tick])

  useEffect(() => {
    setTick((v) => v + 1)
  }, [planNo])

  useEffect(() => {
    if (driverModalOpen) {
      setDraftDriver(driver)
    }
  }, [driverModalOpen, driver])

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

  const readonly =
    !TRANSFER_PLAN_LOADABLE_STATUSES.includes(plan.状态) ||
    plan.出库单状态 === '已出库'
  const showBottom = !readonly && lines.length > 0

  const handleScan = (raw: string) => {
    const result = scanLoadBox(planNo, raw)
    if (result.kind === 'hit') {
      setTick((v) => v + 1)
      return
    }
    if (result.kind === 'boxOccupied') {
      message.error(`箱号${result.boxNo}已被${result.occupier}占用`)
      return
    }
    message.error(LOAD_SCAN_ERROR[result.kind])
  }

  const handleDispatch = () => {
    setDriverModalOpen(true)
  }

  const handleDriverModalConfirm = () => {
    if (!isLoadDriverReady(draftDriver)) {
      message.error('请填写司机、电话和车牌号')
      return Promise.reject()
    }
    setLoadDriverInfo(planNo, draftDriver)
    setDriverModalOpen(false)
    if (!confirmDispatch(planNo)) return
    message.success('装车成功，已占用库存')
    navigate(PDA_TRANSFER_LOAD_PATH)
  }

  return (
    <div
      data-anno="pda-load-work-page"
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

      <Modal
        title="司机信息"
        open={driverModalOpen}
        okText="确认装车"
        cancelText="取消"
        onOk={handleDriverModalConfirm}
        onCancel={() => setDriverModalOpen(false)}
      >
        <div data-anno="pda-load-driver-modal">
          <Input
            placeholder="司机"
            value={draftDriver.司机}
            onChange={(e) =>
              setDraftDriver((prev) => ({ ...prev, 司机: e.target.value }))
            }
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="电话"
            value={draftDriver.电话}
            onChange={(e) =>
              setDraftDriver((prev) => ({ ...prev, 电话: e.target.value }))
            }
            style={{ marginBottom: 8 }}
          />
          <Input
            placeholder="车牌号"
            value={draftDriver.车牌号}
            onChange={(e) =>
              setDraftDriver((prev) => ({ ...prev, 车牌号: e.target.value }))
            }
          />
        </div>
      </Modal>

      <div
        data-anno="pda-load-work-header"
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
        <div style={{ color: token.colorTextSecondary }}>
          已扫：{scanStats.票数}票 / {scanStats.托数}托
        </div>
      </div>

      {!readonly ? (
        <div
          data-anno="pda-load-work-scan"
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

      <div
        data-anno="pda-load-work-content"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
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
      </div>

      {showBottom ? (
        <div data-anno="pda-load-work-bottom">
          <PdaBottomBar>
            <Button
              type="primary"
              style={PDA_PRIMARY_BUTTON_STYLE}
              onClick={handleDispatch}
            >
              装车
            </Button>
          </PdaBottomBar>
        </div>
      ) : null}
    </div>
  )
}
