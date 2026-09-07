import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType } from '@ant-design/pro-components'
import { Tabs, message } from 'antd'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  DEFAULT_PAGE_SIZE,
  OUTBOUND_TAB_KEYS,
  PAGE_SIZE_OPTIONS,
  formatTabCount,
} from '@/domain/outbound-order/constants'
import type { OutboundTabKey } from '@/domain/outbound-order/constants'
import {
  applyOutboundFilters,
  applyOutboundTabFilter,
  countByOutboundTab,
  mapProTableParamsToOutboundFilters,
  paginateOutboundOrders,
  sortOutboundOrders,
} from '@/domain/outbound-order/filter'
import type { OutboundOrder } from '@/domain/outbound-order/types'
import { listOutboundOrders } from '@/domain/outbound-order/store'
import { getOutboundOrderColumns } from '@/pages/outbound/outboundOrderColumns'

function getEmptyText(tab: OutboundTabKey) {
  return tab === '全部' ? '暂无出库单' : '当前状态下暂无数据'
}

export function OutboundOrderListPage() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>(null)
  const [activeTab, setActiveTab] = useState<OutboundTabKey>('全部')
  const [tabCounts, setTabCounts] = useState<Record<OutboundTabKey, number>>(
    () => countByOutboundTab(listOutboundOrders()),
  )
  const [reloadTick, setReloadTick] = useState(0)

  const handleActionComplete = () => {
    setReloadTick((value) => value + 1)
    actionRef.current?.reload()
  }

  const columns = useMemo(
    () =>
      getOutboundOrderColumns({
        navigate,
        onActionComplete: handleActionComplete,
      }),
    [navigate, reloadTick],
  )

  const handleTabChange = (key: string) => {
    setActiveTab(key as OutboundTabKey)
    actionRef.current?.reloadAndRest?.()
  }

  return (
    <div data-anno="outbound-order-list-page">
      <PageContainer title="出库列表" ghost>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={OUTBOUND_TAB_KEYS.map((tab) => ({
            key: tab,
            label: `${tab} (${formatTabCount(tabCounts[tab])})`,
          }))}
          style={{ marginBottom: 16, background: '#fff', padding: '0 16px' }}
        />

        <ProTable<OutboundOrder>
          actionRef={actionRef}
          rowKey="出库单号"
          columns={columns}
          params={{ activeTab, reloadTick }}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
            searchText: '查询',
            resetText: '重置',
            span: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 4 },
          }}
          request={async (params) => {
            await new Promise((resolve) => setTimeout(resolve, 200))

            try {
              const filters = mapProTableParamsToOutboundFilters(params)
              const filteredByQuery = applyOutboundFilters(
                listOutboundOrders(),
                filters,
              )
              setTabCounts(countByOutboundTab(filteredByQuery))

              const tabbed = applyOutboundTabFilter(
                filteredByQuery,
                params.activeTab as OutboundTabKey,
              )
              const sorted = sortOutboundOrders(tabbed)
              const page = Number(params.current ?? 1)
              const pageSize = Number(params.pageSize ?? DEFAULT_PAGE_SIZE)
              const pagination = paginateOutboundOrders(sorted, page, pageSize)

              return {
                data: pagination.items,
                success: true,
                total: pagination.total,
              }
            } catch {
              message.error('加载失败，请重试')
              return {
                data: [],
                success: false,
                total: 0,
              }
            }
          }}
          pagination={{
            defaultPageSize: DEFAULT_PAGE_SIZE,
            pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          options={{
            reload: true,
            density: true,
            setting: { draggable: true },
          }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: getEmptyText(activeTab) }}
          toolBarRender={() => []}
          headerTitle={false}
        />
      </PageContainer>
    </div>
  )
}
