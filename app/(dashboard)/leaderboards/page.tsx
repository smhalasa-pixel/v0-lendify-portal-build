'use client'

import * as React from 'react'
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
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { DateRangePicker } from '@/components/date-range-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/lib/types'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

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

export default function LeaderboardsPage() {
  const { user } = useAuth()
  const [period, setPeriod] = React.useState<'mtd' | 'qtd' | 'ytd'>('mtd')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const leaderboard = React.useMemo(() => dataService.getLeaderboard(period), [period])

  // Find current user's position
  const userRank = user ? leaderboard.find((entry) => entry.agentId === user.id) : null

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'mtd' | 'qtd' | 'ytd')}>
            <TabsList>
              <TabsTrigger value="mtd">This Month</TabsTrigger>
              <TabsTrigger value="qtd">This Quarter</TabsTrigger>
              <TabsTrigger value="ytd">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Your Position Card (if applicable) */}
      {userRank && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">#{userRank.rank}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Your Current Ranking</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(userRank.totalVolume)} in volume | {userRank.totalUnits} units
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(userRank.trend)}
                <span className="text-sm text-muted-foreground">
                  {userRank.previousRank && userRank.rank !== userRank.previousRank
                    ? `${userRank.trend === 'up' ? '+' : ''}${userRank.previousRank - userRank.rank} from last period`
                    : 'No change'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
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
                    {formatCurrency(entry.totalVolume / 1000000)}M
                  </p>
                  <p className="text-xs text-muted-foreground">Volume</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{entry.totalUnits}</p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(entry.totalCommissions / 1000)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Earned</p>
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
                  {formatCurrency(leaderboard.reduce((sum, e) => sum + e.totalVolume, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
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
                  {leaderboard.reduce((sum, e) => sum + e.totalUnits, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Units</p>
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
                <p className="text-2xl font-bold">{leaderboard.length}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>All agents ranked by total volume</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Commissions</TableHead>
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
                  <TableCell>
                    <div className="flex items-center justify-center size-8">
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
                  <TableCell className="text-muted-foreground">{entry.teamName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.totalVolume)}
                  </TableCell>
                  <TableCell className="text-right">{entry.totalUnits}</TableCell>
                  <TableCell className="text-right text-success font-medium">
                    {formatCurrency(entry.totalCommissions)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(entry.trend)}
                      {entry.previousRank && entry.rank !== entry.previousRank && (
                        <span className="text-xs text-muted-foreground">
                          ({entry.previousRank > entry.rank ? '+' : ''}{entry.previousRank - entry.rank})
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
