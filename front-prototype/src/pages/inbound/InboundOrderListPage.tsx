import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType } from '@ant-design/pro-components'
import { Tabs } from 'antd'
import { useMemo, useRef, useState } from 'react'

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  STATUS_TAB_KEYS,
  formatTabCount,
} from '@/domain/inbound-order/constants'
import type { StatusTabKey } from '@/domain/inbound-order/constants'
import {
  applyInboundOrderFilters,
  applyStatusTabFilter,
  countByStatusTab,
  mapProTableParamsToFilters,
  paginateInboundOrders,
  sortInboundOrders,
} from '@/domain/inbound-order/filter'
import type { InboundOrder } from '@/domain/inbound-order/types'
import { inboundOrderMockData } from '@/mocks/inbound-orders'
import { getInboundOrderColumns } from '@/pages/inbound/inboundOrderColumns'

export function InboundOrderListPage() {
  const actionRef = useRef<ActionType>(null)
  const [activeTab, setActiveTab] = useState<StatusTabKey>('全部')
  const [tabCounts, setTabCounts] = useState<Record<StatusTabKey, number>>(
    () => countByStatusTab(inboundOrderMockData),
  )

  const columns = useMemo(() => getInboundOrderColumns(), [])

  const handleTabChange = (key: string) => {
    setActiveTab(key as StatusTabKey)
    actionRef.current?.reloadAndRest?.()
  }

  return (
    <div data-anno="inbound-order-page">
      <PageContainer title="收货订单" ghost>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={STATUS_TAB_KEYS.map((tab) => ({
            key: tab,
            label: `${tab} (${formatTabCount(tabCounts[tab])})`,
          }))}
          style={{ marginBottom: 16, background: '#fff', padding: '0 16px' }}
        />

        <ProTable<InboundOrder>
          actionRef={actionRef}
          rowKey="收货单号"
          columns={columns}
          params={{ activeTab }}
          request={async (params) => {
            await new Promise((resolve) => setTimeout(resolve, 200))

            const filters = mapProTableParamsToFilters(params)
            const filteredByQuery = applyInboundOrderFilters(
              inboundOrderMockData,
              filters,
            )
            setTabCounts(countByStatusTab(filteredByQuery))

            const tabbed = applyStatusTabFilter(
              filteredByQuery,
              params.activeTab as StatusTabKey,
            )
            const sorted = sortInboundOrders(tabbed)
            const page = Number(params.current ?? 1)
            const pageSize = Number(params.pageSize ?? DEFAULT_PAGE_SIZE)
            const pagination = paginateInboundOrders(sorted, page, pageSize)

            return {
              data: pagination.items,
              success: true,
              total: pagination.total,
            }
          }}
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
            searchText: '查询',
            resetText: '重置',
            span: { xs: 24, sm: 12, md: 8, lg: 8, xl: 6, xxl: 4 },
          }}
          form={{
            ignoreRules: false,
          }}
          pagination={{
            defaultPageSize: DEFAULT_PAGE_SIZE,
            pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          options={{
            reload: true,
            density: true,
            setting: { draggable: true },
          }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: '暂无收货订单' }}
          toolBarRender={() => []}
          headerTitle={false}
        />
      </PageContainer>
    </div>
  )
}
