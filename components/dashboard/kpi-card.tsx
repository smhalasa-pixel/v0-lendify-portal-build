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
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose'
  showDateFilter?: boolean
  compact?: boolean
  minimal?: boolean // Even more compact, no date filter, centered
}

const presetRanges = [
  { label: 'Today', value: 'today', short: 'Today' },
  { label: 'Yesterday', value: 'yesterday', short: 'Yest' },
  { label: 'Last 7 Days', value: '7d', short: '7D' },
  { label: 'Last 30 Days', value: '30d', short: '30D' },
  { label: 'Last 90 Days', value: '90d', short: '90D' },
  { label: 'This Month', value: 'mtd', short: 'MTD' },
  { label: 'Last Month', value: 'last_month', short: 'Last Mo' },
  { label: 'Year to Date', value: 'ytd', short: 'YTD' },
  { label: 'Last Year', value: '1y', short: '1Y' },
]

const colorMap = {
  purple: 'text-purple-400',
  blue: 'text-blue-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
}

const bgColorMap = {
  purple: 'bg-purple-500/10',
  blue: 'bg-blue-500/10',
  emerald: 'bg-emerald-500/10',
  amber: 'bg-amber-500/10',
  rose: 'bg-rose-500/10',
}

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
  color = 'purple',
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

  // Minimal mode - very compact, centered, no date filter
  if (minimal) {
    return (
      <div className="glass-card rounded-lg p-2 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-medium text-muted-foreground uppercase truncate w-full">
          {title}
        </span>
        {formatType === 'currency' && typeof value === 'number' ? (
          <CurrencyDisplay value={value} className={cn("text-sm font-bold", colorMap[color])} />
        ) : (
          <span className={cn("text-sm font-bold tabular-nums", colorMap[color])}>
            {formatValue(value, formatType)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "glass-card rounded-lg flex flex-col",
      compact ? "p-2.5" : "p-3"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && (
            <div className={cn("p-1 rounded", bgColorMap[color])}>
              <span className={colorMap[color]}>{icon}</span>
            </div>
          )}
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {title}
          </span>
        </div>
        {showDateFilter && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground shrink-0"
                >
                  {displayLabel}
                  <ChevronDown className="ml-0.5 size-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
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
                <PopoverTrigger asChild>
                  <DropdownMenuItem
                    className={cn('text-xs', isCustom && 'bg-accent')}
                    onSelect={(e) => {
                      e.preventDefault()
                      setCalendarOpen(true)
                    }}
                  >
                    <Calendar className="mr-2 size-3" />
                    Custom Range...
                  </DropdownMenuItem>
                </PopoverTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="range"
                selected={customRange}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {/* Value and Change */}
      <div className="flex items-end justify-between gap-2">
        {formatType === 'currency' && typeof value === 'number' ? (
          <CurrencyDisplay value={value} className={cn(
            "font-bold text-foreground leading-none",
            compact ? "text-lg" : "text-xl"
          )} />
        ) : (
          <span className={cn(
            "font-bold text-foreground tabular-nums leading-none",
            compact ? "text-lg" : "text-xl"
          )}>
            {formatValue(value, formatType)}
          </span>
        )}
        
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium shrink-0',
            isPositive && 'text-emerald-400',
            isNegative && 'text-rose-400',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}>
            {isPositive && <TrendingUp className="size-2.5" />}
            {isNegative && <TrendingDown className="size-2.5" />}
            {!isPositive && !isNegative && <Minus className="size-2.5" />}
            <span>{isPositive && '+'}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
