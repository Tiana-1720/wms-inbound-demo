import { App, Button, Form, Modal, Select, Typography } from 'antd'
import { useEffect, useState } from 'react'

import {
  TRANSFER_WAREHOUSE_OPTIONS,
  WAREHOUSE_TYPE_FRANCHISE,
  formatWarehouse,
} from '@/domain/transfer-plan/constants'
import { createTransferPlan } from '@/domain/transfer-plan/store'

export type TransferPlanCreateFormValues = {
  调出仓库?: string
  调入仓库?: string
}

const fromWarehouseOptions = TRANSFER_WAREHOUSE_OPTIONS.filter(
  (item) => item.type === WAREHOUSE_TYPE_FRANCHISE,
).map((item) => ({
  label: formatWarehouse(item.code, item.name),
  value: item.code,
}))

const toWarehouseOptions = TRANSFER_WAREHOUSE_OPTIONS.map((item) => ({
  label: formatWarehouse(item.code, item.name),
  value: item.code,
}))

const sameWarehouseRule = ({
  getFieldValue,
}: {
  getFieldValue: (name: string) => string | undefined
}) => ({
  validator(_: unknown, value?: string) {
    const fromWarehouse = getFieldValue('调出仓库')
    if (!value || !fromWarehouse || value !== fromWarehouse) {
      return Promise.resolve()
    }
    return Promise.reject(new Error('调入仓库不能与调出仓库相同'))
  },
})

type TransferPlanCreateModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TransferPlanCreateModal({
  open,
  onClose,
  onSuccess,
}: TransferPlanCreateModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<TransferPlanCreateFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      const result = createTransferPlan(values.调出仓库 ?? '', values.调入仓库 ?? '')
      if (!result.ok) {
        if (result.reason === 'same-warehouse') {
          message.error('调入仓库不能与调出仓库相同')
          return
        }
        message.error('保存失败，请检查仓库选择')
        return
      }
      message.success('保存成功')
      onSuccess?.()
      onClose()
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return
      }
      message.error('网络异常，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="新增调拨计划"
      open={open}
      onCancel={handleClose}
      width={640}
      destroyOnClose
      maskClosable={!submitting}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleClose} disabled={submitting}>
            取消
          </Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            确定
          </Button>
        </div>
      }
    >
      <div data-anno="transfer-plan-create-page">
        <div data-anno="transfer-plan-create-basic">
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ flex: '88px' }}
            wrapperCol={{ flex: 1 }}
            colon={false}
            requiredMark
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                columnGap: 24,
                rowGap: 16,
              }}
            >
              <Form.Item
                name="调出仓库"
                label="调出仓库"
                rules={[{ required: true, message: '请选择调出仓库' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择调出仓库"
                  options={fromWarehouseOptions}
                  allowClear
                  onChange={() =>
                    form.validateFields(['调入仓库']).catch(() => undefined)
                  }
                />
              </Form.Item>
              <Form.Item
                name="调入仓库"
                label="调入仓库"
                dependencies={['调出仓库']}
                rules={[
                  { required: true, message: '请选择调入仓库' },
                  sameWarehouseRule,
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="请选择调入仓库"
                  options={toWarehouseOptions}
                  allowClear
                />
              </Form.Item>
            </div>
          </Form>
          <Typography.Paragraph
            type="secondary"
            style={{ marginBottom: 0, marginTop: 8 }}
          >
            明细由 PDA 装车扫描回写，创建时不预填运单
          </Typography.Paragraph>
        </div>
      </div>
    </Modal>
  )
}
