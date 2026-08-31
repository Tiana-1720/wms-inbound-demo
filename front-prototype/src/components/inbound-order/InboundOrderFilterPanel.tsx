import type { KeyboardEvent, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/inbound-order/DateRangePicker'
import { SearchableMultiSelect } from '@/components/inbound-order/SearchableMultiSelect'
import {
  BUSINESS_OWNERSHIPS,
  BUSINESS_TYPES,
  COUNTRY_OPTIONS,
  TRANSPORT_TYPES,
  WAREHOUSE_OPTIONS,
  formatWarehouse,
} from '@/domain/inbound-order/constants'
import type { InboundOrderFilters } from '@/domain/inbound-order/types'

type InboundOrderFilterPanelProps = {
  filters: InboundOrderFilters
  onChange: (filters: InboundOrderFilters) => void
  onSearch: () => void
  onReset: () => void
}

const warehouseOptions = WAREHOUSE_OPTIONS.map((item) => ({
  value: formatWarehouse(item.code, item.name),
  label: formatWarehouse(item.code, item.name),
}))

const countryOptions = COUNTRY_OPTIONS.map((item) => ({
  value: item.label,
  label: `${item.code} - ${item.label}`,
}))

function FilterField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

export function InboundOrderFilterPanel({
  filters,
  onChange,
  onSearch,
  onReset,
}: InboundOrderFilterPanelProps) {
  const update = <K extends keyof InboundOrderFilters>(
    key: K,
    value: InboundOrderFilters[K],
  ) => {
    onChange({ ...filters, [key]: value })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') onSearch()
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <FilterField label="运单号">
          <Input
            value={filters.运单号}
            placeholder="多个用逗号或空格隔开"
            onChange={(event) => update('运单号', event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterField>
        <FilterField label="参考号">
          <Input
            value={filters.参考号}
            placeholder="多个用逗号或空格隔开"
            onChange={(event) => update('参考号', event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterField>
        <FilterField label="收货单号">
          <Input
            value={filters.收货单号}
            placeholder="多个用逗号或空格隔开"
            onChange={(event) => update('收货单号', event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterField>
        <FilterField label="客户代码">
          <Input
            value={filters.客户代码}
            placeholder="请输入客户代码"
            onChange={(event) => update('客户代码', event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterField>
        <FilterField label="渠道">
          <Input
            value={filters.渠道}
            placeholder="请输入渠道"
            onChange={(event) => update('渠道', event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FilterField>

        <FilterField label="收货仓库">
          <SearchableMultiSelect
            options={warehouseOptions}
            value={filters.收货仓库}
            onChange={(value) => update('收货仓库', value)}
            placeholder="请选择收货仓库"
          />
        </FilterField>
        <FilterField label="目的国">
          <SearchableMultiSelect
            options={countryOptions}
            value={filters.目的国}
            onChange={(value) => update('目的国', value)}
            placeholder="请选择目的国"
          />
        </FilterField>
        <FilterField label="业务类型">
          <Select
            value={filters.业务类型 || 'all'}
            onValueChange={(value) =>
              update('业务类型', value === 'all' ? '' : (value as InboundOrderFilters['业务类型']))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {BUSINESS_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="业务归属">
          <Select
            value={filters.业务归属 || 'all'}
            onValueChange={(value) =>
              update('业务归属', value === 'all' ? '' : (value as InboundOrderFilters['业务归属']))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {BUSINESS_OWNERSHIPS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="运输类型">
          <Select
            value={filters.运输类型 || 'all'}
            onValueChange={(value) =>
              update('运输类型', value === 'all' ? '' : (value as InboundOrderFilters['运输类型']))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {TRANSPORT_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="预计到仓日期">
          <DateRangePicker
            start={filters.预计到仓时间起}
            end={filters.预计到仓时间止}
            onChange={(start, end) => {
              onChange({
                ...filters,
                预计到仓时间起: start,
                预计到仓时间止: end,
              })
            }}
            placeholder="预计到仓开始日期 - 预计到仓结束日期"
          />
        </FilterField>
        <FilterField label="收货日期">
          <DateRangePicker
            start={filters.收货时间起}
            end={filters.收货时间止}
            onChange={(start, end) => {
              onChange({
                ...filters,
                收货时间起: start,
                收货时间止: end,
              })
            }}
            placeholder="收货开始日期 - 收货结束日期"
          />
        </FilterField>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onReset}>
          重置
        </Button>
        <Button onClick={onSearch}>查询</Button>
      </div>
    </div>
  )
}
