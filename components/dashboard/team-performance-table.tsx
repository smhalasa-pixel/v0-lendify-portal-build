'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeamMetrics } from '@/lib/types'

interface TeamPerformanceTableProps {
  data: TeamMetrics[]
  title?: string
  description?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

export function TeamPerformanceTable({
  data,
  title = 'Team Performance',
  description = 'Performance metrics by team',
}: TeamPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Members</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Commissions</TableHead>
              <TableHead className="text-right">Avg Loan Size</TableHead>
              <TableHead>Top Performer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No team data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((team) => (
                <TableRow key={team.teamId}>
                  <TableCell className="font-medium">{team.teamName}</TableCell>
                  <TableCell className="text-right">{team.memberCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(team.totalVolume)}</TableCell>
                  <TableCell className="text-right">{team.totalUnits}</TableCell>
                  <TableCell className="text-right">{formatCurrency(team.totalCommissions)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(team.avgLoanSize)}</TableCell>
                  <TableCell>{team.topPerformer}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
