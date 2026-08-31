import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type SearchableOption = {
  value: string
  label: string
}

type SearchableMultiSelectProps = {
  options: SearchableOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder = '请选择',
  className,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const filteredOptions = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized),
    )
  }, [keyword, options])

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue))
      return
    }
    onChange([...value, nextValue])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-8 w-full justify-between font-normal',
              !value.length && 'text-muted-foreground',
              className,
            )}
          />
        }
      >
        <span className="truncate">
          {selectedLabels.length > 0 ? selectedLabels.join('、') : placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-2" align="start">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索..."
          className="mb-2 h-8"
        />
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">无匹配项</p>
          ) : (
            filteredOptions.map((option) => {
              const selected = value.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent',
                    selected && 'bg-accent',
                  )}
                  onClick={() => toggleValue(option.value)}
                >
                  <Check
                    className={cn('size-4', selected ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
