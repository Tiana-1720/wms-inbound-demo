import {
  App,
  Button,
  Card,
  Empty,
  InputNumber,
  Modal,
  Skeleton,
  Tag,
  theme,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'

import { StatusTag } from '@/components/inbound-order/StatusTag'
import { PdaNavBar } from '@/components/pda/PdaNavBar'
import { ScanInput } from '@/components/pda/ScanInput'
import {
  SMALL_TICKET_MAX_PIECES,
  SORTING_SLOT_COUNT_DEFAULT,
  SORTING_SLOT_COUNT_MAX,
  SORTING_SLOT_COUNT_MIN,
  SORTING_SLOT_COUNT_STORAGE_KEY,
} from '@/domain/pda-sorting/constants'
import {
  SCAN_ERROR_MESSAGE,
  appendBoxToSession,
  bindPallet,
  createSession,
  getPalletWaybills,
  isSmallTicket,
  resolveTargetPalletIndex,
} from '@/domain/pda-sorting/logic'
import type { SortingSession, SortingWaybill } from '@/domain/pda-sorting/types'
import {
  getSortingWaybillMap,
  isBoxAlreadyBound,
  lookupSortingBox,
  markPalletBound,
} from '@/mocks/pda-sorting'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadSlotCount() {
  const saved = Number(sessionStorage.getItem(SORTING_SLOT_COUNT_STORAGE_KEY))
  if (
    Number.isFinite(saved) &&
    saved >= SORTING_SLOT_COUNT_MIN &&
    saved <= SORTING_SLOT_COUNT_MAX
  ) {
    return saved
  }
  return SORTING_SLOT_COUNT_DEFAULT
}

function isBoxScanned(session: SortingSession, boxNo: string) {
  return session.pallets.some((pallet) =>
    pallet.boxes.some((item) => item.箱号 === boxNo),
  )
}

function countWaybillScanned(session: SortingSession, 运单号: string) {
  return session.pallets.reduce(
    (sum, pallet) =>
      sum + pallet.boxes.filter((item) => item.运单号 === 运单号).length,
    0,
  )
}

function hasScannedData(session: SortingSession | null) {
  return !!session?.pallets.some((pallet) => pallet.boxes.length > 0)
}

export function SortingPage() {
  const { message } = App.useApp()
  const { token } = theme.useToken()
  const waybillMap = useMemo(() => getSortingWaybillMap(), [])

  const [pageReady, setPageReady] = useState(false)
  const [setupOpen, setSetupOpen] = useState(true)
  const [pendingSlotCount, setPendingSlotCount] = useState(loadSlotCount)
  const [slotCount, setSlotCount] = useState(SORTING_SLOT_COUNT_DEFAULT)
  const [session, setSession] = useState<SortingSession | null>(null)
  const [palletSeq, setPalletSeq] = useState(SORTING_SLOT_COUNT_DEFAULT + 1)
  const [loading, setLoading] = useState(false)
  const [lastWaybill, setLastWaybill] = useState<SortingWaybill | null>(null)

  const panelStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
  } as const

  useEffect(() => {
    if (pageReady) {
      sessionStorage.setItem(SORTING_SLOT_COUNT_STORAGE_KEY, String(slotCount))
    }
  }, [slotCount, pageReady])

  const startSorting = () => {
    const next = Math.max(
      SORTING_SLOT_COUNT_MIN,
      Math.min(SORTING_SLOT_COUNT_MAX, pendingSlotCount),
    )
    setSlotCount(next)
    setSession(createSession(next))
    setPalletSeq(next + 1)
    setLastWaybill(null)
    setPageReady(true)
    setSetupOpen(false)
  }

  const resetSession = () => {
    setSession(createSession(slotCount))
    setPalletSeq(slotCount + 1)
    setLastWaybill(null)
  }

  const handleSlotFull = (palletIndex: number) => {
    if (!session) return
    const result = bindPallet(session, palletIndex, palletSeq)
    if (!result) return

    markPalletBound(result.boundBoxes.map((item) => item.箱号))
    setSession(result.session)
    setPalletSeq(result.nextSeq)
    message.success('绑托成功')
  }

  const handleScan = async (raw: string) => {
    if (!session) return

    setLoading(true)
    await wait(200)
    const result = lookupSortingBox(raw)
    setLoading(false)

    if (result.kind === 'missing') {
      message.error(SCAN_ERROR_MESSAGE.missing)
      return
    }
    if (result.kind === 'noForecast') {
      message.error(SCAN_ERROR_MESSAGE.noForecast)
      return
    }

    const { waybill, boxNo } = result
    if (isBoxAlreadyBound(boxNo)) {
      message.error(SCAN_ERROR_MESSAGE.alreadyBound)
      return
    }

    if (isBoxScanned(session, boxNo)) {
      message.error(SCAN_ERROR_MESSAGE.alreadyScanned)
      return
    }

    const target = resolveTargetPalletIndex(
      session,
      waybill,
      slotCount,
      waybillMap,
    )
    if (typeof target !== 'number') {
      message.error(SCAN_ERROR_MESSAGE[target])
      return
    }

    const nextSession = appendBoxToSession(session, target, {
      箱号: boxNo,
      运单号: waybill.运单号,
    })
    setSession(nextSession)
    setLastWaybill(waybill)
  }

  const scannedForLastWaybill = lastWaybill
    ? countWaybillScanned(session ?? createSession(slotCount), lastWaybill.运单号)
    : 0

  if (!pageReady) {
    return (
      <Modal
        title="选择作业托数"
        open={setupOpen}
        closable={false}
        maskClosable={false}
        okText="开始作业"
        cancelButtonProps={{ style: { display: 'none' } }}
        onOk={startSorting}
      >
        <div style={{ marginBottom: 12, color: token.colorTextSecondary }}>
          设置本次分货并行作业格数（1–10）
        </div>
        <InputNumber
          min={SORTING_SLOT_COUNT_MIN}
          max={SORTING_SLOT_COUNT_MAX}
          value={pendingSlotCount}
          onChange={(value) =>
            setPendingSlotCount(value ?? SORTING_SLOT_COUNT_DEFAULT)
          }
          style={{ width: '100%' }}
        />
        <div
          style={{
            marginTop: 12,
            color: token.colorTextSecondary,
            fontSize: 12,
          }}
        >
          N=1 单托单分（小票可混托）；N&gt;1 多托同分（新运单各占一格）
        </div>
      </Modal>
    )
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
        boxSizing: 'border-box',
      }}
    >
      <PdaNavBar title="分货" />

      <div
        style={{
          flexShrink: 0,
          margin: 12,
          marginBottom: 0,
          padding: 12,
          ...panelStyle,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
            gap: 8,
          }}
        >
          <Tag color="blue">作业托数 {slotCount}</Tag>
          <Tag>小票≤{SMALL_TICKET_MAX_PIECES}件</Tag>
        </div>
        <div
          style={{
            marginBottom: 8,
            color: token.colorTextSecondary,
            fontSize: 12,
          }}
        >
          {slotCount === 1
            ? '单托单分：1 个作业格，小票可混托'
            : `多托同分：${slotCount} 个作业格，新运单各占一格`}
        </div>
        <ScanInput
          placeholder="请扫描箱号"
          disabled={loading}
          loading={loading}
          onScan={(value) => {
            void handleScan(value)
          }}
        />
        {hasScannedData(session) ? (
          <Button
            type="link"
            size="small"
            style={{ padding: 0, marginTop: 8, height: 'auto' }}
            onClick={resetSession}
          >
            重置扫描
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div style={{ margin: 12, padding: 16, ...panelStyle }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : null}

      {!loading && session ? (
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
            {lastWaybill ? (
              <>
                <div>运单号：{lastWaybill.运单号}</div>
                <div style={{ marginTop: 8 }}>
                  预报：{lastWaybill.预报箱数}箱　已扫：{scannedForLastWaybill}箱　
                  {isSmallTicket(lastWaybill.预报箱数) ? (
                    <Tag color="cyan">小票</Tag>
                  ) : (
                    <Tag color="purple">大票</Tag>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  状态：
                  <StatusTag status={lastWaybill.状态} />
                </div>
              </>
            ) : (
              <div style={{ color: token.colorTextSecondary }}>
                扫描箱号后展示运单信息
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 12,
            }}
          >
            {session.pallets.map((pallet, index) => {
              const waybills = getPalletWaybills(pallet)
              const focused = index === session.activePalletIndex
              return (
                <Card
                  key={`${pallet.托号}-${index}`}
                  size="small"
                  title={
                    <button
                      type="button"
                      onClick={() =>
                        setSession({ ...session, activePalletIndex: index })
                      }
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        fontWeight: focused ? 600 : 400,
                        color: focused ? token.colorPrimary : token.colorText,
                      }}
                    >
                      作业格 {index + 1} · {pallet.托号}
                    </button>
                  }
                  extra={
                    <span>
                      {pallet.boxes.length}箱
                      {waybills.length > 0 ? ` / ${waybills.length}票` : ''}
                    </span>
                  }
                  style={{
                    marginBottom: 8,
                    border: `1px solid ${
                      focused ? token.colorPrimary : token.colorBorder
                    }`,
                    boxShadow: focused
                      ? `0 0 0 1px ${token.colorPrimaryBg}`
                      : undefined,
                  }}
                  styles={{ body: { paddingBottom: pallet.boxes.length > 0 ? 8 : 12 } }}
                >
                  {pallet.boxes.length === 0 ? (
                    <div style={{ color: token.colorTextSecondary }}>
                      暂无扫描箱号
                    </div>
                  ) : (
                    pallet.boxes.map((item) => {
                      const highlighted =
                        item.箱号 === session.highlightedBoxNo
                      return (
                        <div
                          key={item.箱号}
                          style={{
                            padding: '8px 0',
                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                            background: highlighted
                              ? token.colorPrimaryBg
                              : 'transparent',
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{item.箱号}</div>
                          <div style={{ color: token.colorTextSecondary }}>
                            运单 {item.运单号}
                          </div>
                        </div>
                      )
                    })
                  )}
                  {pallet.boxes.length > 0 ? (
                    <Button
                      type="primary"
                      block
                      style={{ marginTop: 12, height: 40 }}
                      onClick={() => handleSlotFull(index)}
                    >
                      托满
                    </Button>
                  ) : null}
                </Card>
              )
            })}
          </div>
        </>
      ) : (
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
          <Empty description="请扫描箱号开始分货" />
        </div>
      )}
    </div>
  )
}
