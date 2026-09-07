import type { ProColumns } from '@ant-design/pro-components'
import { Dropdown, Modal, Progress, Space, Tag, Typography, message } from 'antd'
import type { MenuProps } from 'antd'
import type { NavigateFunction } from 'react-router-dom'
import { Link } from 'react-router-dom'

import { OutboundOrderStatusTag } from '@/components/outbound-order/OutboundOrderStatusTag'
import { OUTBOUND_TYPES } from '@/domain/outbound-order/constants'
import { displayValue } from '@/domain/outbound-order/filter'
import {
  confirmOutboundOrder,
  printOutboundContainerList,
} from '@/domain/outbound-order/store'
import type { OutboundOrder } from '@/domain/outbound-order/types'
import {
  getOutboundLinkWaybillPath,
  getTransferPlanDetailPath,
} from '@/config/routes'

type OutboundOrderColumnOptions = {
  navigate: NavigateFunction
  onActionComplete: () => void
}

function isFranchiseEmptyTransfer(record: OutboundOrder) {
  return record.出库类型 === '调拨出库' && record.调拨类型 === '空单调拨'
}

export function getOutboundOrderColumns({
  navigate,
  onActionComplete,
}: OutboundOrderColumnOptions): ProColumns<OutboundOrder>[] {
  const handlePrint = (record: OutboundOrder) => {
    const result = printOutboundContainerList(record.出库单号)
    if (result === 'ok') {
      message.success('打印成功')
      onActionComplete()
      return
    }
    message.error('打印失败，请重试')
  }

  const handleConfirmOutbound = (record: OutboundOrder) => {
    if (record.状态 !== '已复核') {
      message.error('当前状态不可确认出库')
      return
    }
    if (!record.装柜单已打印) {
      message.error('请先打印装柜单')
      return
    }

    Modal.confirm({
      title: '确认出库',
      content:
        '确认后将扣减库位库存，出库单与调拨计划将变为已出库，且不可再装车。是否继续？',
      okText: '确认出库',
      cancelText: '取消',
      onOk: async () => {
        const result = confirmOutboundOrder(record.出库单号)
        if (result === 'ok') {
          message.success('确认出库成功')
          onActionComplete()
          return
        }
        if (result === 'not-printed') {
          message.error('请先打印装柜单')
          return
        }
        if (result === 'bad-status') {
          message.error('当前状态不可确认出库')
          return
        }
        message.error('确认出库失败')
      },
    })
  }

  const buildMoreMenu = (record: OutboundOrder): MenuProps['items'] => {
    if (!isFranchiseEmptyTransfer(record)) return []

    const items: MenuProps['items'] = []

    if (record.状态 === '待出库' || record.状态 === '已复核') {
      items.push({
        key: 'link',
        label: '关联运单',
        onClick: () => navigate(getOutboundLinkWaybillPath(record.出库单号)),
      })
    }
    if (record.状态 === '已复核') {
      items.push({
        key: 'print',
        label: '打印装柜单',
        onClick: () => handlePrint(record),
      })
      items.push({
        key: 'confirm',
        label: '确认出库',
        onClick: () => handleConfirmOutbound(record),
      })
    }

    return items
  }

  const renderActions = (record: OutboundOrder) => {
    const actions: React.ReactNode[] = []
    const moreItems = buildMoreMenu(record)

    if (record.状态 === '待出库' && record.调拨类型 !== '空单调拨') {
      actions.push(
        <Typography.Link
          key="pick"
          onClick={() => message.info('已打开生成下架作业（原型占位）')}
        >
          生成下架作业
        </Typography.Link>,
      )
    }

    if (moreItems && moreItems.length > 0) {
      actions.push(
        <Dropdown key="more" menu={{ items: moreItems }}>
          <Typography.Link>更多</Typography.Link>
        </Dropdown>,
      )
    }

    if (actions.length === 0) return null
    return <Space size={8}>{actions}</Space>
  }

  return [
    {
      title: '计划单号',
      dataIndex: '计划单号',
      width: 200,
      fixed: 'left',
      hideInSearch: true,
      render: (_, record) => (
        <div>
          {record.调拨计划单号 ? (
            <Link to={getTransferPlanDetailPath(record.调拨计划单号)}>
              {record.计划单号}
            </Link>
          ) : (
            <Typography.Link style={{ cursor: 'default' }}>
              {record.计划单号}
            </Typography.Link>
          )}
          {record.出库类型 === '调拨出库' ? (
            <div style={{ marginTop: 4 }}>
              <Tag color="success" style={{ marginInlineEnd: 0 }}>调</Tag>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: '运单号',
      dataIndex: '运单号',
      hideInTable: true,
      order: 3,
      fieldProps: { placeholder: '运单号,多个用逗号或空格隔开' },
    },
    {
      title: '计划单号',
      dataIndex: '计划单号',
      hideInTable: true,
      order: 2,
      fieldProps: { placeholder: '计划单号,多个用逗号或空格隔开' },
    },
    {
      title: '出库类型',
      dataIndex: '出库类型',
      valueType: 'select',
      hideInTable: true,
      order: 1,
      fieldProps: {
        placeholder: '出库类型',
        options: OUTBOUND_TYPES.map((value) => ({ label: value, value })),
      },
    },
    {
      title: '备注',
      dataIndex: '备注',
      width: 120,
      hideInSearch: true,
      render: (_, record) => displayValue(record.备注),
    },
    {
      title: '计划件数',
      dataIndex: '计划件数',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '计划订单数',
      dataIndex: '计划订单数',
      width: 110,
      hideInSearch: true,
    },
    {
      title: '在库比例',
      dataIndex: '在库比例',
      width: 140,
      hideInSearch: true,
      render: (_, record) => (
        <Progress
          percent={record.在库比例}
          size="small"
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '计划装柜时间',
      dataIndex: '计划装柜时间',
      width: 160,
      hideInSearch: true,
      render: (_, record) => displayValue(record.计划装柜时间),
    },
    {
      title: '状态',
      dataIndex: '状态',
      width: 100,
      hideInSearch: true,
      render: (_, record) => <OutboundOrderStatusTag status={record.状态} />,
    },
    {
      title: '是否锁单',
      dataIndex: '是否锁单',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '出库类型',
      dataIndex: '出库类型',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      hideInSearch: true,
      render: (_, record) => renderActions(record),
    },
  ]
}
