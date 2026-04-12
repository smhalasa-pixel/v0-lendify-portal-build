'use client'

import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  lead: 'var(--chart-5)',
  application: 'var(--chart-3)',
  processing: 'var(--chart-2)',
  underwriting: 'var(--chart-4)',
  approved: 'var(--chart-1)',
  closing: 'var(--chart-1)',
  funded: 'var(--chart-1)',
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
              data={aggregated}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                className="fill-muted-foreground"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={80}
                className="fill-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
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
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {aggregated.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
