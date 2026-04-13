'use client'

import * as React from 'react'
import { format, subDays, startOfMonth, startOfQuarter, startOfYear, subMonths, subQuarters, subYears, differenceInDays } from 'date-fns'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Medal,
  Crown,
  DollarSign,
  Users,
  Target,
  CalendarIcon,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import type { LeaderboardEntry } from '@/lib/types'

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="size-5 text-yellow-500" />
  if (rank === 2) return <Medal className="size-5 text-gray-400" />
  if (rank === 3) return <Medal className="size-5 text-amber-600" />
  return <span className="text-sm font-bold text-muted-foreground">{rank}</span>
}

function getTrendIcon(trend: 'up' | 'down' | 'same') {
  if (trend === 'up') return <TrendingUp className="size-4 text-success" />
  if (trend === 'down') return <TrendingDown className="size-4 text-destructive" />
  return <Minus className="size-4 text-muted-foreground" />
}

const periodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last14', label: 'Last 14 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'lastQuarter', label: 'Last Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
]

// Helper to calculate date ranges and their comparison periods
function getDateRangeInfo(period: string, customRange?: { from?: Date; to?: Date }) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  let from: Date
  let to: Date = today
  
  switch (period) {
    case 'today':
      from = new Date(today)
      from.setHours(0, 0, 0, 0)
      break
    case 'yesterday':
      from = subDays(today, 1)
      from.setHours(0, 0, 0, 0)
      to = subDays(today, 1)
      to.setHours(23, 59, 59, 999)
      break
    case 'last7':
      from = subDays(today, 6)
      break
    case 'last14':
      from = subDays(today, 13)
      break
    case 'last30':
      from = subDays(today, 29)
      break
    case 'mtd':
      from = startOfMonth(today)
      break
    case 'lastMonth':
      from = startOfMonth(subMonths(today, 1))
      to = subDays(startOfMonth(today), 1)
      break
    case 'qtd':
      from = startOfQuarter(today)
      break
    case 'lastQuarter':
      from = startOfQuarter(subQuarters(today, 1))
      to = subDays(startOfQuarter(today), 1)
      break
    case 'ytd':
      from = startOfYear(today)
      break
    case 'lastYear':
      from = startOfYear(subYears(today, 1))
      to = subDays(startOfYear(today), 1)
      break
    case 'custom':
      if (customRange?.from && customRange?.to) {
        from = customRange.from
        to = customRange.to
      } else {
        from = subDays(today, 29)
      }
      break
    default:
      from = startOfMonth(today)
  }
  
  // Calculate the comparison period (same length, immediately before)
  const daysDiff = differenceInDays(to, from) + 1
  const comparisonTo = subDays(from, 1)
  const comparisonFrom = subDays(comparisonTo, daysDiff - 1)
  
  return {
    from,
    to,
    daysDiff,
    comparisonFrom,
    comparisonTo,
  }
}

interface TeamLeaderboardEntry {
  rank: number
  teamId: string
  teamName: string
  agentCount: number
  unitsClosed: number
  debtLoadEnrolled: number
  unitsEnrolled: number
  avgConversionRate: number
  performanceGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  previousRank?: number
  trend: 'up' | 'down' | 'same'
}

export default function LeaderboardsPage() {
  const { user } = useAuth()
  
  // Role checks
  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'
  const isExecutive = user?.role === 'executive'
  
  // Determine if user can toggle between views
  // Agent and Executive can see both views, Leadership and Supervisor see Team only
  const canToggleView = isAgent || isExecutive
  
  const [period, setPeriod] = React.useState('mtd')
  const [viewType, setViewType] = React.useState<'agent' | 'team'>(canToggleView ? 'agent' : 'team')
  const [customRange, setCustomRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const leaderboard = React.useMemo(() => dataService.getLeaderboard(period as 'mtd' | 'qtd' | 'ytd'), [period])
  
  // Aggregate leaderboard data by team
  const teamLeaderboard = React.useMemo<TeamLeaderboardEntry[]>(() => {
    const teamMap = new Map<string, {
      teamId: string
      teamName: string
      agents: typeof leaderboard
    }>()
    
    leaderboard.forEach(entry => {
      const teamId = entry.teamId || 'unknown'
      const teamName = entry.teamName || 'Unknown Team'
      
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, { teamId, teamName, agents: [] })
      }
      teamMap.get(teamId)!.agents.push(entry)
    })
    
    const teams: TeamLeaderboardEntry[] = Array.from(teamMap.values()).map(team => {
      const totalUnitsClosed = team.agents.reduce((sum, a) => sum + a.unitsClosed, 0)
      const totalDebtLoad = team.agents.reduce((sum, a) => sum + a.debtLoadEnrolled, 0)
      const totalUnitsEnrolled = team.agents.reduce((sum, a) => sum + a.unitsEnrolled, 0)
      const avgConversion = team.agents.reduce((sum, a) => sum + a.conversionRate, 0) / team.agents.length
      
      // Calculate team grade based on average of individual grades
      const gradeValues: Record<string, number> = {
        'A+': 12, 'A': 11, 'A-': 10, 'B+': 9, 'B': 8, 'B-': 7, 
        'C+': 6, 'C': 5, 'C-': 4, 'D': 3, 'F': 1
      }
      const gradeFromValue = (v: number): TeamLeaderboardEntry['performanceGrade'] => {
        if (v >= 11.5) return 'A+'
        if (v >= 10.5) return 'A'
        if (v >= 9.5) return 'A-'
        if (v >= 8.5) return 'B+'
        if (v >= 7.5) return 'B'
        if (v >= 6.5) return 'B-'
        if (v >= 5.5) return 'C+'
        if (v >= 4.5) return 'C'
        if (v >= 3.5) return 'C-'
        if (v >= 2) return 'D'
        return 'F'
      }
      const avgGradeValue = team.agents.reduce((sum, a) => sum + (gradeValues[a.performanceGrade] || 5), 0) / team.agents.length
      
      return {
        rank: 0,
        teamId: team.teamId,
        teamName: team.teamName,
        agentCount: team.agents.length,
        unitsClosed: totalUnitsClosed,
        debtLoadEnrolled: totalDebtLoad,
        unitsEnrolled: totalUnitsEnrolled,
        avgConversionRate: avgConversion,
        performanceGrade: gradeFromValue(avgGradeValue),
        trend: team.agents[0]?.trend || 'same',
      }
    })
    
    // Sort by debt load enrolled and assign ranks
    teams.sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)
    teams.forEach((team, idx) => {
      team.rank = idx + 1
      team.previousRank = idx + 1 + (team.trend === 'up' ? 1 : team.trend === 'down' ? -1 : 0)
    })
    
    return teams
  }, [leaderboard])
  
  const dateRangeInfo = React.useMemo(() => getDateRangeInfo(period, customRange), [period, customRange])
  
  const currentPeriodLabel = React.useMemo(() => {
    if (period === 'custom' && customRange.from && customRange.to) {
      return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d, yyyy')}`
    }
    return periodOptions.find(p => p.value === period)?.label || 'Month to Date'
  }, [period, customRange])
  
  const comparisonPeriodLabel = React.useMemo(() => {
    return `${format(dateRangeInfo.comparisonFrom, 'MMM d')} - ${format(dateRangeInfo.comparisonTo, 'MMM d, yyyy')}`
  }, [dateRangeInfo])

  // Find current user's position (agent view) - reactive to period changes
  const userRank = React.useMemo(() => {
    if (!user) return null
    return leaderboard.find((entry) => entry.agentId === user.id) || null
  }, [user, leaderboard])
  
  // Find current user's team position (team view) - reactive to period changes
  const userTeamRank = React.useMemo(() => {
    if (!user?.teamId) return null
    return teamLeaderboard.find((team) => team.teamId === user.teamId) || null
  }, [user, teamLeaderboard])

  // Top 3 for podium
  const topThree = leaderboard.slice(0, 3)

  // Rest of leaderboard
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaderboards</h1>
          <p className="text-muted-foreground">
            See how you stack up against your peers
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle - only for Agent and Executive */}
          {canToggleView && (
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewType('agent')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  viewType === 'agent' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Agent
              </button>
              <button
                onClick={() => setViewType('team')}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  viewType === 'team' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Team
              </button>
            </div>
          )}

          <Select value={period} onValueChange={(val) => {
            setPeriod(val)
            if (val === 'custom' && !customRange.from) {
              setCalendarOpen(true)
            }
          }}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="size-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {period === 'custom' && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  {customRange.from && customRange.to 
                    ? `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={(range) => {
                    setCustomRange({ from: range?.from, to: range?.to })
                    if (range?.from && range?.to) {
                      setCalendarOpen(false)
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Your Position Card - Agent view for agents only */}
      {viewType === 'agent' && isAgent && userRank && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{userRank.rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Your Current Ranking</p>
<p className="text-sm text-muted-foreground">
                        <CurrencyDisplay value={userRank.debtLoadEnrolled} className="text-sm" /> enrolled | {userRank.unitsEnrolled} units
                      </p>
              </div>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      {getTrendIcon(userRank.trend)}
                      <span className="text-sm text-muted-foreground">
                        {userRank.previousRank && userRank.rank !== userRank.previousRank
                          ? `${userRank.trend === 'up' ? '+' : ''}${userRank.previousRank - userRank.rank} from last period`
                          : 'No change'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Compared to: {comparisonPeriodLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Team Position Card - for agents in team view, and team leads */}
      {viewType === 'team' && (isAgent || isLeadership) && userTeamRank && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{userTeamRank.rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Your Team&apos;s Current Ranking</p>
<p className="text-sm text-muted-foreground">
                        {userTeamRank.teamName} | <CurrencyDisplay value={userTeamRank.debtLoadEnrolled} className="text-sm" /> enrolled | {userTeamRank.unitsClosed} units closed
                      </p>
              </div>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      {getTrendIcon(userTeamRank.trend)}
                      <span className="text-sm text-muted-foreground">
                        {userTeamRank.previousRank && userTeamRank.rank !== userTeamRank.previousRank
                          ? `${userTeamRank.trend === 'up' ? '+' : ''}${userTeamRank.previousRank - userTeamRank.rank} from last period`
                          : 'No change'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Compared to: {comparisonPeriodLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {viewType === 'agent' ? (
        <div className="grid md:grid-cols-3 gap-4">
          {topThree.map((entry, index) => (
            <Card
              key={entry.agentId}
              className={cn(
                'relative overflow-hidden',
                index === 0 && 'md:order-2 bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/20',
                index === 1 && 'md:order-1 bg-gradient-to-b from-gray-400/10 to-transparent border-gray-400/20',
                index === 2 && 'md:order-3 bg-gradient-to-b from-amber-600/10 to-transparent border-amber-600/20'
              )}
            >
              <CardContent className="pt-6 text-center">
                {/* Rank Badge */}
                <div className="absolute top-3 right-3">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <Avatar className="size-20 mx-auto mb-4 ring-4 ring-background">
                  <AvatarImage src={entry.avatar} alt={entry.agentName} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {entry.agentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <h3 className="font-semibold text-lg">{entry.agentName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{entry.teamName}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
<p className="text-lg font-bold text-primary">
                              <CurrencyDisplay value={entry.debtLoadEnrolled} className="text-lg" />
                            </p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{entry.unitsEnrolled}</p>
                    <p className="text-xs text-muted-foreground">Units</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-success">
                      {entry.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Qualified Conv.</p>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-center gap-1 mt-4 text-sm">
                  {getTrendIcon(entry.trend)}
                  <span className="text-muted-foreground">
                    {entry.trend === 'up' && 'Moving up'}
                    {entry.trend === 'down' && 'Dropped'}
                    {entry.trend === 'same' && 'Holding steady'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {teamLeaderboard.slice(0, 3).map((team, index) => (
            <Card
              key={team.teamId}
              className={cn(
                'relative overflow-hidden',
                index === 0 && 'md:order-2 bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/20',
                index === 1 && 'md:order-1 bg-gradient-to-b from-gray-400/10 to-transparent border-gray-400/20',
                index === 2 && 'md:order-3 bg-gradient-to-b from-amber-600/10 to-transparent border-amber-600/20'
              )}
            >
              <CardContent className="pt-6 text-center">
                {/* Rank Badge */}
                <div className="absolute top-3 right-3">
                  {getRankIcon(team.rank)}
                </div>

                {/* Team Icon */}
                <div className="size-20 mx-auto mb-4 ring-4 ring-background rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="size-10 text-primary" />
                </div>

                {/* Name */}
                <h3 className="font-semibold text-lg">{team.teamName}</h3>
                <p className="text-sm text-muted-foreground mb-4">{team.agentCount} agents</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
<p className="text-lg font-bold text-primary">
                              <CurrencyDisplay value={team.debtLoadEnrolled} className="text-lg" />
                            </p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{team.unitsClosed}</p>
                    <p className="text-xs text-muted-foreground">Closed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-success">
                      {team.avgConversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Conv.</p>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center justify-center gap-1 mt-4 text-sm">
                  {getTrendIcon(team.trend)}
                  <span className="text-muted-foreground">
                    {team.trend === 'up' && 'Moving up'}
                    {team.trend === 'down' && 'Dropped'}
                    {team.trend === 'same' && 'Holding steady'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="size-6 text-primary" />
              </div>
              <div>
<p className="text-2xl font-bold">
                      <CurrencyDisplay value={leaderboard.reduce((sum, e) => sum + e.debtLoadEnrolled, 0)} className="text-2xl" />
                    </p>
                <p className="text-sm text-muted-foreground">Total Debt Load Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Target className="size-6 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {viewType === 'agent' 
                    ? leaderboard.reduce((sum, e) => sum + e.unitsEnrolled, 0)
                    : teamLeaderboard.reduce((sum, t) => sum + t.unitsClosed, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewType === 'agent' ? 'Total Units Enrolled' : 'Total Units Closed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Users className="size-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {viewType === 'agent' ? leaderboard.length : teamLeaderboard.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewType === 'agent' ? 'Active Sales Agents' : 'Active Teams'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>
            {viewType === 'agent' 
              ? 'All sales agents ranked by debt load enrolled'
              : 'All teams ranked by total debt load enrolled'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {viewType === 'agent' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">Rank</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">Team</TableHead>
                  <TableHead className="text-center">Units Closed</TableHead>
                  <TableHead className="text-center">Debt Enrolled</TableHead>
                  <TableHead className="text-center">Conversion Rate</TableHead>
                  <TableHead className="text-center">Performance Grade</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow
                    key={entry.agentId}
                    className={cn(
                      user?.id === entry.agentId && 'bg-primary/5'
                    )}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center size-8 mx-auto">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={entry.avatar} alt={entry.agentName} />
                          <AvatarFallback className="text-xs">
                            {entry.agentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.agentName}</span>
                        {user?.id === entry.agentId && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{entry.teamName}</TableCell>
                    <TableCell className="text-center font-medium">{entry.unitsClosed}</TableCell>
<TableCell className="text-center font-medium">
                            <CurrencyDisplay value={entry.debtLoadEnrolled} />
                          </TableCell>
                    <TableCell className="text-center font-medium">
                      {entry.conversionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-semibold cursor-help",
                                entry.performanceGrade.startsWith('A') && "border-emerald-500 text-emerald-500 bg-emerald-500/10",
                                entry.performanceGrade.startsWith('B') && "border-blue-500 text-blue-500 bg-blue-500/10",
                                entry.performanceGrade.startsWith('C') && "border-amber-500 text-amber-500 bg-amber-500/10",
                                entry.performanceGrade.startsWith('D') && "border-orange-500 text-orange-500 bg-orange-500/10",
                                entry.performanceGrade === 'F' && "border-red-500 text-red-500 bg-red-500/10"
                              )}
                            >
                              {entry.performanceGrade}
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
                            <div className="flex items-center justify-center gap-1 cursor-help">
                              {getTrendIcon(entry.trend)}
                              {entry.previousRank && entry.rank !== entry.previousRank && (
                                <span className="text-xs text-muted-foreground">
                                  ({entry.previousRank > entry.rank ? '+' : ''}{entry.previousRank - entry.rank})
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">vs {comparisonPeriodLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Agents</TableHead>
                  <TableHead className="text-center">Units Closed</TableHead>
                  <TableHead className="text-center">Debt Enrolled</TableHead>
                  <TableHead className="text-center">Avg Conversion</TableHead>
                  <TableHead className="text-center">Performance Grade</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamLeaderboard.map((team) => (
                  <TableRow key={team.teamId}>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center size-8 mx-auto">
                        {getRankIcon(team.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="size-4 text-primary" />
                        </div>
                        <span className="font-medium">{team.teamName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{team.agentCount}</TableCell>
                    <TableCell className="text-center font-medium">{team.unitsClosed}</TableCell>
<TableCell className="text-center font-medium">
                            <CurrencyDisplay value={team.debtLoadEnrolled} />
                          </TableCell>
                    <TableCell className="text-center font-medium">
                      {team.avgConversionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-semibold cursor-help",
                                team.performanceGrade.startsWith('A') && "border-emerald-500 text-emerald-500 bg-emerald-500/10",
                                team.performanceGrade.startsWith('B') && "border-blue-500 text-blue-500 bg-blue-500/10",
                                team.performanceGrade.startsWith('C') && "border-amber-500 text-amber-500 bg-amber-500/10",
                                team.performanceGrade.startsWith('D') && "border-orange-500 text-orange-500 bg-orange-500/10",
                                team.performanceGrade === 'F' && "border-red-500 text-red-500 bg-red-500/10"
                              )}
                            >
                              {team.performanceGrade}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px] text-center">
                            <p className="text-xs">Average of team members weighted performance and pacing towards target</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1 cursor-help">
                              {getTrendIcon(team.trend)}
                              {team.previousRank && team.rank !== team.previousRank && (
                                <span className="text-xs text-muted-foreground">
                                  ({team.previousRank > team.rank ? '+' : ''}{team.previousRank - team.rank})
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">vs {comparisonPeriodLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
