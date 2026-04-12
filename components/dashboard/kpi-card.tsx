'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  format?: 'currency' | 'number' | 'percentage'
}

function formatValue(value: string | number, format?: 'currency' | 'number' | 'percentage'): string {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
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

export function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  format = 'number',
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === 0

  return (
    <div className="group relative">
      {/* Glow effect behind card */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-500/10 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Main card */}
      <div className="relative glass-card rounded-xl p-5 h-full">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-xl pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </span>
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
          </div>
          
          <div className="text-3xl font-bold tracking-tight glow-text">
            {formatValue(value, format)}
          </div>
          
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                isPositive && 'bg-emerald-500/20 text-emerald-400',
                isNegative && 'bg-red-500/20 text-red-400',
                isNeutral && 'bg-muted text-muted-foreground'
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
        </div>
      </div>
    </div>
  )
}
