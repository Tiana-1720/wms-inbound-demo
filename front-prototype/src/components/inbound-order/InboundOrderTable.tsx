import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/inbound-order/StatusBadge'
import { displayNumber, displayValue } from '@/domain/inbound-order/filter'
import type { InboundOrder } from '@/domain/inbound-order/types'

type InboundOrderTableProps = {
  rows: InboundOrder[]
}

function StackedCell({
  primary,
  secondary,
  primaryClassName,
}: {
  primary: ReactNode
  secondary: ReactNode
  primaryClassName?: string
}) {
  return (
    <div className="space-y-0.5 py-1">
      <div className={primaryClassName}>{primary}</div>
      <div className="text-xs text-muted-foreground">{secondary}</div>
    </div>
  )
}

export function InboundOrderTable({ rows }: InboundOrderTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        暂无收货订单
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="sticky left-0 z-10 min-w-[160px] bg-muted/40">
              运单号 / 参考号
            </TableHead>
            <TableHead className="min-w-[120px]">客户代码 / 客户等级</TableHead>
            <TableHead className="sticky left-[160px] z-10 min-w-[140px] bg-muted/40">
              收货单号
            </TableHead>
            <TableHead className="min-w-[120px]">目的国 / 目的仓库</TableHead>
            <TableHead className="min-w-[140px]">渠道</TableHead>
            <TableHead className="min-w-[120px]">收货箱数 / 预报箱数</TableHead>
            <TableHead className="min-w-[120px]">收货重量 / 预报重量</TableHead>
            <TableHead className="min-w-[120px]">收货体积 / 预报体积</TableHead>
            <TableHead className="min-w-[160px]">收货仓库 / 预报仓库</TableHead>
            <TableHead className="min-w-[160px]">预计到仓时间</TableHead>
            <TableHead className="min-w-[80px]">业务类型</TableHead>
            <TableHead className="min-w-[80px]">业务归属</TableHead>
            <TableHead className="min-w-[80px]">运输类型</TableHead>
            <TableHead className="min-w-[100px]">收货人</TableHead>
            <TableHead className="min-w-[160px]">收货时间</TableHead>
            <TableHead className="min-w-[100px]">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.收货单号}>
              <TableCell className="sticky left-0 z-10 bg-card">
                <StackedCell
                  primary={row.运单号}
                  secondary={displayValue(row.参考号)}
                  primaryClassName="font-medium"
                />
              </TableCell>
              <TableCell>
                <StackedCell
                  primary={row.客户代码}
                  secondary={
                    row.客户等级 ? (
                      <Badge variant="secondary" className="h-5 px-1.5">
                        {row.客户等级}
                      </Badge>
                    ) : (
                      '-'
                    )
                  }
                />
              </TableCell>
              <TableCell className="sticky left-[160px] z-10 bg-card">
                <Link
                  to={`/order/Inbound/${row.收货单号}`}
                  className="font-medium text-primary hover:underline"
                >
                  {row.收货单号}
                </Link>
              </TableCell>
              <TableCell>
                <StackedCell
                  primary={row.目的国}
                  secondary={row.目的仓库}
                />
              </TableCell>
              <TableCell>{displayValue(row.渠道)}</TableCell>
              <TableCell>
                <StackedCell
                  primary={displayNumber(row.收货箱数)}
                  secondary={displayNumber(row.预报箱数)}
                />
              </TableCell>
              <TableCell>
                <StackedCell
                  primary={displayNumber(row.收货重量)}
                  secondary={displayNumber(row.预报重量)}
                />
              </TableCell>
              <TableCell>
                <StackedCell
                  primary={displayNumber(row.收货体积)}
                  secondary={displayNumber(row.预报体积)}
                />
              </TableCell>
              <TableCell>
                <StackedCell
                  primary={displayValue(row.收货仓库)}
                  secondary={row.预报仓库}
                />
              </TableCell>
              <TableCell>{row.预计到仓时间}</TableCell>
              <TableCell>{row.业务类型}</TableCell>
              <TableCell>{row.业务归属}</TableCell>
              <TableCell>{row.运输类型}</TableCell>
              <TableCell>{displayValue(row.收货人)}</TableCell>
              <TableCell>{displayValue(row.收货时间)}</TableCell>
              <TableCell>
                <StatusBadge status={row.状态} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
