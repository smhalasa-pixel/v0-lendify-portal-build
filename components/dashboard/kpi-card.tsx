'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { CurrencyDisplay, formatCurrencyAbbreviated } from '@/components/ui/currency-display'
import type { DateRange } from 'react-day-picker'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  format?: 'currency' | 'number' | 'percentage'
  /**
   * Legacy prop kept for backwards compatibility with existing call sites.
   * The Forge palette is monochrome so the prop is now a no-op visually.
   */
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose'
  showDateFilter?: boolean
  compact?: boolean
  minimal?: boolean
}

const presetRanges = [
  { label: 'Today', value: 'today', short: 'Today' },
  { label: 'Yesterday', value: 'yesterday', short: 'Yest' },
  { label: 'Last 7 Days', value: '7d', short: '7D' },
  { label: 'Last 30 Days', value: '30d', short: '30D' },
  { label: 'Last 90 Days', value: '90d', short: '90D' },
  { label: 'MTD', value: 'mtd', short: 'MTD' },
  { label: 'Last Month', value: 'last_month', short: 'Last Mo' },
  { label: 'YTD', value: 'ytd', short: 'YTD' },
  { label: 'Last Year', value: '1y', short: '1Y' },
]

function formatValue(value: string | number, formatType?: 'currency' | 'number' | 'percentage'): string {
  if (typeof value === 'string') return value
  switch (formatType) {
    case 'currency':
      return formatCurrencyAbbreviated(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

function getPresetShort(preset: string): string {
  return presetRanges.find(r => r.value === preset)?.short || preset
}

export function KPICard({
  title,
  value,
  change,
  icon,
  format: formatType = 'number',
  showDateFilter = true,
  compact = false,
  minimal = false,
}: KPICardProps) {
  const [selectedPreset, setSelectedPreset] = React.useState('30d')
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>()
  const [isCustom, setIsCustom] = React.useState(false)
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset)
    setIsCustom(false)
    setCustomRange(undefined)
  }

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setCustomRange(range)
    if (range?.from && range?.to) {
      setIsCustom(true)
      setCalendarOpen(false)
    }
  }

  const displayLabel = React.useMemo(() => {
    if (isCustom && customRange?.from && customRange?.to) {
      return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
    }
    return getPresetShort(selectedPreset)
  }, [isCustom, customRange, selectedPreset])

  if (minimal) {
    return (
      <div className="flex flex-col items-center gap-1 py-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
        {formatType === 'currency' && typeof value === 'number' ? (
          <CurrencyDisplay value={value} className="text-lg font-semibold tracking-tight tabular-nums" />
        ) : (
          <div className="text-lg font-semibold tracking-tight tabular-nums">
            {formatValue(value, formatType)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        compact && 'p-3'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span className="shrink-0 text-muted-foreground [&>svg]:size-4">{icon}</span>
          )}
          <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        {showDateFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                {displayLabel}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {presetRanges.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => handlePresetSelect(range.value)}
                  className={cn(
                    'text-xs',
                    !isCustom && selectedPreset === range.value && 'bg-accent'
                  )}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setCalendarOpen(true)
                    }}
                    className="text-xs"
                  >
                    <Calendar className="mr-2 size-3" />
                    Custom Range...
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={customRange}
                    onSelect={handleCustomRangeSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Value and Change */}
      <div className="flex items-baseline justify-between gap-3">
        {formatType === 'currency' && typeof value === 'number' ? (
          <CurrencyDisplay
            value={value}
            className="text-2xl font-semibold tracking-tight tabular-nums"
          />
        ) : (
          <div className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatValue(value, formatType)}
          </div>
        )}
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium tabular-nums',
              isPositive && 'text-emerald-400',
              isNegative && 'text-red-400',
              !isPositive && !isNegative && 'text-muted-foreground'
            )}
          >
            {isPositive && <TrendingUp className="size-3" />}
            {isNegative && <TrendingDown className="size-3" />}
            {!isPositive && !isNegative && <Minus className="size-3" />}
            <span>{isPositive && '+'}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
