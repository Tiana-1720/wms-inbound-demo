import { PageContainer } from '@ant-design/pro-components'
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Space,
  Table,
} from 'antd'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { OutboundOrderStatusTag } from '@/components/outbound-order/OutboundOrderStatusTag'
import { OUTBOUND_ORDER_LIST_PATH } from '@/config/routes'
import {
  getOutboundOrder,
  listCandidateWaybills,
  mergeOutboundDetailPreview,
  saveOutboundWaybillLinks,
} from '@/domain/outbound-order/store'
import type { CandidateWaybill } from '@/domain/outbound-order/types'
import {
  calcOutboundDetailSummary,
  candidateWaybillModalColumns,
  outboundDetailTableColumns,
} from '@/pages/outbound/outboundDetailColumns'

export function OutboundLinkWaybillPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { message } = App.useApp()
  const [tick, setTick] = useState(0)
  const [selectModalOpen, setSelectModalOpen] = useState(false)
  const [modalKeyword, setModalKeyword] = useState('')
  const [modalSearchKeyword, setModalSearchKeyword] = useState('')
  const [modalSelectedKeys, setModalSelectedKeys] = useState<string[]>([])
  const [modalSelectedRows, setModalSelectedRows] = useState<CandidateWaybill[]>(
    [],
  )
  const [pendingCandidates, setPendingCandidates] = useState<
    CandidateWaybill[]
  >([])

  const order = useMemo(() => getOutboundOrder(id), [id, tick])

  const savedKeys = useMemo(
    () => (order?.明细 ?? []).map((line) => line.运单号),
    [order],
  )

  const modalCandidates = useMemo(
    () => listCandidateWaybills(id, modalSearchKeyword),
    [id, modalSearchKeyword, tick, selectModalOpen],
  )

  const previewLines = useMemo(
    () => mergeOutboundDetailPreview(id, pendingCandidates),
    [id, pendingCandidates, tick],
  )

  const summary = useMemo(
    () => calcOutboundDetailSummary(previewLines),
    [previewLines],
  )

  const hasUnsavedChanges = pendingCandidates.length > 0
  const canEdit = order && ['待出库', '已复核'].includes(order.状态)

  const goList = () => {
    navigate(OUTBOUND_ORDER_LIST_PATH)
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '放弃未保存的关联？',
        okText: '放弃',
        cancelText: '继续编辑',
        onOk: goList,
      })
      return
    }
    goList()
  }

  const refresh = () => setTick((value) => value + 1)

  const openSelectModal = () => {
    const pendingKeys = pendingCandidates.map((item) => item.运单号)
    setModalKeyword('')
    setModalSearchKeyword('')
    setModalSelectedKeys([...new Set([...savedKeys, ...pendingKeys])])
    setModalSelectedRows(pendingCandidates)
    setSelectModalOpen(true)
  }

  const handleModalSearch = () => {
    setModalSearchKeyword(modalKeyword.trim())
  }

  const handleModalSelectionChange = (
    keys: React.Key[],
    rows: CandidateWaybill[],
  ) => {
    const nextKeys = keys as string[]
    setModalSelectedKeys(nextKeys)
    setModalSelectedRows((prev) => {
      const keySet = new Set(nextKeys.filter((key) => !savedKeys.includes(key)))
      const merged = new Map<string, CandidateWaybill>()
      for (const row of prev) {
        if (keySet.has(row.运单号)) merged.set(row.运单号, row)
      }
      for (const row of rows) {
        if (row?.运单号 && keySet.has(row.运单号)) merged.set(row.运单号, row)
      }
      for (const row of modalCandidates) {
        if (row?.运单号 && keySet.has(row.运单号)) merged.set(row.运单号, row)
      }
      return Array.from(merged.values())
    })
  }

  const handleModalRowSelect = (record: CandidateWaybill, selected: boolean) => {
    if (!record?.运单号) return
    if (savedKeys.includes(record.运单号)) return
    if (selected && !record.可关联) {
      message.error('可用库存不足')
    }
  }

  const handleModalConfirm = () => {
    const pool = new Map<string, CandidateWaybill>()
    for (const item of [
      ...modalSelectedRows,
      ...modalCandidates,
      ...listCandidateWaybills(id, ''),
    ]) {
      if (item?.运单号) pool.set(item.运单号, item)
    }
    const newSelections = modalSelectedKeys
      .filter((key) => !savedKeys.includes(key))
      .map((key) => pool.get(key))
      .filter(Boolean) as CandidateWaybill[]
    if (newSelections.length === 0) {
      message.error('请至少选择一票运单')
      return
    }
    setPendingCandidates(newSelections)
    setSelectModalOpen(false)
  }

  const handleModalCancel = () => {
    setSelectModalOpen(false)
  }

  const handleSave = () => {
    if (!order) return
    const pendingKeys = pendingCandidates.map((item) => item.运单号)
    if (pendingKeys.length === 0) {
      message.error('请至少选择一票运单')
      return
    }

    const result = saveOutboundWaybillLinks(order.出库单号, pendingKeys)
    if (result === 'ok') {
      message.success('关联成功')
      setPendingCandidates([])
      refresh()
      return
    }
    if (result === 'no-selection') {
      message.error('请至少选择一票运单')
      return
    }
    if (result === 'insufficient-stock') {
      message.error('可用库存不足')
      return
    }
    message.error('保存失败')
  }

  if (!order) {
    return (
      <PageContainer title="出库单 · 关联运单" ghost onBack={goList}>
        <Result
          status="404"
          title="出库单不存在"
          extra={
            <Button type="primary" onClick={goList}>
              返回列表
            </Button>
          }
        />
      </PageContainer>
    )
  }

  if (order.状态 === '已出库') {
    return (
      <PageContainer title="出库单 · 关联运单" ghost onBack={goList}>
        <Result
          status="403"
          title="当前出库单已出库，不可关联运单"
          extra={
            <Button type="primary" onClick={goList}>
              返回列表
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const summaryItems = [
    { label: '收货计划件数', value: summary.收货计划件数 },
    { label: '收货计划重量(KG)', value: summary.收货计划重量 },
    { label: '收货计划体积(CBM)', value: summary.收货计划体积 },
    { label: '收货计划订单数', value: summary.收货计划订单数 },
  ]

  return (
    <div data-anno="outbound-link-waybill-page">
      <PageContainer
        title="出库单 · 关联运单"
        ghost
        onBack={handleBack}
      >
        <Card
          data-anno="outbound-link-waybill-header"
          style={{ marginBottom: 16 }}
          styles={{ body: { paddingBottom: 8 } }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 48,
              paddingBottom: 16,
              marginBottom: 16,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>出库计划号：</span>
              <span>{order.计划单号}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(0,0,0,0.45)' }}>状态：</span>
              <OutboundOrderStatusTag status={order.状态} />
            </div>
          </div>
          <Form layout="vertical" disabled>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="柜号">
                  <Input placeholder="请输入" value={order.柜号 ?? ''} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="电话">
                  <Input placeholder="请输入" value={order.电话 ?? ''} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="车牌号">
                  <Input placeholder="请输入" value={order.车牌号 ?? ''} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card
          title="出库明细"
          data-anno="outbound-link-waybill-lines"
          styles={{ body: { paddingTop: 12 } }}
        >
          {canEdit ? (
            <div
              data-anno="outbound-link-waybill-select"
              style={{ marginBottom: 12 }}
            >
              <Button type="primary" onClick={openSelectModal}>
                选择运单
              </Button>
              {pendingCandidates.length > 0 ? (
                <span style={{ marginLeft: 12, color: 'rgba(0,0,0,0.45)' }}>
                  已选 {pendingCandidates.length} 票（待保存）
                </span>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              padding: '12px 16px',
              marginBottom: 16,
              background: '#e6f4ff',
              borderRadius: 4,
            }}
          >
            {summaryItems.map((item) => (
              <div key={item.label}>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>{item.label}：</span>
                <span style={{ fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
          <Table
            rowKey="运单号"
            dataSource={previewLines}
            columns={outboundDetailTableColumns}
            pagination={false}
            scroll={{ x: 1500 }}
            locale={{ emptyText: '暂无关联运单' }}
          />
        </Card>

        <div
          data-anno="outbound-link-waybill-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 16,
            padding: '16px 24px',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
          }}
        >
          {canEdit ? (
            <>
              <Button onClick={handleBack}>取消</Button>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                确定
              </Button>
            </>
          ) : (
            <Button onClick={handleBack}>返回列表</Button>
          )}
        </div>
      </PageContainer>

      <Modal
        title="选择运单"
        open={selectModalOpen}
        width={800}
        destroyOnClose
        maskClosable={false}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleModalConfirm}>
            确定
          </Button>,
        ]}
        styles={{
          body: { maxHeight: '60vh', overflow: 'auto' },
        }}
        data-anno="outbound-link-waybill-select-modal"
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            allowClear
            placeholder="运单号,多个用逗号或空格隔开"
            value={modalKeyword}
            onChange={(event) => setModalKeyword(event.target.value)}
            onPressEnter={handleModalSearch}
            style={{ width: 320 }}
          />
          <Button type="primary" onClick={handleModalSearch}>
            查询
          </Button>
        </Space>
        <div style={{ marginBottom: 12, color: 'rgba(0,0,0,0.45)' }}>
          仅展示收货仓库为当前仓库（{order.归属仓库}）的已上架运单
        </div>
        <Table<CandidateWaybill>
          rowKey="运单号"
          dataSource={modalCandidates}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ y: 320 }}
          rowSelection={{
            selectedRowKeys: modalSelectedKeys,
            onChange: handleModalSelectionChange,
            preserveSelectedRowKeys: true,
            getCheckboxProps: (record) => ({
              disabled:
                !record?.运单号 ||
                savedKeys.includes(record.运单号) ||
                !record.可关联,
            }),
            onSelect: handleModalRowSelect,
          }}
          columns={candidateWaybillModalColumns}
        />
      </Modal>
    </div>
  )
}
