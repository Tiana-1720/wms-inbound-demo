import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType } from '@ant-design/pro-components'
import { Tabs } from 'antd'
import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { TransferPlanCreateModal } from '@/components/transfer-plan/TransferPlanCreateModal'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  TRANSFER_PLAN_TAB_KEYS,
  formatTabCount,
} from '@/domain/transfer-plan/constants'
import type { TransferPlanTabKey } from '@/domain/transfer-plan/constants'
import {
  applyTransferPlanFilters,
  applyTransferPlanTabFilter,
  countByTransferPlanTab,
  mapProTableParamsToTransferFilters,
  paginateTransferPlans,
  sortTransferPlans,
} from '@/domain/transfer-plan/filter'
import { listTransferPlans } from '@/domain/transfer-plan/store'
import { canCreateTransferPlan } from '@/domain/transfer-plan/permissions'
import {
  TransferPlanCreateButton,
  getTransferPlanColumns,
} from '@/pages/transfer-plan/transferPlanColumns'
import { useCurrentUser } from '@/session/CurrentUserContext'

type ListLocationState = {
  statusTab?: TransferPlanTabKey
}

type TransferPlanListPageProps = {
  initialCreateModalOpen?: boolean
}

export function TransferPlanListPage({
  initialCreateModalOpen = false,
}: TransferPlanListPageProps = {}) {
  const location = useLocation()
  const { user } = useCurrentUser()
  const actionRef = useRef<ActionType>(null)
  const canCreate = canCreateTransferPlan(user.role)
  const initialTab =
    (location.state as ListLocationState | null)?.statusTab ?? '全部'
  const [activeTab, setActiveTab] = useState<TransferPlanTabKey>(initialTab)
  const [createModalOpen, setCreateModalOpen] = useState(
    initialCreateModalOpen && canCreate,
  )
  const [tabCounts, setTabCounts] = useState<
    Record<TransferPlanTabKey, number>
  >(() => countByTransferPlanTab(listTransferPlans()))

  const columns = getTransferPlanColumns()

  const handleTabChange = (key: string) => {
    setActiveTab(key as TransferPlanTabKey)
    actionRef.current?.reloadAndRest?.()
  }

  const handleCreateSuccess = () => {
    setActiveTab('待出库')
    actionRef.current?.reloadAndRest?.()
  }

  return (
    <div data-anno="transfer-plan-list-page">
      <PageContainer title="调拨计划" ghost>
        <Tabs
          data-anno="transfer-plan-status-tabs"
          activeKey={activeTab}
          onChange={handleTabChange}
          items={TRANSFER_PLAN_TAB_KEYS.map((key) => ({
            key,
            label: `${key} (${formatTabCount(tabCounts[key])})`,
          }))}
          style={{ marginBottom: 16 }}
        />

        <ProTable
          actionRef={actionRef}
          rowKey="调拨计划单号"
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
            collapseRender: false,
            searchText: '查询',
            resetText: '重置',
          }}
          options={false}
          headerTitle={
            canCreate ? (
              <span data-anno="transfer-plan-toolbar">
                <TransferPlanCreateButton
                  onClick={() => setCreateModalOpen(true)}
                />
              </span>
            ) : undefined
          }
          toolBarRender={() => []}
          columns={columns}
          pagination={{
            defaultPageSize: DEFAULT_PAGE_SIZE,
            pageSizeOptions: [...PAGE_SIZE_OPTIONS],
            showSizeChanger: true,
          }}
          request={async (params) => {
            const filters = mapProTableParamsToTransferFilters(params)
            const filtered = applyTransferPlanTabFilter(
              applyTransferPlanFilters(sortTransferPlans(listTransferPlans()), filters),
              activeTab,
            )
            setTabCounts(countByTransferPlanTab(listTransferPlans()))
            const page = params.current ?? 1
            const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
            const pageData = paginateTransferPlans(filtered, page, pageSize)
            return {
              data: pageData.items,
              success: true,
              total: pageData.total,
            }
          }}
          scroll={{ x: 1200 }}
        />

        <TransferPlanCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </PageContainer>
    </div>
  )
}
