import { App, Button, Card, Empty, Modal, theme } from 'antd'
import { useMemo, useState } from 'react'

import { LocationPicker } from '@/components/pda/LocationPicker'
import {
  PDA_PRIMARY_BUTTON_STYLE,
  PdaBottomBar,
} from '@/components/pda/PdaBottomBar'
import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { ScanInput } from '@/components/pda/ScanInput'
import {
  getOrderPutawayLocation,
  isLocationLocked,
} from '@/domain/putaway/logic'
import type { PutawayOrder, PutawayPallet } from '@/domain/putaway/types'
import {
  calcPutawayProgress,
  confirmPutawayPallet,
  getPutawayOrder,
  lookupPutawayBox,
} from '@/mocks/putaway'

const PUTAWAY_SCAN_ERROR = {
  missing: '箱号不存在',
  notBound: '当前箱号未绑托',
  alreadyPutaway: '该箱已上架，不可重复上架',
} as const

type ScanContext = {
  order: PutawayOrder
  pallet: PutawayPallet
  boxNo: string
}

export function PutawayPage() {
  const { message } = App.useApp()
  const { token } = theme.useToken()

  const [tick, setTick] = useState(0)
  const [context, setContext] = useState<ScanContext | null>(null)
  const [draftLocation, setDraftLocation] = useState<string | null>(null)

  const order = useMemo(
    () => (context ? getPutawayOrder(context.order.作业单号) : null),
    [context, tick],
  )

  const pallet = useMemo(() => {
    if (!order || !context) return null
    return order.托明细.find((item) => item.托号 === context.pallet.托号) ?? null
  }, [order, context, tick])

  const panelStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
  } as const

  const handleScan = (raw: string) => {
    const result = lookupPutawayBox(raw)
    if (result.kind === 'missing') {
      message.error(PUTAWAY_SCAN_ERROR.missing)
      return
    }
    if (result.kind === 'notBound') {
      message.error(PUTAWAY_SCAN_ERROR.notBound)
      return
    }
    if (result.kind === 'alreadyPutaway') {
      message.error(PUTAWAY_SCAN_ERROR.alreadyPutaway)
      return
    }

    setContext({
      order: result.order,
      pallet: result.pallet,
      boxNo: result.boxNo,
    })
    setDraftLocation(null)
  }

  const inheritedLocation = order ? getOrderPutawayLocation(order) : null
  const locationLocked = order ? isLocationLocked(order) : false
  const effectiveLocation =
    inheritedLocation ?? draftLocation ?? pallet?.目标库位 ?? null

  const handleReset = () => {
    setContext(null)
    setDraftLocation(null)
  }

  const doConfirm = () => {
    if (!order || !pallet || !effectiveLocation) return
    confirmPutawayPallet(order.作业单号, pallet.托号, effectiveLocation)
    setTick((v) => v + 1)

    const updated = getPutawayOrder(order.作业单号)!
    if (updated.状态 === '已完成') {
      message.success('上架完成')
      setContext(null)
      setDraftLocation(null)
      return
    }
    message.success('上架成功')
    setContext(null)
    setDraftLocation(null)
  }

  const handleConfirm = () => {
    if (!order || !pallet || !effectiveLocation) return
    if (!locationLocked) {
      const history = order.历史上架库位
      if (history && history !== effectiveLocation) {
        Modal.confirm({
          title: '提示',
          content: `当前库位和运单已上架的历史库位${history}不一致，是否确认上架`,
          okText: '确认上架',
          cancelText: '取消',
          onOk: doConfirm,
        })
        return
      }
    }
    doConfirm()
  }

  const progress = order ? calcPutawayProgress(order) : null
  const showConfirm = !!pallet && pallet.上架状态 === '待上架' && !!effectiveLocation
  const showReset = !!context

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
      <PdaNavBar title="上架" />

      <div
        style={{
          flexShrink: 0,
          margin: 12,
          marginBottom: 0,
          padding: 12,
          ...panelStyle,
        }}
      >
        <ScanInput placeholder="请扫描箱号" onScan={handleScan} />
      </div>

      {!order || !pallet ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 12,
            ...panelStyle,
          }}
        >
          <Empty description="请扫描箱号开始上架" />
        </div>
      ) : (
        <>
          <div
            style={{
              flexShrink: 0,
              margin: 12,
              marginBottom: 0,
              padding: '12px 16px',
              ...panelStyle,
            }}
          >
            <div>
              运单号：{order.运单号}　作业单号：{order.作业单号}
            </div>
            <div style={{ marginTop: 8 }}>作业类型：{order.作业类型}</div>
            {progress ? (
              <div style={{ marginTop: 8, color: token.colorTextSecondary }}>
                已上架：{progress.已上架箱数}箱 / {progress.已上架托数}托　
                未上架：{progress.未上架箱数}箱 / {progress.未上架托数}托
              </div>
            ) : null}
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: token.colorTextSecondary,
              }}
            >
              当前箱号：{context?.boxNo}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <Card
              size="small"
              style={{
                ...panelStyle,
                border: `1px solid ${token.colorPrimary}`,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                托号 {pallet.托号}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ color: token.colorTextSecondary }}>
                  箱号 {pallet.首箱号}...({pallet.件数}箱)
                </span>
                {locationLocked ? (
                  <span style={{ color: token.colorTextSecondary }}>
                    {effectiveLocation}
                    （自动带出）
                  </span>
                ) : (
                  <LocationPicker
                    value={effectiveLocation}
                    onChange={setDraftLocation}
                  />
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      {(showReset || showConfirm) && (
        <PdaBottomBar>
          {showReset ? (
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
          ) : null}
          {showConfirm ? (
            <Button
              type="primary"
              style={PDA_PRIMARY_BUTTON_STYLE}
              onClick={handleConfirm}
            >
              确认上架
            </Button>
          ) : null}
        </PdaBottomBar>
      )}
    </div>
  )
}
