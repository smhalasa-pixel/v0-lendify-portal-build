'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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
  { value: 'qualifiedConversionRate', label: 'Qualified Conversion Rate', format: 'percentage', color: '#84cc16' },
]

const chartTypeOptions = [
  { value: 'area', label: 'Area Chart' },
  { value: 'bar', label: 'Bar Chart' },
]

// Generate mock data for different metrics
function generateMetricData(metric: string, days: number = 30): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
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
    data.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

function formatTooltipValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

export function VolumeChart({ data: initialData }: VolumeChartProps) {
  const [selectedMetric, setSelectedMetric] = React.useState('debtLoadEnrolled')
  const [chartType, setChartType] = React.useState('area')

  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0]
  
  const chartData = React.useMemo(() => {
    return generateMetricData(selectedMetric, 30)
  }, [selectedMetric])

  const chartConfig = {
    value: {
      label: currentMetric.label,
      color: currentMetric.color,
    },
  } satisfies ChartConfig

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{currentMetric.label} Trend</h3>
          <p className="text-sm text-muted-foreground">Daily trend over the last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {chartTypeOptions.find(c => c.value === chartType)?.label}
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {chartTypeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={cn('text-xs', chartType === option.value && 'bg-accent')}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Metric Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {currentMetric.label}
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {metricOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedMetric(option.value)}
                  className={cn('text-xs', selectedMetric === option.value && 'bg-accent')}
                >
                  <div
                    className="size-2 rounded-full mr-2"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-5 pt-2">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          {chartType === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentMetric.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={currentMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(138, 43, 226, 0.1)" 
                vertical={false} 
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="rgba(255, 255, 255, 0.4)"
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="rgba(255, 255, 255, 0.4)"
                tickFormatter={(value) => formatTickValue(value, currentMetric.format)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatTooltipValue(value as number, currentMetric.format)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentMetric.color}
                strokeWidth={2}
                fill="url(#metricGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(138, 43, 226, 0.1)" 
                vertical={false} 
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="rgba(255, 255, 255, 0.4)"
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="rgba(255, 255, 255, 0.4)"
                tickFormatter={(value) => formatTickValue(value, currentMetric.format)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatTooltipValue(value as number, currentMetric.format)}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill={currentMetric.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  )
}
