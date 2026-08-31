import type { ReactNode } from 'react'
import type { ProColumns } from '@ant-design/pro-components'
import { Typography } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

import { getInboundOrderDetailPath } from '@/config/routes'
import { StatusTag } from '@/components/inbound-order/StatusTag'
import {
  BUSINESS_OWNERSHIPS,
  BUSINESS_TYPES,
  COUNTRY_OPTIONS,
  TRANSPORT_TYPES,
  WAREHOUSE_OPTIONS,
  formatWarehouse,
} from '@/domain/inbound-order/constants'
import { displayNumber, displayValue } from '@/domain/inbound-order/filter'
import type { InboundOrder } from '@/domain/inbound-order/types'

const warehouseOptions = WAREHOUSE_OPTIONS.map((item) => ({
  label: formatWarehouse(item.code, item.name),
  value: formatWarehouse(item.code, item.name),
}))

const countryOptions = COUNTRY_OPTIONS.map((item) => ({
  label: `${item.code} - ${item.label}`,
  value: item.label,
}))

function StackedCell({
  primary,
  secondary,
  primaryBold = false,
}: {
  primary: ReactNode
  secondary: ReactNode
  primaryBold?: boolean
}) {
  return (
    <div>
      <div style={primaryBold ? { fontWeight: 500 } : undefined}>{primary}</div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {secondary}
      </Typography.Text>
    </div>
  )
}

/** 列表页查询区 12 项（Demo PRD V1.1 §1.3） */
export function getInboundOrderColumns(): ProColumns<InboundOrder>[] {
  return [
    {
      title: '运单号',
      dataIndex: '运单号',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell
          primary={record.运单号}
          secondary={displayValue(record.参考号)}
          primaryBold
        />
      ),
    },
    {
      title: '运单号',
      dataIndex: '运单号',
      hideInTable: true,
      order: 10,
      fieldProps: { placeholder: '运单号,多个用逗号或空格隔开' },
    },
    {
      title: '参考号',
      dataIndex: '参考号',
      hideInTable: true,
      order: 9,
      fieldProps: { placeholder: '参考号,多个用逗号或空格隔开' },
    },
    {
      title: '收货单号',
      dataIndex: '收货单号',
      width: 140,
      fixed: 'left',
      hideInSearch: true,
      render: (_, record) => (
        <Link to={getInboundOrderDetailPath(record.收货单号)}>
          {record.收货单号}
        </Link>
      ),
    },
    {
      title: '收货单号',
      dataIndex: '收货单号',
      hideInTable: true,
      order: 8,
      fieldProps: { placeholder: '收货单号,多个用逗号或空格隔开' },
    },
    {
      title: '客户代码',
      dataIndex: '客户代码',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '客户代码',
      dataIndex: '客户代码',
      hideInTable: true,
      order: 7,
    },
    {
      title: '渠道',
      dataIndex: '渠道',
      width: 140,
      hideInSearch: true,
      render: (_, record) => displayValue(record.渠道),
    },
    {
      title: '渠道',
      dataIndex: '渠道',
      hideInTable: true,
      order: 6,
    },
    {
      title: '目的国 / 目的仓库',
      dataIndex: '目的国',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell primary={record.目的国} secondary={record.目的仓库} />
      ),
    },
    {
      title: '收货仓库',
      dataIndex: '收货仓库',
      valueType: 'select',
      hideInTable: true,
      order: 5,
      fieldProps: {
        mode: 'multiple',
        showSearch: true,
        options: warehouseOptions,
        placeholder: '请选择收货仓库',
      },
    },
    {
      title: '目的国',
      dataIndex: '目的国',
      valueType: 'select',
      hideInTable: true,
      order: 4,
      fieldProps: {
        mode: 'multiple',
        showSearch: true,
        options: countryOptions,
        placeholder: '请选择目的国',
      },
    },
    {
      title: '业务类型',
      dataIndex: '业务类型',
      width: 80,
      order: 3,
      valueType: 'select',
      fieldProps: {
        options: BUSINESS_TYPES.map((value) => ({ label: value, value })),
      },
    },
    {
      title: '业务归属',
      dataIndex: '业务归属',
      width: 80,
      order: 2,
      valueType: 'select',
      fieldProps: {
        options: BUSINESS_OWNERSHIPS.map((value) => ({ label: value, value })),
      },
    },
    {
      title: '运输类型',
      dataIndex: '运输类型',
      width: 80,
      order: 1,
      valueType: 'select',
      fieldProps: {
        options: TRANSPORT_TYPES.map((value) => ({ label: value, value })),
      },
    },
    {
      title: '预计到仓日期',
      dataIndex: '预计到仓DateRange',
      valueType: 'dateRange',
      hideInTable: true,
      order: 0,
      search: {
        transform: (value) => {
          if (!value?.length) return {}
          return {
            预计到仓时间起: dayjs(value[0]).format('YYYY-MM-DD'),
            预计到仓时间止: dayjs(value[1]).format('YYYY-MM-DD'),
          }
        },
      },
      fieldProps: {
        placeholder: ['预计到仓开始日期', '预计到仓结束日期'],
      },
    },
    {
      title: '收货日期',
      dataIndex: '收货DateRange',
      valueType: 'dateRange',
      hideInTable: true,
      order: -1,
      search: {
        transform: (value) => {
          if (!value?.length) return {}
          return {
            收货时间起: dayjs(value[0]).format('YYYY-MM-DD'),
            收货时间止: dayjs(value[1]).format('YYYY-MM-DD'),
          }
        },
      },
      fieldProps: {
        placeholder: ['收货开始日期', '收货结束日期'],
      },
    },
    {
      title: '收货箱数 / 预报箱数',
      dataIndex: '收货箱数',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell
          primary={displayNumber(record.收货箱数)}
          secondary={displayNumber(record.预报箱数)}
        />
      ),
    },
    {
      title: '收货重量 / 预报重量',
      dataIndex: '收货重量',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell
          primary={displayNumber(record.收货重量)}
          secondary={displayNumber(record.预报重量)}
        />
      ),
    },
    {
      title: '收货体积 / 预报体积',
      dataIndex: '收货体积',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell
          primary={displayNumber(record.收货体积)}
          secondary={displayNumber(record.预报体积)}
        />
      ),
    },
    {
      title: '收货仓库 / 预报仓库',
      dataIndex: '收货仓库',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <StackedCell
          primary={displayValue(record.收货仓库)}
          secondary={record.预报仓库}
        />
      ),
    },
    {
      title: '预计到仓时间',
      dataIndex: '预计到仓时间',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '收货时间',
      dataIndex: '收货时间',
      width: 160,
      hideInSearch: true,
      render: (_, record) => displayValue(record.收货时间),
    },
    {
      title: '状态',
      dataIndex: '状态',
      width: 100,
      hideInSearch: true,
      render: (_, record) => <StatusTag status={record.状态} />,
    },
    {
      title: '创建时间',
      dataIndex: '创建时间',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '最后修改时间',
      dataIndex: '最后修改时间',
      width: 160,
      hideInSearch: true,
    },
  ]
}
