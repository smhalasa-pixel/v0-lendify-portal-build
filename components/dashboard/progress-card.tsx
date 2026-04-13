'use client'

import * as React from 'react'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressCardProps {
  title: string
  items: {
    label: string
    current: number
    target: number
    format?: 'currency' | 'number'
  }[]
}

function formatValue(value: number, format: 'currency' | 'number' = 'number'): string {
  if (format === 'currency') {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
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
  }
  return value.toLocaleString()
}

export function ProgressCard({ title, items }: ProgressCardProps) {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {items.map((item) => {
          const percentage = Math.min((item.current / item.target) * 100, 100)
          const isComplete = percentage >= 100
          
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">
                  {formatValue(item.current, item.format)} / {formatValue(item.target, item.format)}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-2",
                    isComplete && "[&>div]:bg-emerald-500"
                  )}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className={cn(
                  "font-medium",
                  isComplete ? "text-emerald-400" : "text-muted-foreground"
                )}>
                  {percentage.toFixed(0)}% Complete
                </span>
                {!isComplete && (
                  <span className="text-muted-foreground">
                    {formatValue(item.target - item.current, item.format)} remaining
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
