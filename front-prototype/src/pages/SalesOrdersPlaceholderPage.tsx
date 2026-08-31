import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SalesOrdersPlaceholderPage() {
  return (
    <div className="flex min-h-full items-start p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>销售订单</CardTitle>
          <CardDescription>销售订单页面将在下一步生成</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            列表、详情、新增与编辑路由已预留，待后续步骤实现。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
