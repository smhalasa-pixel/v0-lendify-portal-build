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
  highlightTeamId?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

import { Badge } from '@/components/ui/badge'

export function TeamPerformanceTable({
  data,
  title = 'Team Performance',
  description = 'Performance metrics by team',
  highlightTeamId,
}: TeamPerformanceTableProps) {
  // Sort by debt load enrolled to determine rankings
  const sortedData = [...data].sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium w-12">#</TableHead>
                <TableHead className="text-muted-foreground font-medium">Team</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Members</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Debt Enrolled</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Units</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Commission</TableHead>
                <TableHead className="text-muted-foreground font-medium">Top Performer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No team data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((team, index) => {
                  const isUserTeam = highlightTeamId && team.teamId === highlightTeamId
                  return (
                  <TableRow 
                    key={team.teamId} 
                    className={`border-border/50 hover:bg-muted/30 ${isUserTeam ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="font-medium">
                      {index < 3 ? (
                        <div className={`
                          size-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                          ${index === 1 ? 'bg-slate-400/20 text-slate-300' : ''}
                          ${index === 2 ? 'bg-orange-600/20 text-orange-400' : ''}
                        `}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">{index + 1}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {team.teamName}
                        </span>
                        {index === 0 && (
                          <Trophy className="size-4 text-yellow-400" />
                        )}
                        {isUserTeam && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Your Team</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {team.memberCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-foreground/80">
                      {formatCurrency(team.debtLoadEnrolled)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {team.unitsEnrolled}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-emerald-400">
                      {formatCurrency(team.totalCommissions)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                          {team.topPerformer.charAt(0)}
                        </div>
                        <span className="text-muted-foreground text-sm">{team.topPerformer}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
