import type { ColumnsType } from 'antd/es/table'

import type {
  CandidateWaybill,
  OutboundDetailLine,
} from '@/domain/outbound-order/types'
import {
  formatVolume,
  formatWeight,
} from '@/domain/transfer-plan/constants'

function dash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

export const outboundDetailTableColumns: ColumnsType<OutboundDetailLine> = [
  { title: '运单号', dataIndex: '运单号', width: 140, fixed: 'left' },
  { title: '客户代码', dataIndex: '客户代码', width: 100 },
  {
    title: '装柜顺序',
    dataIndex: '装柜顺序',
    width: 90,
    render: (value) => dash(value),
  },
  {
    title: '出库渠道',
    dataIndex: '出库渠道',
    width: 160,
    ellipsis: true,
    render: (value) => dash(value),
  },
  {
    title: '品名',
    dataIndex: '品名',
    width: 100,
    render: (value) => dash(value),
  },
  {
    title: '客户备注',
    dataIndex: '客户备注',
    width: 100,
    render: (value) => dash(value),
  },
  {
    title: '内部备注',
    dataIndex: '内部备注',
    width: 100,
    render: (value) => dash(value),
  },
  {
    title: '目的仓库',
    dataIndex: '目的仓库',
    width: 100,
    render: (value) => dash(value),
  },
  {
    title: '目的邮编',
    dataIndex: '目的邮编',
    width: 100,
    render: (value) => dash(value),
  },
  { title: '件数', dataIndex: '箱数', width: 70 },
  {
    title: '重量',
    dataIndex: '重量',
    width: 90,
    render: (value: number) => formatWeight(value),
  },
  {
    title: '体积',
    dataIndex: '体积',
    width: 100,
    render: (value: number) => formatVolume(value),
  },
  {
    title: '预计到仓时间',
    dataIndex: '预计到仓时间',
    width: 160,
    render: (value) => dash(value),
  },
  {
    title: '状态',
    dataIndex: '状态',
    width: 90,
    render: (value) => dash(value),
  },
]

export const candidateWaybillModalColumns: ColumnsType<CandidateWaybill> = [
  { title: '运单号', dataIndex: '运单号' },
  { title: '客户代码', dataIndex: '客户代码', width: 120 },
  { title: '箱数', dataIndex: '箱数', width: 80 },
  {
    title: '重量',
    dataIndex: '重量',
    width: 100,
    render: (value: number) => formatWeight(value),
  },
  {
    title: '体积',
    dataIndex: '体积',
    width: 120,
    render: (value: number) => formatVolume(value),
  },
]

export function calcOutboundDetailSummary(lines: OutboundDetailLine[]) {
  const 计划件数 = lines.reduce((sum, line) => sum + line.箱数, 0)
  const 计划重量 = lines.reduce((sum, line) => sum + line.重量, 0)
  const 计划体积 = lines.reduce((sum, line) => sum + line.体积, 0)
  const 计划订单数 = lines.length

  return {
    收货计划件数: `${计划件数} / ${计划件数}`,
    收货计划重量: `${formatWeight(计划重量)} / ${formatWeight(计划重量)}`,
    收货计划体积: `${formatVolume(计划体积)} / ${formatVolume(计划体积)}`,
    收货计划订单数: `${计划订单数} / ${计划订单数}`,
  }
}
