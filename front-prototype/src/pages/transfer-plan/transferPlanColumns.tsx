import type { ProColumns } from '@ant-design/pro-components'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

import { TransferPlanStatusTag } from '@/components/transfer-plan/TransferPlanStatusTag'
import { getTransferPlanDetailPath } from '@/config/routes'
import {
  TRANSFER_WAREHOUSE_OPTIONS,
  formatVolume,
  formatWarehouse,
  formatWeight,
  getWarehouseLabel,
} from '@/domain/transfer-plan/constants'
import type { TransferPlan } from '@/domain/transfer-plan/types'

const warehouseOptions = TRANSFER_WAREHOUSE_OPTIONS.map((item) => ({
  label: formatWarehouse(item.code, item.name),
  value: item.code,
}))

export function getTransferPlanColumns(): ProColumns<TransferPlan>[] {
  return [
    {
      title: '调拨计划单号',
      dataIndex: '调拨计划单号',
      width: 180,
      fixed: 'left',
      hideInSearch: true,
      render: (_, record) => (
        <Link to={getTransferPlanDetailPath(record.调拨计划单号)}>
          {record.调拨计划单号}
        </Link>
      ),
    },
    {
      title: '调拨计划单号',
      dataIndex: '调拨计划单号',
      hideInTable: true,
      order: 5,
      fieldProps: { placeholder: '调拨计划单号' },
    },
    {
      title: '运单号',
      dataIndex: '运单号',
      hideInTable: true,
      order: 4,
      fieldProps: { placeholder: '运单号' },
    },
    {
      title: '调出仓库',
      dataIndex: '调出仓库',
      width: 160,
      hideInSearch: true,
      render: (_, record) => getWarehouseLabel(record.调出仓库),
    },
    {
      title: '调出仓库',
      dataIndex: '调出仓库',
      valueType: 'select',
      hideInTable: true,
      order: 3,
      fieldProps: {
        mode: 'multiple',
        showSearch: true,
        optionFilterProp: 'label',
        options: warehouseOptions,
        placeholder: '调出仓库',
      },
    },
    {
      title: '调入仓库',
      dataIndex: '调入仓库',
      width: 160,
      hideInSearch: true,
      render: (_, record) => getWarehouseLabel(record.调入仓库),
    },
    {
      title: '调入仓库',
      dataIndex: '调入仓库',
      valueType: 'select',
      hideInTable: true,
      order: 2,
      fieldProps: {
        mode: 'multiple',
        showSearch: true,
        optionFilterProp: 'label',
        options: warehouseOptions,
        placeholder: '调入仓库',
      },
    },
    {
      title: '箱数',
      dataIndex: '箱数',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '重量',
      dataIndex: '重量',
      width: 100,
      hideInSearch: true,
      render: (_, record) => formatWeight(record.重量),
    },
    {
      title: '体积',
      dataIndex: '体积',
      width: 100,
      hideInSearch: true,
      render: (_, record) => formatVolume(record.体积),
    },
    {
      title: '状态',
      dataIndex: '状态',
      width: 100,
      hideInSearch: true,
      render: (_, record) => <TransferPlanStatusTag status={record.状态} />,
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
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => (
        <Link to={getTransferPlanDetailPath(record.调拨计划单号)}>查看</Link>
      ),
    },
  ]
}

export function TransferPlanCreateButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Button type="primary" onClick={onClick}>
      新增
    </Button>
  )
}
