/** 箱号 → 占用该箱库存的调拨计划单号（或其他占用方标识） */
const occupiedByBox = new Map<string, string>()

/** 运单号 → 占用该库存的调拨计划单号 */
const occupiedByWaybill = new Map<string, string>()

/** 原型演示：某托上部分箱已被其他计划占用（扫同托任一箱均拦截） */
occupiedByBox.set('FBA1988W5Y0GU000702', 'AT26010100999')

export function getOccupyingPlanForBox(箱号: string) {
  return occupiedByBox.get(箱号.trim().toUpperCase()) ?? null
}

export function isBoxLoadable(箱号: string, planNo: string) {
  const holder = getOccupyingPlanForBox(箱号)
  return holder == null || holder === planNo
}

export function occupyBoxes(planNo: string, 箱号列表: string[]) {
  for (const 箱号 of 箱号列表) {
    occupiedByBox.set(箱号.trim().toUpperCase(), planNo)
  }
}

export function getOccupyingPlanNo(运单号: string) {
  return occupiedByWaybill.get(运单号) ?? null
}

export function isWaybillLoadable(运单号: string, planNo: string) {
  const holder = getOccupyingPlanNo(运单号)
  return holder == null || holder === planNo
}

export function occupyWaybills(planNo: string, 运单号列表: string[]) {
  for (const 运单号 of 运单号列表) {
    occupiedByWaybill.set(运单号, planNo)
  }
}

/** PC 确认出库时释放占用并实扣（原型占位） */
export function releaseOccupiedByPlan(planNo: string) {
  for (const [箱号, holder] of occupiedByBox.entries()) {
    if (holder === planNo) {
      occupiedByBox.delete(箱号)
    }
  }
  for (const [运单号, holder] of occupiedByWaybill.entries()) {
    if (holder === planNo) {
      occupiedByWaybill.delete(运单号)
    }
  }
}
