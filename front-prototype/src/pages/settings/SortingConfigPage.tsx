import { App, Button, Card, Form, InputNumber } from 'antd'
import { useState } from 'react'

import {
  getSortingConfig,
  saveSortingConfig,
  type SortingConfig,
} from '@/mocks/sorting-config'

export function SortingConfigPage() {
  const { message } = App.useApp()
  const [config, setConfig] = useState<SortingConfig>(() => getSortingConfig())

  const handleSave = () => {
    if (config.smallTicketThreshold < 1 || config.smallTicketMixMax < 1) {
      message.error('M、P 须为正整数')
      return
    }
    saveSortingConfig(config)
    message.success('保存成功')
  }

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <Card title="加盟揽收仓分货参数" bordered={false}>
        <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 24 }}>
          对应主 PRD §3.5：未配置时 PDA 分货不可用。M=小票阈值，P=小票混托票数上限。
        </p>
        <Form layout="vertical">
          <Form.Item label="小票阈值 M（件）">
            <InputNumber
              min={1}
              max={9999}
              value={config.smallTicketThreshold}
              onChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  smallTicketThreshold: value ?? 1,
                }))
              }
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="小票混托票数上限 P（票）">
            <InputNumber
              min={1}
              max={99}
              value={config.smallTicketMixMax}
              onChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  smallTicketMixMax: value ?? 1,
                }))
              }
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Form>
      </Card>
    </div>
  )
}
