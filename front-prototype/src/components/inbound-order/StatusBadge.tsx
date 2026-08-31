import { Badge } from '@/components/ui/badge'
import { STATUS_BADGE_CLASS } from '@/domain/inbound-order/constants'
import type { InboundOrderStatus } from '@/domain/inbound-order/constants'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: InboundOrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(STATUS_BADGE_CLASS[status], className)}>
      {status}
    </Badge>
  )
}
