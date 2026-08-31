import { Card, Typography } from 'antd'

const { Paragraph, Title } = Typography

type PlaceholderPageProps = {
  title: string
  description?: string
}

export function PlaceholderPage({
  title,
  description = '该页面将在下一步生成',
}: PlaceholderPageProps) {
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={4}>{title}</Title>
        <Paragraph type="secondary">{description}</Paragraph>
        <Paragraph type="secondary">
          当前为原型框架占位页，业务字段、表格与 Mock 数据尚未接入。
        </Paragraph>
      </Card>
    </div>
  )
}
