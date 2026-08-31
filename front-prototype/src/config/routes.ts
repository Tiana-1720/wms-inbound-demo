/** 收货订单列表页路由（统一口径） */
export const INBOUND_ORDER_LIST_PATH = '/order/Inbound'

/** 收货订单详情页路由 */
export function getInboundOrderDetailPath(receiptNo: string) {
  return `${INBOUND_ORDER_LIST_PATH}/${receiptNo}`
}
