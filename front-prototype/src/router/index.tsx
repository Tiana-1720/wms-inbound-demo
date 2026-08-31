import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { ProAppLayout } from '@/components/layout/ProAppLayout'
import {
  INBOUND_ORDER_LIST_PATH,
  TRANSFER_PLAN_LIST_PATH,
  getTransferPlanDetailPath,
} from '@/config/routes'
import { InboundOrderListPage } from '@/pages/inbound/InboundOrderListPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { TransferPlanCreatePage } from '@/pages/transfer-plan/TransferPlanCreatePage'
import { TransferPlanDetailPage } from '@/pages/transfer-plan/TransferPlanDetailPage'
import { TransferPlanListPage } from '@/pages/transfer-plan/TransferPlanListPage'

function LegacyTransferPlanDetailRedirect() {
  const { id = '' } = useParams()
  return <Navigate to={getTransferPlanDetailPath(id)} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ProAppLayout />}>
        <Route index element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />} />

        <Route path="order/Inbound" element={<InboundOrderListPage />} />
        <Route
          path="order/Inbound/:id"
          element={<PlaceholderPage title="收货订单详情" />}
        />
        <Route
          path="order/receiving-orders"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />
        <Route
          path="order/receiving-orders/:id"
          element={<PlaceholderPage title="收货订单详情" />}
        />

        <Route
          path="orders/receiving"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />
        <Route
          path="orders/receiving/new"
          element={<PlaceholderPage title="新增收货订单" />}
        />
        <Route
          path="orders/receiving/:id"
          element={<PlaceholderPage title="收货订单详情" />}
        />
        <Route
          path="orders/receiving/:id/edit"
          element={<PlaceholderPage title="编辑收货订单" />}
        />

        <Route path="order/TransferPlan" element={<TransferPlanListPage />} />
        <Route
          path="order/TransferPlan/new"
          element={<TransferPlanCreatePage />}
        />
        <Route
          path="order/TransferPlan/:id"
          element={<TransferPlanDetailPage />}
        />

        <Route
          path="orders/transfer-plans"
          element={<Navigate to={TRANSFER_PLAN_LIST_PATH} replace />}
        />
        <Route
          path="orders/transfer-plans/new"
          element={<Navigate to={`${TRANSFER_PLAN_LIST_PATH}/new`} replace />}
        />
        <Route
          path="orders/transfer-plans/:id/edit"
          element={<LegacyTransferPlanDetailRedirect />}
        />
        <Route
          path="orders/transfer-plans/:id"
          element={<LegacyTransferPlanDetailRedirect />}
        />

        <Route
          path="sales/orders"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />
        <Route
          path="sales/orders/new"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />
        <Route
          path="sales/orders/:id"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />
        <Route
          path="sales/orders/:id/edit"
          element={<Navigate to={INBOUND_ORDER_LIST_PATH} replace />}
        />

        <Route
          path="*"
          element={
            <PlaceholderPage title="页面未找到" description="该菜单页面尚未实现" />
          }
        />
      </Route>
    </Routes>
  )
}
