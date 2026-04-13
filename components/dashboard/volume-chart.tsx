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
    label: 'Debt Load',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function VolumeChart({
  data,
  title = 'Debt Load Trend',
  description = 'Daily enrolled debt load over time',
}: VolumeChartProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      {/* Chart */}
      <div className="p-5 pt-2">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(138, 43, 226, 0.3)" />
                <stop offset="100%" stopColor="rgba(138, 43, 226, 0)" />
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
              stroke="rgba(138, 43, 226, 0.8)"
              strokeWidth={2}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
