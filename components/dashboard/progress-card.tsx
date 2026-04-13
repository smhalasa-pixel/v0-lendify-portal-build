'use client'

import * as React from 'react'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CurrencyDisplay, formatCurrencyAbbreviated } from '@/components/ui/currency-display'

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
    return formatCurrencyAbbreviated(value)
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
                  {item.format === 'currency' ? (
                    <><CurrencyDisplay value={item.current} className="text-xs" /> / <CurrencyDisplay value={item.target} className="text-xs" /></>
                  ) : (
                    <>{formatValue(item.current, item.format)} / {formatValue(item.target, item.format)}</>
                  )}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className={cn(
                  "h-2",
                  isComplete && "[&>div]:bg-emerald-500"
                )}
              />
              <div className="flex items-center justify-between text-[10px]">
                <span className={cn(
                  "font-medium",
                  isComplete ? "text-emerald-400" : "text-muted-foreground"
                )}>
                  {percentage.toFixed(0)}% Complete
                </span>
                {!isComplete && (
                  <span className="text-muted-foreground">
                    {item.format === 'currency' ? (
                      <><CurrencyDisplay value={item.target - item.current} className="text-[10px]" /> remaining</>
                    ) : (
                      <>{formatValue(item.target - item.current, item.format)} remaining</>
                    )}
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
