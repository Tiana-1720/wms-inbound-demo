/** 运单号 → 占用该库存的调拨计划单号 */
const occupiedByWaybill = new Map<string, string>()

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
  for (const [运单号, holder] of occupiedByWaybill.entries()) {
    if (holder === planNo) {
      occupiedByWaybill.delete(运单号)
    }
  }
}
