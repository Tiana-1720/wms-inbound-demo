/**
 * 上架 PDA 页（04-06）：子页 A 入口 / B 作业 / C 明细。
 * 小票混托：多运单共一张上架单；扫托上任一箱进入该单，确认上架整托（含托上全部运单）。
 */
import { App, Button, Card, Empty, Modal, Tabs, theme } from 'antd'
import { useMemo, useState } from 'react'

import { LocationPicker } from '@/components/pda/LocationPicker'
import {
  PDA_PRIMARY_BUTTON_STYLE,
  PdaBottomBar,
} from '@/components/pda/PdaBottomBar'
import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { ScanInput } from '@/components/pda/ScanInput'
import {
  findLocationMismatchOnPallet,
  formatWaybillNos,
  getOrderPutawayLocation,
  isLocationLocked,
} from '@/domain/putaway/logic'
import type { PutawayPallet } from '@/domain/putaway/types'
import {
  calcPutawayProgress,
  confirmPutawayPallet,
  getPutawayOrder,
  getPutawayWorkContext,
  listPendingPutawayOrders,
  lookupPutawayBox,
  resetPutawayDemo,
} from '@/mocks/putaway'
import { resetPutawaySyncState } from '@/mocks/putaway-sync'
import { resetSortingDemo } from '@/mocks/pda-sorting'

const PUTAWAY_SCAN_ERROR = {
  missing: '箱号不存在',
  notBound: '当前箱号未绑托',
  alreadyPutaway: '该箱已上架，不可重复上架',
} as const

type Screen = 'entry' | 'work' | 'detail'
type DetailTab = '全部' | '已上架' | '未上架'

type WorkContext = {
  jobNo: string
  focus托号: string
  boxNo: string | null
}

export function PutawayPage() {
  const { message } = App.useApp()
  const { token } = theme.useToken()

  const [tick, setTick] = useState(0)
  const [screen, setScreen] = useState<Screen>('entry')
  const [work, setWork] = useState<WorkContext | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('全部')
  const [draftByPallet, setDraftByPallet] = useState<Record<string, string>>({})

  const pendingOrders = useMemo(() => listPendingPutawayOrders(), [tick])

  const order = useMemo(
    () => (work ? getPutawayOrder(work.jobNo) : null),
    [work, tick],
  )

  const focusPallet = useMemo(() => {
    if (!order || !work) return null
    return (
      order.托明细.find((item) => item.托号 === work.focus托号) ??
      order.托明细.find((item) => item.上架状态 === '待上架') ??
      null
    )
  }, [order, work, tick])

  const panelStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
  } as const

  const openWork = (ctx: WorkContext) => {
    setWork(ctx)
    setDraftByPallet({})
    setScreen('work')
  }

  const backToEntry = () => {
    setWork(null)
    setDraftByPallet({})
    setScreen('entry')
  }

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

    openWork({
      jobNo: result.order.作业单号,
      focus托号: result.pallet.托号,
      boxNo: result.boxNo,
    })
  }

  const handleOpenFromList = (jobNo: string) => {
    const ctx = getPutawayWorkContext(jobNo)
    if (!ctx) return
    openWork({
      jobNo: ctx.order.作业单号,
      focus托号: ctx.pallet.托号,
      boxNo: ctx.boxNo,
    })
  }

  const inheritedLocation = order ? getOrderPutawayLocation(order) : null
  const locationLocked = order ? isLocationLocked(order) : false

  const getEffectiveLocation = (pallet: PutawayPallet) => {
    if (locationLocked && inheritedLocation) return inheritedLocation
    return draftByPallet[pallet.托号] ?? pallet.目标库位 ?? null
  }

  const handleReset = () => {
    setDraftByPallet({})
  }

  const doConfirm = (pallet: PutawayPallet, location: string) => {
    if (!order) return
    const result = confirmPutawayPallet(order.作业单号, pallet.托号, location)
    if (!result) return
    setTick((v) => v + 1)

    if (result.completed) {
      // 原型：整单完成仅反馈交互，回滚上架/分货 Mock，便于重复扫描演示
      resetPutawayDemo()
      resetPutawaySyncState()
      resetSortingDemo()
      message.success('上架完成')
      backToEntry()
      return
    }

    const updated = result.order
    message.success('上架成功')
    const next = updated.托明细.find((item) => item.上架状态 === '待上架')
    if (next) {
      setWork({
        jobNo: updated.作业单号,
        focus托号: next.托号,
        boxNo: next.首箱号,
      })
    }
    setDraftByPallet({})
  }

  const handleConfirm = (pallet: PutawayPallet) => {
    const effectiveLocation = getEffectiveLocation(pallet)
    if (!order || !effectiveLocation) return
    if (!locationLocked) {
      const mismatch = findLocationMismatchOnPallet(
        order,
        pallet,
        effectiveLocation,
      )
      if (mismatch) {
        Modal.confirm({
          title: '提示',
          content: `运单${mismatch.运单号}的历史库位${mismatch.历史上架库位}与当前库位不一致，是否确认上架`,
          okText: '确认上架',
          cancelText: '取消',
          onOk: () => doConfirm(pallet, effectiveLocation),
        })
        return
      }
    }
    doConfirm(pallet, effectiveLocation)
  }

  const progress = order ? calcPutawayProgress(order) : null
  const focusReady =
    focusPallet &&
    focusPallet.上架状态 === '待上架' &&
    !!getEffectiveLocation(focusPallet)
  const showReset = screen === 'work' && Object.keys(draftByPallet).length > 0

  const detailRows = useMemo(() => {
    if (!focusPallet) return []
    const loc = focusPallet.目标库位 ?? inheritedLocation ?? '-'
    return focusPallet.箱号列表.map((box) => ({
      运单号: focusPallet.箱运单[box] ?? '-',
      箱号: box,
      库位: loc,
    }))
  }, [focusPallet, inheritedLocation, tick])

  const filteredDetailRows = useMemo(() => {
    if (!focusPallet) return []
    if (detailTab === '全部') return detailRows
    if (detailTab === '已上架') {
      return focusPallet.上架状态 === '已上架' ? detailRows : []
    }
    return focusPallet.上架状态 === '待上架' ? detailRows : []
  }, [detailRows, detailTab, focusPallet])

  const renderPalletCard = (pallet: PutawayPallet) => {
    const effectiveLocation = getEffectiveLocation(pallet)
    const readonlyPallet = pallet.上架状态 === '已上架'

    return (
      <Card
        key={pallet.托号}
        size="small"
        style={{
          marginBottom: 8,
          ...panelStyle,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>托号 {pallet.托号}</div>
        {pallet.运单号列表.length > 1 ? (
          <div
            style={{
              marginBottom: 8,
              fontSize: 12,
              color: token.colorTextSecondary,
            }}
          >
            运单：{pallet.运单号列表.join('、')}
          </div>
        ) : null}
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
          {readonlyPallet ? (
            <span style={{ color: token.colorTextSecondary }}>
              {pallet.目标库位}
            </span>
          ) : locationLocked ? (
            <span style={{ color: token.colorTextSecondary }}>
              {effectiveLocation}（自动带出）
            </span>
          ) : (
            <LocationPicker
              value={effectiveLocation}
              onChange={(loc) =>
                setDraftByPallet((prev) => ({ ...prev, [pallet.托号]: loc }))
              }
            />
          )}
        </div>
      </Card>
    )
  }

  if (screen === 'detail' && order && focusPallet) {
    return (
      <div
        data-anno="pda-putaway-detail"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: token.colorBgLayout,
        }}
      >
        <PdaNavBar title="上架明细" onBack={() => setScreen('work')} />
        <div
          style={{
            padding: '12px 12px 0',
            fontWeight: 600,
          }}
        >
          托号 {focusPallet.托号}
        </div>
        <div style={{ padding: 12, paddingBottom: 0 }}>
          <Tabs
            activeKey={detailTab}
            onChange={(key) => setDetailTab(key as DetailTab)}
            items={[
              { key: '全部', label: '全部' },
              { key: '已上架', label: '已上架' },
              { key: '未上架', label: '未上架' },
            ]}
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 12, paddingTop: 0 }}>
          {filteredDetailRows.length === 0 ? (
            <Empty description="暂无明细" />
          ) : (
            filteredDetailRows.map((row) => (
              <Card
                key={`${row.运单号}-${row.箱号}`}
                size="small"
                style={{ marginBottom: 8, ...panelStyle }}
              >
                <div style={{ color: token.colorTextSecondary }}>
                  运单号 {row.运单号}
                </div>
                <div style={{ color: token.colorTextSecondary }}>
                  箱号 {row.箱号}
                </div>
                <div style={{ color: token.colorTextSecondary }}>
                  库位 {row.库位}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  if (screen === 'work' && order && work) {
    return (
      <div
        data-anno="pda-putaway-work"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: token.colorBgLayout,
        }}
      >
        <PdaNavBar title="上架" onBack={backToEntry} />

        <div
          data-anno="pda-putaway-work-header"
          style={{
            flexShrink: 0,
            margin: 12,
            marginBottom: 0,
            padding: '12px 16px',
            ...panelStyle,
          }}
        >
          <div>
            运单号：{formatWaybillNos(order)}　作业单号：{order.作业单号}
          </div>
          {order.运单列表.length > 1 ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: token.colorTextSecondary,
              }}
            >
              共 {order.运单列表.length} 票　
              {order.运单列表
                .map((item) => `${item.运单号}(${item.件数}箱)`)
                .join('、')}
            </div>
          ) : null}
          <div style={{ marginTop: 8 }}>作业类型：{order.作业类型}</div>
          {progress ? (
            <div
              role="button"
              tabIndex={0}
              style={{
                marginTop: 8,
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
              onClick={() => setScreen('detail')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setScreen('detail')
              }}
            >
              已上架：{progress.已上架箱数}箱 / {progress.已上架托数}托　未上架：
              {progress.未上架箱数}箱 / {progress.未上架托数}托（点击查看明细）
            </div>
          ) : null}
          {work.boxNo ? (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: token.colorTextSecondary,
              }}
            >
              当前箱号：{work.boxNo}
            </div>
          ) : null}
        </div>

        <div data-anno="pda-putaway-pallets" style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {focusPallet ? (
            renderPalletCard(focusPallet)
          ) : (
            <Empty description="暂无待上架托" />
          )}
        </div>

        {(showReset || focusReady) && (
          <div data-anno="pda-putaway-bottom">
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
            {focusReady && focusPallet ? (
              <Button
                type="primary"
                style={PDA_PRIMARY_BUTTON_STYLE}
                onClick={() => handleConfirm(focusPallet)}
              >
                确认上架
              </Button>
            ) : null}
          </PdaBottomBar>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      data-anno="pda-putaway-entry"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: token.colorBgLayout,
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

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {pendingOrders.length === 0 ? (
          <div style={{ ...panelStyle, padding: 24 }}>
            <Empty description="暂无待上架任务" />
          </div>
        ) : (
          pendingOrders.map((item) => (
            <Card
              key={item.作业单号}
              size="small"
              hoverable
              style={{ marginBottom: 8, ...panelStyle }}
              onClick={() => handleOpenFromList(item.作业单号)}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {item.作业单号}
              </div>
              <div style={{ color: token.colorTextSecondary, marginBottom: 4 }}>
                运单号：{formatWaybillNos(item)}
              </div>
              <div style={{ color: token.colorTextSecondary }}>
                托号 {item.托号}　{item.件数}件
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
