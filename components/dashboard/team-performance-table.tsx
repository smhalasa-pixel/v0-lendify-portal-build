'use client'

import * as React from 'react'
import { Users, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import type { TeamMetrics } from '@/lib/types'

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'mtd', label: 'MTD' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'qtd', label: 'QTD' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'All Time' },
]

interface TeamPerformanceTableProps {
  data: TeamMetrics[]
  title?: string
  description?: string
  highlightTeamId?: string
}

export function TeamPerformanceTable({
  data,
  title = 'Team Performance',
  description = 'Performance metrics by team',
  highlightTeamId,
}: TeamPerformanceTableProps) {
  const [dateFilter, setDateFilter] = React.useState('mtd')
  // Sort by debt load enrolled to determine rankings
  const sortedData = [...data].sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="size-4 text-emerald-400" />
      case 'down':
        return <TrendingDown className="size-4 text-rose-400" />
      default:
        return <Minus className="size-4 text-muted-foreground" />
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
    if (grade.startsWith('B')) return 'border-blue-500 text-blue-500 bg-blue-500/10'
    if (grade.startsWith('C')) return 'border-amber-500 text-amber-500 bg-amber-500/10'
    if (grade.startsWith('D')) return 'border-orange-500 text-orange-500 bg-orange-500/10'
    return 'border-red-500 text-red-500 bg-red-500/10'
  }

  const getPacingColor = (pacing: number) => {
    if (pacing >= 100) return 'text-emerald-400'
    if (pacing >= 80) return 'text-blue-400'
    if (pacing >= 60) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="size-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider w-12 text-center">#</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Team</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Units</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Debt Enrolled</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Conv. Rate</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Ancillary</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Grade</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Pacing</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Trend</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Top Performer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-12">
                    No team data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((team, index) => {
                  const isUserTeam = highlightTeamId && team.teamId === highlightTeamId
                  return (
                    <TableRow 
                      key={team.teamId} 
                      className={cn("border-border/50 hover:bg-muted/30", isUserTeam && "bg-primary/5")}
                    >
                      <TableCell className="font-medium text-center">
                        <div className="flex justify-center">
                          {index < 3 ? (
                            <div className={cn(
                              "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                              index === 0 && "bg-yellow-500/20 text-yellow-400",
                              index === 1 && "bg-slate-400/20 text-slate-300",
                              index === 2 && "bg-orange-600/20 text-orange-400"
                            )}>
                              {index + 1}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">{index + 1}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left pl-4">
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
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-medium">{team.unitsEnrolled}</span>
                          <span className="text-[10px] text-muted-foreground">/ {team.monthlyTargetUnits * team.memberCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <CurrencyDisplay value={team.debtLoadEnrolled} className="text-sm font-medium" />
                          <span className="text-[10px] text-muted-foreground">/ <CurrencyDisplay value={team.monthlyTargetDebtLoad * team.memberCount} className="text-[10px]" /></span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{team.conversionRate.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{team.ancillaryCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className={cn("font-semibold cursor-help", getGradeColor(team.performanceGrade))}
                              >
                                {team.performanceGrade}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px] text-center">
                              <p className="text-xs">Based on team&apos;s weighted performance metrics and pacing towards monthly target</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center gap-1 cursor-help">
                                <span className={cn("text-sm font-semibold", getPacingColor(team.pacing))}>
                                  {team.pacing.toFixed(0)}%
                                </span>
                                <Progress 
                                  value={Math.min(team.pacing, 100)} 
                                  className={cn(
                                    "h-1 w-12",
                                    team.pacing < 80 && "[&>div]:bg-rose-500",
                                    team.pacing >= 80 && team.pacing < 100 && "[&>div]:bg-amber-500",
                                    team.pacing >= 100 && "[&>div]:bg-emerald-500"
                                  )}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="flex flex-col gap-1.5 py-1">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-muted-foreground">Units Pacing:</span>
                                  <span className={cn("font-semibold", getPacingColor(team.pacingUnits))}>
                                    {team.pacingUnits.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-muted-foreground">Debt Load Pacing:</span>
                                  <span className={cn("font-semibold", getPacingColor(team.pacingDebtLoad))}>
                                    {team.pacingDebtLoad.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {getTrendIcon(team.trend)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                            {team.topPerformer.charAt(0)}
                          </div>
                          <span className="text-muted-foreground text-sm">{team.topPerformer}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
