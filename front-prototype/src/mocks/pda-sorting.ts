import type { SortingWaybill } from '@/domain/pda-sorting/types'

export type BoxLookup =
  | { kind: 'missing' }
  | { kind: 'noForecast' }
  | {
      kind: 'hit'
      waybill: SortingWaybill
      boxNo: string
    }

function boxNo(seq: number) {
  return `FBA1988W5Y0GU${String(seq).padStart(6, '0')}`
}

function range(from: number, count: number) {
  return Array.from({ length: count }, (_, index) => boxNo(from + index))
}

/** 无预报箱号（S08） */
export const UNFORECAST_BOX_NO = boxNo(888888)

const waybills: SortingWaybill[] = [
  {
    运单号: 'DSL26010128301',
    预报箱数: 30,
    状态: '待收货',
    预报箱号: range(351, 30),
    已绑托箱号: [],
  },
  {
    运单号: 'DSL26010128302',
    预报箱数: 8,
    状态: '待收货',
    预报箱号: range(381, 8),
    已绑托箱号: [],
  },
  {
    运单号: 'DSL26010128303',
    预报箱数: 5,
    状态: '待收货',
    预报箱号: range(389, 5),
    已绑托箱号: [],
  },
  {
    运单号: 'DSL26010128304',
    预报箱数: 6,
    状态: '待收货',
    预报箱号: range(394, 6),
    已绑托箱号: [],
  },
  {
    运单号: 'DSL26010128343',
    预报箱数: 350,
    状态: '待收货',
    预报箱号: range(1, 350),
    已绑托箱号: [],
  },
  {
    运单号: 'DSL26010128399',
    预报箱数: 1,
    状态: '已绑托',
    预报箱号: [boxNo(400)],
    已绑托箱号: [boxNo(400)],
  },
]

const boxIndex = new Map<string, SortingWaybill>()
for (const waybill of waybills) {
  for (const no of waybill.预报箱号) {
    boxIndex.set(no, waybill)
  }
}

export function getSortingWaybillMap() {
  return new Map(waybills.map((item) => [item.运单号, item]))
}

export function lookupSortingBox(raw: string): BoxLookup {
  const boxNoValue = raw.trim().toUpperCase()
  if (boxNoValue === UNFORECAST_BOX_NO) {
    return { kind: 'noForecast' }
  }
  const waybill = boxIndex.get(boxNoValue)
  if (!waybill) {
    return { kind: 'missing' }
  }
  return { kind: 'hit', waybill, boxNo: boxNoValue }
}

export function isBoxAlreadyBound(boxNo: string) {
  return waybills.some((waybill) => waybill.已绑托箱号.includes(boxNo))
}

export function markPalletBound(boxNos: string[]) {
  for (const boxNo of boxNos) {
    const waybill = boxIndex.get(boxNo)
    if (!waybill) continue
    if (!waybill.已绑托箱号.includes(boxNo)) {
      waybill.已绑托箱号.push(boxNo)
    }
    const allBound = waybill.预报箱号.every((no) =>
      waybill.已绑托箱号.includes(no),
    )
    if (allBound) {
      waybill.状态 = '已绑托'
    }
  }
}

export function listSortingWaybills() {
  return waybills
}
