'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import type { AgentPerformance } from '@/lib/types'

interface AgentPerformanceTableProps {
  data: AgentPerformance[]
  title?: string
  description?: string
}

export function AgentPerformanceTable({
  data,
  title = 'My Team Agents',
  description = 'Individual performance breakdown for your team members',
}: AgentPerformanceTableProps) {

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

  const getCallQueueTierConfig = (tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum' | 'titanium' | 'champion') => {
    const configs = {
      bronze: { label: 'Bronze', abbrev: 'BRZ', color: 'bg-amber-700/20 text-amber-600 border-amber-700/30', description: 'Entry level queue' },
      silver: { label: 'Silver', abbrev: 'SLV', color: 'bg-slate-400/20 text-slate-300 border-slate-400/30', description: 'Standard queue' },
      gold: { label: 'Gold', abbrev: 'GLD', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', description: 'Priority queue' },
      diamond: { label: 'Diamond', abbrev: 'DIA', color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30', description: 'High priority queue' },
      platinum: { label: 'Platinum', abbrev: 'PLT', color: 'bg-violet-400/20 text-violet-300 border-violet-400/30', description: 'Elite queue' },
      titanium: { label: 'Titanium', abbrev: 'TIT', color: 'bg-blue-400/20 text-blue-300 border-blue-400/30', description: 'Top performer queue' },
      champion: { label: 'Champion', abbrev: 'CHP', color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30', description: 'Champion tier - Best performers' },
    }
    return configs[tier]
  }

  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Agent</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Units</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Debt Enrolled</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Conv. Rate</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Grade</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Pacing</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Queue</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((agent) => {
                const isPacingBehind = agent.pacing < 80
                return (
                  <TableRow key={agent.agentId} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Avatar className="size-7">
                          <AvatarImage src={agent.avatar} alt={agent.agentName} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {agent.agentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{agent.agentName}</span>
                        </div>
                        {isPacingBehind && (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="size-3.5 text-rose-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Behind pace - may need attention</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">{agent.unitsEnrolled}</span>
                        <span className="text-[10px] text-muted-foreground">/ {agent.monthlyTargetUnits}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <CurrencyDisplay value={agent.debtLoadEnrolled} className="text-sm font-medium" />
                        <span className="text-[10px] text-muted-foreground">/ <CurrencyDisplay value={agent.monthlyTargetDebtLoad} className="text-[10px]" /></span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{agent.conversionRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn("font-semibold cursor-help", getGradeColor(agent.performanceGrade))}
                            >
                              {agent.performanceGrade}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px] text-center">
                            <p className="text-xs">Based on weighted performance metrics and pacing towards monthly target</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-1 cursor-help">
                              <span className={cn("text-sm font-semibold", getPacingColor(agent.pacing))}>
                                {agent.pacing.toFixed(0)}%
                              </span>
                              <Progress 
                                value={Math.min(agent.pacing, 100)} 
                                className={cn(
                                  "h-1 w-12",
                                  agent.pacing < 80 && "[&>div]:bg-rose-500",
                                  agent.pacing >= 80 && agent.pacing < 100 && "[&>div]:bg-amber-500",
                                  agent.pacing >= 100 && "[&>div]:bg-emerald-500"
                                )}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <div className="flex flex-col gap-1.5 py-1">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Units Pacing:</span>
                                <span className={cn("font-semibold", getPacingColor(agent.pacingUnits))}>
                                  {agent.pacingUnits.toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">Debt Load Pacing:</span>
                                <span className={cn("font-semibold", getPacingColor(agent.pacingDebtLoad))}>
                                  {agent.pacingDebtLoad.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] font-semibold cursor-help px-1.5 py-0.5", getCallQueueTierConfig(agent.callQueueTier).color)}
                            >
                              {getCallQueueTierConfig(agent.callQueueTier).abbrev}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs font-medium">{getCallQueueTierConfig(agent.callQueueTier).label}</p>
                            <p className="text-xs text-muted-foreground">{getCallQueueTierConfig(agent.callQueueTier).description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendIcon(agent.trend)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
