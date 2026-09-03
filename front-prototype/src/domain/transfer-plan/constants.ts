/** 沿用现网六态（主 PRD §5.2；计划调拨走下架→复核，空单调拨装车直达已复核） */
export const TRANSFER_PLAN_STATUSES = [
  '待出库',
  '已下架',
  '已复核',
  '已出库',
  '已完成',
  '已取消',
] as const

export type TransferPlanStatus = (typeof TRANSFER_PLAN_STATUSES)[number]

/** 列表页状态 Tab（Demo PRD §1.2） */
export const TRANSFER_PLAN_TAB_KEYS = ['全部', ...TRANSFER_PLAN_STATUSES] as const

export type TransferPlanTabKey = (typeof TRANSFER_PLAN_TAB_KEYS)[number]

/** 状态 Tag 配色（Demo PRD §1.5） */
export const TRANSFER_PLAN_STATUS_COLOR: Record<TransferPlanStatus, string> = {
  待出库: 'blue',
  已下架: 'cyan',
  已复核: 'orange',
  已出库: 'gold',
  已完成: 'green',
  已取消: 'default',
}

/** 空单调拨 PDA 装车可进入的作业状态（调拨计划须仍为待出库） */
export const TRANSFER_PLAN_LOADABLE_STATUSES: TransferPlanStatus[] = ['待出库']

export const WAREHOUSE_TYPE_FRANCHISE = '加盟揽收仓' as const

export type WarehouseType = '加盟揽收仓' | '自营揽收仓' | '集货仓'

/** Mock 仓库档案；调出仓选项仅加盟揽收仓（R02） */
export const TRANSFER_WAREHOUSE_OPTIONS = [
  { code: 'NC', name: '南昌加盟仓', type: '加盟揽收仓' },
  { code: 'GZ', name: '赣州加盟仓', type: '加盟揽收仓' },
  { code: 'YW', name: '义乌紫鑫仓', type: '自营揽收仓' },
  { code: 'DG', name: '东莞集货仓', type: '集货仓' },
] as const satisfies ReadonlyArray<{
  code: string
  name: string
  type: WarehouseType
}>

export const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

/** 原型会话操作人占位；取消后期迭代（R17 预留） */
export const CURRENT_OPERATOR = '管理员'

export function formatWarehouse(code: string, name: string) {
  return `${code}(${name})`
}

export function getWarehouseLabel(code: string) {
  const found = TRANSFER_WAREHOUSE_OPTIONS.find((item) => item.code === code)
  return found ? formatWarehouse(found.code, found.name) : code
}

export function formatTabCount(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

export function formatWeight(value: number) {
  if (value === 0) return '0'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function formatVolume(value: number) {
  if (value === 0) return '0'
  return value.toFixed(6)
}
