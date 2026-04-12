'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartDataPoint } from '@/lib/types'

interface VolumeChartProps {
  data: ChartDataPoint[]
  title?: string
  description?: string
}

const chartConfig = {
  value: {
    label: 'Volume',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function VolumeChart({
  data,
  title = 'Loan Volume Trend',
  description = 'Daily funded loan volume over time',
}: VolumeChartProps) {
  return (
    <div className="group relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-500/10 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {/* Chart */}
        <div className="p-6 pt-2">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(138, 43, 226, 0.4)" />
                  <stop offset="50%" stopColor="rgba(138, 43, 226, 0.15)" />
                  <stop offset="100%" stopColor="rgba(138, 43, 226, 0)" />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(138, 43, 226, 1)" />
                  <stop offset="50%" stopColor="rgba(236, 72, 153, 0.8)" />
                  <stop offset="100%" stopColor="rgba(138, 43, 226, 1)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
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
                fontSize={12}
                stroke="rgba(255, 255, 255, 0.4)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                stroke="rgba(255, 255, 255, 0.4)"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="glass-card border-purple-500/30"
                    formatter={(value) =>
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(value as number)
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#strokeGradient)"
                strokeWidth={3}
                fill="url(#volumeGradient)"
                filter="url(#glow)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
