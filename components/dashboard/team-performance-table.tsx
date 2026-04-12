'use client'

import { Users, Trophy } from 'lucide-react'
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
  // Sort by debt load enrolled to determine rankings
  const sortedData = [...data].sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)

  return (
    <Card className="glass-card border-purple-500/20 overflow-hidden">
      <CardHeader className="border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center">
            <Users className="size-4 text-purple-300" />
          </div>
          <div>
            <CardTitle className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription className="text-purple-300/60">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/10 hover:bg-transparent">
                <TableHead className="text-purple-300/70 font-medium w-12">#</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Team</TableHead>
                <TableHead className="text-purple-300/70 font-medium text-right">Members</TableHead>
                <TableHead className="text-purple-300/70 font-medium text-right">Debt Enrolled</TableHead>
                <TableHead className="text-purple-300/70 font-medium text-right">Units</TableHead>
                <TableHead className="text-purple-300/70 font-medium text-right">Commission</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Top Performer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-purple-300/50 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Users className="size-5 opacity-50" />
                      </div>
                      <span>No team data available</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((team, index) => (
                  <TableRow 
                    key={team.teamId} 
                    className={`
                      border-purple-500/10 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer group
                      ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''}
                      ${index === 1 ? 'bg-gradient-to-r from-slate-400/10 to-transparent' : ''}
                      ${index === 2 ? 'bg-gradient-to-r from-orange-600/10 to-transparent' : ''}
                    `}
                  >
                    <TableCell className="font-medium">
                      {index < 3 ? (
                        <div className={`
                          size-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? 'bg-yellow-500/30 text-yellow-300 shadow-lg shadow-yellow-500/20' : ''}
                          ${index === 1 ? 'bg-slate-400/30 text-slate-300' : ''}
                          ${index === 2 ? 'bg-orange-600/30 text-orange-300' : ''}
                        `}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-purple-300/50 text-sm">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white group-hover:text-purple-200 transition-colors">
                          {team.teamName}
                        </span>
                        {index === 0 && (
                          <Trophy className="size-4 text-yellow-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-purple-200/70">
                      {team.memberCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-purple-100/80">
                      {formatCurrency(team.debtLoadEnrolled)}
                    </TableCell>
                    <TableCell className="text-right text-purple-200/70">
                      {team.unitsEnrolled}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-400/80">
                      {formatCurrency(team.totalCommissions)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center text-[10px] font-medium text-purple-200">
                          {team.topPerformer.charAt(0)}
                        </div>
                        <span className="text-purple-200/70 text-sm">{team.topPerformer}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
