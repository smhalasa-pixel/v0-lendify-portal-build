'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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

const dateRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
]

const colorMap = {
  purple: { line: '#a855f7', gradient: 'rgba(168, 85, 247, 0.3)' },
  blue: { line: '#3b82f6', gradient: 'rgba(59, 130, 246, 0.3)' },
  emerald: { line: '#10b981', gradient: 'rgba(16, 185, 129, 0.3)' },
  amber: { line: '#f59e0b', gradient: 'rgba(245, 158, 11, 0.3)' },
  rose: { line: '#f43f5e', gradient: 'rgba(244, 63, 94, 0.3)' },
}

function formatValue(value: string | number, format?: 'currency' | 'number' | 'percentage'): string {
  if (typeof value === 'string') return value
  
  switch (format) {
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

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  format = 'number',
  color = 'purple',
  showDateFilter = true,
}: KPICardProps) {
  const [selectedRange, setSelectedRange] = React.useState('30d')
  const sparklineData = React.useMemo(() => generateSparklineData(12), [])
  
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === 0
  const colors = colorMap[color]

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                {dateRanges.find(r => r.value === selectedRange)?.label}
                <ChevronDown className="ml-1 size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px]">
              {dateRanges.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={cn(
                    'text-xs',
                    selectedRange === range.value && 'bg-accent'
                  )}
                >
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Value */}
      <div className="text-2xl font-bold tracking-tight text-foreground">
        {formatValue(value, format)}
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
