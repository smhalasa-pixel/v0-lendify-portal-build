'use client'

import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { PipelineLoan } from '@/lib/types'

interface PipelineChartProps {
  data: PipelineLoan[]
  title?: string
  description?: string
}

const statusOrder = ['lead', 'application', 'processing', 'underwriting', 'approved', 'closing', 'funded']
const statusLabels: Record<string, string> = {
  lead: 'Lead',
  application: 'Application',
  processing: 'Processing',
  underwriting: 'UW',
  approved: 'Approved',
  closing: 'Closing',
  funded: 'Funded',
}

const statusColors: Record<string, string> = {
  lead: 'rgba(138, 43, 226, 0.4)',
  application: 'rgba(138, 43, 226, 0.55)',
  processing: 'rgba(138, 43, 226, 0.7)',
  underwriting: 'rgba(168, 85, 247, 0.8)',
  approved: 'rgba(192, 132, 252, 0.85)',
  closing: 'rgba(216, 180, 254, 0.9)',
  funded: 'rgba(138, 43, 226, 1)',
}

const chartConfig = {
  count: {
    label: 'Loans',
  },
  value: {
    label: 'Volume',
  },
} satisfies ChartConfig

export function PipelineChart({
  data,
  title = 'Pipeline by Status',
  description = 'Current pipeline distribution by loan status',
}: PipelineChartProps) {
  // Aggregate data by status
  const aggregated = statusOrder.map(status => {
    const loansInStatus = data.filter(loan => loan.status === status)
    return {
      status,
      label: statusLabels[status],
      count: loansInStatus.length,
      value: loansInStatus.reduce((sum, loan) => sum + loan.loanAmount, 0),
      color: statusColors[status],
    }
  }).filter(item => item.count > 0)

  return (
    <div className="group relative h-full">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-pink-500/10 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative glass-card rounded-xl h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        {/* Chart */}
        <div className="p-6 pt-2">
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart
              data={aggregated}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                {aggregated.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor="rgba(236, 72, 153, 0.6)" />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="rgba(255, 255, 255, 0.4)"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={80}
                stroke="rgba(255, 255, 255, 0.4)"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="glass-card border-purple-500/30"
                    formatter={(value, name) => {
                      if (name === 'value') {
                        return new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(value as number)
                      }
                      return value
                    }}
                  />
                }
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {aggregated.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#barGradient-${index})`}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.3))' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
