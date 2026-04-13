'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CalendarIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ChartDataPoint } from '@/lib/types'

interface VolumeChartProps {
  data: ChartDataPoint[]
}

const metricOptions = [
  { value: 'debtLoadEnrolled', label: 'Debt Load Enrolled', format: 'currency', color: '#a855f7' },
  { value: 'unitsEnrolled', label: 'Units Enrolled', format: 'number', color: '#3b82f6' },
  { value: 'debtLoadSubmitted', label: 'Debt Load Submitted', format: 'currency', color: '#8b5cf6' },
  { value: 'unitsSubmitted', label: 'Units Submitted', format: 'number', color: '#06b6d4' },
  { value: 'debtLoadFPC', label: 'Debt Load FPC', format: 'currency', color: '#10b981' },
  { value: 'unitsFPC', label: 'Units FPC', format: 'number', color: '#22c55e' },
  { value: 'commission', label: 'Commission', format: 'currency', color: '#f59e0b' },
  { value: 'clawbacks', label: 'Clawbacks', format: 'currency', color: '#ef4444' },
  { value: 'conversionRate', label: 'Conversion Rate', format: 'percentage', color: '#eab308' },
  { value: 'qualifiedConversionRate', label: 'Qualified Conversion', format: 'percentage', color: '#84cc16' },
]

const datePresets = [
  { value: '7d', label: '7 Days', days: 7 },
  { value: '14d', label: '14 Days', days: 14 },
  { value: '30d', label: '30 Days', days: 30 },
  { value: '60d', label: '60 Days', days: 60 },
  { value: '90d', label: '90 Days', days: 90 },
  { value: 'mtd', label: 'MTD', days: new Date().getDate() },
  { value: 'ytd', label: 'YTD', days: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) },
  { value: 'custom', label: 'Custom...', days: 30 },
]

interface ChartData {
  label: string
  fullDate: string
  value: number
}

function generateMetricData(metric: string, days: number = 30): ChartData[] {
  const data: ChartData[] = []
  const baseValues: Record<string, { min: number; max: number }> = {
    debtLoadEnrolled: { min: 50000, max: 200000 },
    unitsEnrolled: { min: 5, max: 25 },
    debtLoadSubmitted: { min: 80000, max: 300000 },
    unitsSubmitted: { min: 8, max: 35 },
    debtLoadFPC: { min: 40000, max: 150000 },
    unitsFPC: { min: 3, max: 20 },
    commission: { min: 2000, max: 15000 },
    clawbacks: { min: 500, max: 5000 },
    conversionRate: { min: 20, max: 80 },
    qualifiedConversionRate: { min: 40, max: 90 },
  }

  const range = baseValues[metric] || { min: 1000, max: 10000 }
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    const value = range.min + Math.random() * (range.max - range.min)
    
    // Format label based on number of days for cleaner x-axis
    let label: string
    if (days <= 14) {
      label = format(date, 'MMM d')
    } else if (days <= 60) {
      // Show every few days or first of month
      label = date.getDate() === 1 || i % Math.ceil(days / 10) === 0 
        ? format(date, 'MMM d') 
        : format(date, 'd')
    } else {
      // For longer ranges, show month markers
      label = date.getDate() === 1 ? format(date, 'MMM') : ''
    }
    
    data.push({
      label,
      fullDate: format(date, 'EEEE, MMMM d, yyyy'),
      value: Math.round(value * 100) / 100,
    })
  }
  return data
}

function formatTickValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
      return `$${value}`
    case 'percentage':
      return `${value}%`
    default:
      return value.toString()
  }
}

function formatFullValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    case 'percentage':
      return `${value.toFixed(2)}%`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartData }>
  label?: string
  metricLabel: string
  format: string
  color: string
}

function CustomTooltip({ active, payload, metricLabel, format, color }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const dataPoint = payload[0].payload

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-lg shadow-2xl p-3 min-w-[220px]">
      <p className="text-[11px] font-medium text-muted-foreground mb-2 pb-2 border-b border-border/40">
        {dataPoint.fullDate}
      </p>
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-muted-foreground flex-1">{metricLabel}</span>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {formatFullValue(payload[0].value, format)}
        </span>
      </div>
    </div>
  )
}

export function VolumeChart({ data: _initialData }: VolumeChartProps) {
  const [selectedMetric, setSelectedMetric] = React.useState('debtLoadEnrolled')
  const [chartType, setChartType] = React.useState<'area' | 'bar'>('area')
  const [dateRange, setDateRange] = React.useState('30d')
  const [customRange, setCustomRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0]
  const currentDatePreset = datePresets.find(d => d.value === dateRange) || datePresets[2]
  
  const days = React.useMemo(() => {
    if (dateRange === 'custom' && customRange.from && customRange.to) {
      return Math.ceil((customRange.to.getTime() - customRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }
    return currentDatePreset.days
  }, [dateRange, customRange, currentDatePreset])

  const dateLabel = React.useMemo(() => {
    if (dateRange === 'custom' && customRange.from && customRange.to) {
      return `${format(customRange.from, 'MMM d, yyyy')} - ${format(customRange.to, 'MMM d, yyyy')}`
    }
    return currentDatePreset.label
  }, [dateRange, customRange, currentDatePreset])
  
  const chartData = React.useMemo(() => {
    return generateMetricData(selectedMetric, days)
  }, [selectedMetric, days])

  return (
    <div className="glass-card rounded-lg border border-border/40">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full" style={{ backgroundColor: currentMetric.color }} />
          <span className="text-sm font-medium text-foreground">{currentMetric.label}</span>
          <span className="text-xs text-muted-foreground">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={(val) => {
            if (val === 'custom') {
              setCalendarOpen(true)
            } else {
              setDateRange(val)
            }
          }}>
            <SelectTrigger className="h-7 text-[11px] w-auto min-w-[90px] bg-muted/30 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {datePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value} className="text-xs">
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dateRange === 'custom' && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 bg-muted/30 border-border/40">
                  <CalendarIcon className="size-3 mr-1.5" />
                  {customRange.from && customRange.to 
                    ? `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={(range) => {
                    setCustomRange({ from: range?.from, to: range?.to })
                    if (range?.from && range?.to) {
                      setDateRange('custom')
                      setCalendarOpen(false)
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-muted/30 rounded-md p-0.5">
            <button
              onClick={() => setChartType('area')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all",
                chartType === 'area' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-sm transition-all",
                chartType === 'bar' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bar
            </button>
          </div>

          {/* Metric Selector */}
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="h-7 text-[11px] w-auto min-w-[140px] bg-muted/30 border-border/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: option.color }} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-4 pt-2">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 16, right: 8, left: -10, bottom: 4 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentMetric.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={currentMetric.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.4}
                  vertical={false} 
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.5 }}
                  tickMargin={12}
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                  interval={days <= 14 ? 0 : days <= 30 ? 'preserveStartEnd' : 'equidistantPreserveStart'}
                  minTickGap={days <= 14 ? 30 : 50}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatTickValue(value, currentMetric.format)}
                  width={55}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      metricLabel={currentMetric.label}
                      format={currentMetric.format}
                      color={currentMetric.color}
                    />
                  }
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.2, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={currentMetric.color}
                  strokeWidth={2}
                  fill="url(#metricGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    strokeWidth: 2, 
                    fill: 'hsl(var(--background))',
                    stroke: currentMetric.color
                  }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 16, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.4}
                  vertical={false} 
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.5 }}
                  tickMargin={12}
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                  interval={days <= 14 ? 0 : days <= 30 ? 'preserveStartEnd' : 'equidistantPreserveStart'}
                  minTickGap={days <= 14 ? 30 : 50}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => formatTickValue(value, currentMetric.format)}
                  width={55}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      metricLabel={currentMetric.label}
                      format={currentMetric.format}
                      color={currentMetric.color}
                    />
                  }
                  cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.15 }}
                />
                <Bar
                  dataKey="value"
                  fill={currentMetric.color}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
