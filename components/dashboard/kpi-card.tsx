'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, Calendar } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
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
import type { DateRange } from 'react-day-picker'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  format?: 'currency' | 'number' | 'percentage'
  sparklineData?: number[]
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose'
  showDateFilter?: boolean
}

const presetRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Month', value: 'mtd' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'Last Year', value: '1y' },
]

const colorMap = {
  purple: { line: '#a855f7', gradient: 'rgba(168, 85, 247, 0.3)' },
  blue: { line: '#3b82f6', gradient: 'rgba(59, 130, 246, 0.3)' },
  emerald: { line: '#10b981', gradient: 'rgba(16, 185, 129, 0.3)' },
  amber: { line: '#f59e0b', gradient: 'rgba(245, 158, 11, 0.3)' },
  rose: { line: '#f43f5e', gradient: 'rgba(244, 63, 94, 0.3)' },
}

function formatValue(value: string | number, formatType?: 'currency' | 'number' | 'percentage'): string {
  if (typeof value === 'string') return value
  
  switch (formatType) {
    case 'currency':
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

// Generate mock sparkline data
function generateSparklineData(length: number = 12): { value: number }[] {
  const data: { value: number }[] = []
  let current = 50 + Math.random() * 50
  for (let i = 0; i < length; i++) {
    current = Math.max(10, Math.min(100, current + (Math.random() - 0.45) * 20))
    data.push({ value: current })
  }
  return data
}

function getPresetLabel(preset: string): string {
  return presetRanges.find(r => r.value === preset)?.label || preset
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  format: formatType = 'number',
  color = 'purple',
  showDateFilter = true,
}: KPICardProps) {
  const [selectedPreset, setSelectedPreset] = React.useState('30d')
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>()
  const [isCustom, setIsCustom] = React.useState(false)
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const sparklineData = React.useMemo(() => generateSparklineData(12), [])
  
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === 0
  const colors = colorMap[color]

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
    return getPresetLabel(selectedPreset)
  }, [isCustom, customRange, selectedPreset])

  return (
    <div className="glass-card rounded-lg p-4 h-full flex flex-col">
      {/* Header with title and date filter */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
        </div>
        {showDateFilter && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                  {displayLabel}
                  <ChevronDown className="ml-1 size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
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
                    className={cn(
                      'text-xs',
                      isCustom && 'bg-accent'
                    )}
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
      
      {/* Value */}
      <div className="text-2xl font-bold tracking-tight text-foreground">
        {formatValue(value, formatType)}
      </div>
      
      {/* Change indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            isPositive && 'text-emerald-400',
            isNegative && 'text-red-400',
            isNeutral && 'text-muted-foreground'
          )}>
            {isPositive && <TrendingUp className="size-3" />}
            {isNegative && <TrendingDown className="size-3" />}
            {isNeutral && <Minus className="size-3" />}
            <span>
              {isPositive && '+'}
              {change.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      )}
      
      {/* Sparkline Chart */}
      <div className="mt-auto pt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.gradient} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={1.5}
              fill={`url(#gradient-${title.replace(/\s/g, '')})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
