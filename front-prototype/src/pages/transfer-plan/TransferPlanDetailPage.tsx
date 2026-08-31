import { FooterToolbar, PageContainer } from '@ant-design/pro-components'
import {
  Button,
  Card,
  Descriptions,
  Result,
  Table,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'

import { TransferPlanStatusTag } from '@/components/transfer-plan/TransferPlanStatusTag'
import { TRANSFER_PLAN_LIST_PATH } from '@/config/routes'
import {
  formatVolume,
  formatWeight,
  getWarehouseLabel,
} from '@/domain/transfer-plan/constants'
import { getTransferPlan } from '@/domain/transfer-plan/store'
import type { TransferPlanLine, TransferPlanLog } from '@/domain/transfer-plan/types'

export function TransferPlanDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const plan = getTransferPlan(id)

  const goList = () => {
    navigate(TRANSFER_PLAN_LIST_PATH)
  }

  if (!plan) {
    return (
      <PageContainer title="调拨计划详情" ghost onBack={goList}>
        <Result
          status="404"
          title="调拨计划不存在"
          extra={
            <Button type="primary" onClick={goList}>
              返回列表
            </Button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <div data-anno="transfer-plan-detail-page">
      <PageContainer
        title="调拨计划详情"
        ghost
        onBack={goList}
        extra={
          <span data-anno="transfer-plan-detail-status">
            <TransferPlanStatusTag status={plan.状态} />
          </span>
        }
      >
        <Card
          title="基础信息"
          data-anno="transfer-plan-detail-basic"
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2}>
            <Descriptions.Item label="调拨计划单号">
              {plan.调拨计划单号}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <TransferPlanStatusTag status={plan.状态} />
            </Descriptions.Item>
            <Descriptions.Item label="调出仓库">
              {getWarehouseLabel(plan.调出仓库)}
            </Descriptions.Item>
            <Descriptions.Item label="调入仓库">
              {getWarehouseLabel(plan.调入仓库)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="调拨明细"
          data-anno="transfer-plan-detail-lines"
          style={{ marginBottom: 16 }}
        >
          <Table<TransferPlanLine>
            rowKey="运单号"
            pagination={false}
            dataSource={plan.明细}
            locale={{ emptyText: '暂无实装运单' }}
            columns={[
              {
                title: '序号',
                width: 64,
                render: (_, __, index) => index + 1,
              },
              { title: '运单号', dataIndex: '运单号' },
              { title: '客户代码', dataIndex: '客户代码' },
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
            ]}
          />
        </Card>

        <Card
          title="汇总信息"
          data-anno="transfer-plan-detail-summary"
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={3}>
            <Descriptions.Item label="箱数">{plan.箱数}</Descriptions.Item>
            <Descriptions.Item label="重量">
              {formatWeight(plan.重量)}
            </Descriptions.Item>
            <Descriptions.Item label="体积">
              {formatVolume(plan.体积)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title="系统信息"
          data-anno="transfer-plan-detail-system"
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2}>
            <Descriptions.Item label="创建人">{plan.创建人}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{plan.创建时间}</Descriptions.Item>
            <Descriptions.Item label="最后修改人">
              {plan.最后修改人}
            </Descriptions.Item>
            <Descriptions.Item label="最后修改时间">
              {plan.最后修改时间}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="操作日志" data-anno="transfer-plan-detail-log">
          <Table<TransferPlanLog>
            rowKey={(row) => `${row.操作内容}-${row.操作时间}-${row.操作人}`}
            pagination={false}
            dataSource={plan.操作日志}
            locale={{ emptyText: '暂无操作记录' }}
            columns={[
              { title: '操作内容', dataIndex: '操作内容' },
              { title: '操作时间', dataIndex: '操作时间', width: 180 },
              { title: '操作人', dataIndex: '操作人', width: 180 },
            ]}
          />
        </Card>

        <FooterToolbar data-anno="transfer-plan-detail-actions">
          <Button onClick={goList}>返回列表</Button>
        </FooterToolbar>
      </PageContainer>
    </div>
  )
}
