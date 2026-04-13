'use client'

import * as React from 'react'
import { Target, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  showPIPFlag?: boolean
  pipThreshold?: number // percentage below expected to trigger PIP flag (default 20%)
}

function formatValue(value: number, format: 'currency' | 'number' = 'number'): string {
  if (format === 'currency') {
    return formatCurrencyAbbreviated(value)
  }
  return value.toLocaleString()
}

export function ProgressCard({ title, items, showPIPFlag = true, pipThreshold = 20 }: ProgressCardProps) {
  // Check if any item is significantly behind (below threshold percentage)
  const isPIPRisk = showPIPFlag && items.some((item) => {
    const percentage = (item.current / item.target) * 100
    return percentage < pipThreshold && percentage < 100
  })

  return (
    <Card className={cn(
      "glass-card border-border/50",
      isPIPRisk && "border-rose-500/30"
    )}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="size-4 text-primary" />
            {title}
          </CardTitle>
          {isPIPRisk && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-5 gap-1 bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30">
              <AlertTriangle className="size-3" />
              PIP Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {items.map((item) => {
          const percentage = Math.min((item.current / item.target) * 100, 100)
          const isComplete = percentage >= 100
          const isBehind = percentage < pipThreshold && !isComplete
          
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  {isBehind && (
                    <AlertTriangle className="size-3 text-rose-400" />
                  )}
                </div>
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
                    isComplete && "[&>div]:bg-emerald-500",
                    isBehind && "[&>div]:bg-rose-500"
                  )}
                />
              <div className="flex items-center justify-between text-[10px]">
                <span className={cn(
                  "font-medium",
                  isComplete ? "text-emerald-400" : isBehind ? "text-rose-400" : "text-muted-foreground"
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
