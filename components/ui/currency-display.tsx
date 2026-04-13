'use client'

import * as React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  value: number
  className?: string
  abbreviated?: boolean
}

export function formatCurrencyAbbreviated(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

export function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CurrencyDisplay({ value, className, abbreviated = true }: CurrencyDisplayProps) {
  const displayValue = abbreviated ? formatCurrencyAbbreviated(value) : formatCurrencyFull(value)
  const fullValue = formatCurrencyFull(value)
  const isAbbreviated = abbreviated && value >= 1000

  if (!isAbbreviated) {
    return <span className={className}>{displayValue}</span>
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help", className)}>{displayValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-sm font-medium tabular-nums">{fullValue}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
