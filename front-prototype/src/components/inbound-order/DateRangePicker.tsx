import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateRangePickerProps = {
  start: string
  end: string
  onChange: (start: string, end: string) => void
  placeholder?: string
  className?: string
}

function toDate(value: string) {
  if (!value) return undefined
  return new Date(`${value}T00:00:00`)
}

function toDateString(date: Date | undefined) {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

export function DateRangePicker({
  start,
  end,
  onChange,
  placeholder = '开始日期 - 结束日期',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo<DateRange>(
    () => ({
      from: toDate(start),
      to: toDate(end),
    }),
    [end, start],
  )

  const label =
    start && end
      ? `${start} - ${end}`
      : start
        ? `${start} - `
        : end
          ? ` - ${end}`
          : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              'h-8 w-full justify-start px-2.5 font-normal',
              !start && !end && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          locale={zhCN}
          selected={selected}
          onSelect={(range) => {
            onChange(toDateString(range?.from), toDateString(range?.to))
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
