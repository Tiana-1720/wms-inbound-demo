/** 收货订单列表页路由（统一口径） */
export const INBOUND_ORDER_LIST_PATH = '/order/Inbound'

/** 收货订单详情页路由 */
export function getInboundOrderDetailPath(receiptNo: string) {
  return `${INBOUND_ORDER_LIST_PATH}/${receiptNo}`
}

/** 调拨计划列表页路由（Demo PRD §1.1） */
export const TRANSFER_PLAN_LIST_PATH = '/order/TransferPlan'

export function getTransferPlanCreatePath() {
  return `${TRANSFER_PLAN_LIST_PATH}/new`
}

export function getTransferPlanDetailPath(planNo: string) {
  return `${TRANSFER_PLAN_LIST_PATH}/${planNo}`
}
