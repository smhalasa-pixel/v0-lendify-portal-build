'use client'

import * as React from 'react'
import Link from 'next/link'
import { 
  Radio, 
  Users, 
  AlertTriangle, 
  Clock,
  Coffee,
  Phone,
  TrendingUp,
  TrendingDown,
  Bell,
  Download,
  RefreshCw,
  Eye,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useAuth, useHasAccess } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { AgentStatus, RTAInfraction, AgentActivityStatus } from '@/lib/types'
import { BREAK_LABELS } from '@/lib/types'

const STATUS_CONFIG: Record<AgentActivityStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  on_break: { label: 'On Break', color: 'text-amber-400', bgColor: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'text-gray-400', bgColor: 'bg-gray-500' },
  away: { label: 'Away', color: 'text-rose-400', bgColor: 'bg-rose-500' },
  in_call: { label: 'In Call', color: 'text-blue-400', bgColor: 'bg-blue-500' },
}

const SEVERITY_CONFIG = {
  low: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  medium: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  high: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  critical: { color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
}

export default function RTADashboardPage() {
  const { user } = useAuth()
  const hasRTAAccess = useHasAccess(['rta', 'admin'])
  const [summary, setSummary] = React.useState(dataService.getRTASummary())
  const [agentStatuses, setAgentStatuses] = React.useState<AgentStatus[]>([])
  const [infractions, setInfractions] = React.useState<RTAInfraction[]>([])
  const [lastRefresh, setLastRefresh] = React.useState(new Date())
  const [isLive, setIsLive] = React.useState(true)
  const [refreshInterval, setRefreshInterval] = React.useState(5) // seconds
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = React.useState(5)

  // Live feed data loading
  React.useEffect(() => {
    const loadData = () => {
      setIsRefreshing(true)
      setSummary(dataService.getRTASummary())
      setAgentStatuses(dataService.getAgentStatuses())
      setInfractions(dataService.getInfractions())
      setLastRefresh(new Date())
      setSecondsUntilRefresh(refreshInterval)
      setTimeout(() => setIsRefreshing(false), 300)
    }

    loadData()
    
    if (!isLive) return

    const dataInterval = setInterval(loadData, refreshInterval * 1000)
    return () => clearInterval(dataInterval)
  }, [isLive, refreshInterval])

  // Countdown timer
  React.useEffect(() => {
    if (!isLive) return
    
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => (prev <= 1 ? refreshInterval : prev - 1))
    }, 1000)
    
    return () => clearInterval(countdownInterval)
  }, [isLive, refreshInterval])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setSummary(dataService.getRTASummary())
    setAgentStatuses(dataService.getAgentStatuses())
    setInfractions(dataService.getInfractions())
    setLastRefresh(new Date())
    setSecondsUntilRefresh(refreshInterval)
    setTimeout(() => setIsRefreshing(false), 300)
  }

  const handleExport = () => {
    // Generate CSV export
    const headers = ['Agent', 'Team', 'Status', 'Break Time', 'Infractions']
    const rows = agentStatuses.map(a => [
      a.agentName,
      a.teamName,
      STATUS_CONFIG[a.status].label,
      `${a.totalBreakTimeToday}m`,
      a.isInfraction ? 'Yes' : 'No'
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rta-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pendingInfractions = infractions.filter(i => i.status === 'pending')
  const agentsOnBreak = agentStatuses.filter(a => a.status === 'on_break')
  const agentsWithIssues = agentStatuses.filter(a => a.isInfraction)

  const adherenceRate = summary.totalAgents > 0 
    ? Math.round(((summary.totalAgents - summary.pendingInfractions) / summary.totalAgents) * 100)
    : 100

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  if (!hasRTAAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="size-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access the RTA Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Live Feed Banner */}
      <div className={cn(
        "rounded-lg border p-3 transition-all duration-300",
        isLive 
          ? "bg-emerald-500/5 border-emerald-500/30" 
          : "bg-muted/50 border-border"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isLive ? (
              <div className="relative flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-400">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-gray-500"></span>
                <span className="font-semibold text-muted-foreground">PAUSED</span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {isLive ? `Refreshing in ${secondsUntilRefresh}s` : 'Live feed paused'}
            </span>
            {isRefreshing && (
              <RefreshCw className="size-4 text-primary animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Last update: {lastRefresh.toLocaleTimeString()}
            </span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="h-8 rounded-md border bg-background px-2 text-xs"
              disabled={!isLive}
            >
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
            <Button
              variant={isLive ? "outline" : "default"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={cn(isLive && "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10")}
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="size-6 text-primary" />
            RTA Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-Time Adherence monitoring and agent status overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="size-8 text-primary" />
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                <TrendingUp className="size-3 mr-1" />
                +2.3%
              </Badge>
            </div>
            <p className={cn(
              "text-3xl font-bold tabular-nums transition-all duration-300",
              isRefreshing && "scale-105"
            )}>{adherenceRate}%</p>
            <p className="text-sm text-muted-foreground">Adherence Rate</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br from-emerald-500/10 to-background border-emerald-500/20 transition-all duration-300",
          isRefreshing && "ring-2 ring-emerald-500/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="size-8 text-emerald-500" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground">of {summary.totalAgents}</span>
              </div>
            </div>
            <p className={cn(
              "text-3xl font-bold text-emerald-400 tabular-nums transition-all duration-300",
              isRefreshing && "scale-105"
            )}>{summary.activeAgents + summary.inCallAgents}</p>
            <p className="text-sm text-muted-foreground">Productive Agents</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br from-amber-500/10 to-background border-amber-500/20 transition-all duration-300",
          isRefreshing && "ring-2 ring-amber-500/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Coffee className="size-8 text-amber-500" />
            </div>
            <p className={cn(
              "text-3xl font-bold text-amber-400 tabular-nums transition-all duration-300",
              isRefreshing && "scale-105"
            )}>{summary.onBreakAgents}</p>
            <p className="text-sm text-muted-foreground">Currently On Break</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br to-background transition-all duration-300",
          summary.criticalInfractions > 0 
            ? "from-rose-500/20 border-rose-500/30" 
            : "from-muted/50",
          isRefreshing && summary.criticalInfractions > 0 && "ring-2 ring-rose-500/30"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className={cn(
                "size-8",
                summary.criticalInfractions > 0 ? "text-rose-500" : "text-muted-foreground"
              )} />
              {summary.pendingInfractions > 0 && (
                <Badge variant="destructive" className="animate-pulse">{summary.pendingInfractions} pending</Badge>
              )}
            </div>
            <p className={cn(
              "text-3xl font-bold tabular-nums transition-all duration-300",
              summary.criticalInfractions > 0 ? "text-rose-400" : "",
              isRefreshing && "scale-105"
            )}>{summary.totalInfractions}</p>
            <p className="text-sm text-muted-foreground">Total Infractions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Status Breakdown</CardTitle>
              <Link href="/rta/agents">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Active */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Radio className="size-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Active</span>
                  <span className="text-sm text-emerald-400">{summary.activeAgents}</span>
                </div>
                <Progress 
                  value={(summary.activeAgents / summary.totalAgents) * 100} 
                  className="h-1.5 [&>div]:bg-emerald-500"
                />
              </div>
            </div>

            {/* In Call */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Phone className="size-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">In Call</span>
                  <span className="text-sm text-blue-400">{summary.inCallAgents}</span>
                </div>
                <Progress 
                  value={(summary.inCallAgents / summary.totalAgents) * 100} 
                  className="h-1.5 [&>div]:bg-blue-500"
                />
              </div>
            </div>

            {/* On Break */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Coffee className="size-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">On Break</span>
                  <span className="text-sm text-amber-400">{summary.onBreakAgents}</span>
                </div>
                <Progress 
                  value={(summary.onBreakAgents / summary.totalAgents) * 100} 
                  className="h-1.5 [&>div]:bg-amber-500"
                />
              </div>
            </div>

            {/* Away */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Away</span>
                  <span className="text-sm text-rose-400">{summary.awayAgents}</span>
                </div>
                <Progress 
                  value={(summary.awayAgents / summary.totalAgents) * 100} 
                  className="h-1.5 [&>div]:bg-rose-500"
                />
              </div>
            </div>

            {/* Offline */}
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Users className="size-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Offline</span>
                  <span className="text-sm text-gray-400">{summary.offlineAgents}</span>
                </div>
                <Progress 
                  value={(summary.offlineAgents / summary.totalAgents) * 100} 
                  className="h-1.5 [&>div]:bg-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currently On Break */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coffee className="size-5 text-amber-500" />
                On Break Now
              </CardTitle>
              <Badge variant="outline">{agentsOnBreak.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {agentsOnBreak.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No agents currently on break
              </p>
            ) : (
              agentsOnBreak.slice(0, 5).map(agent => {
                const breakDuration = agent.currentBreak 
                  ? Math.floor((Date.now() - new Date(agent.currentBreak.startTime).getTime()) / 60000)
                  : 0
                const isOvertime = agent.currentBreak && breakDuration > agent.currentBreak.scheduledDuration

                return (
                  <div 
                    key={agent.agentId}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      isOvertime ? "bg-rose-500/10 border border-rose-500/30" : "bg-amber-500/5"
                    )}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="text-xs">
                        {agent.agentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.agentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.currentBreak && BREAK_LABELS[agent.currentBreak.breakType]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-mono font-bold",
                        isOvertime ? "text-rose-400" : "text-amber-400"
                      )}>
                        {breakDuration}m
                      </p>
                      {agent.currentBreak && (
                        <p className="text-xs text-muted-foreground">
                          / {agent.currentBreak.scheduledDuration}m
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Pending Infractions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="size-5 text-rose-500" />
                Pending Infractions
              </CardTitle>
              <Link href="/rta/infractions">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInfractions.length === 0 ? (
              <div className="text-center py-4">
                <Zap className="size-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No pending infractions
                </p>
              </div>
            ) : (
              pendingInfractions.slice(0, 4).map(infraction => {
                const config = SEVERITY_CONFIG[infraction.severity]
                return (
                  <div 
                    key={infraction.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-xs">
                            {infraction.agentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{infraction.agentName}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px]", config.color, config.borderColor)}
                      >
                        {infraction.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {infraction.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeSince(infraction.occurredAt)}
                      </span>
                      {!infraction.notifiedLeadership && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <Bell className="size-3 mr-1" />
                          Notify Lead
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents with Issues */}
      {agentsWithIssues.length > 0 && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="size-5 text-rose-500" />
              Agents Requiring Attention
            </CardTitle>
            <CardDescription>
              These agents have active infractions or require follow-up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentsWithIssues.map(agent => (
                <div 
                  key={agent.agentId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background border border-rose-500/20"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback>
                        {agent.agentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
                      STATUS_CONFIG[agent.status].bgColor
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.agentName}</p>
                    <p className="text-xs text-rose-400 truncate">{agent.infractionReason}</p>
                  </div>
                  <Link href="/rta/agents">
                    <Button variant="outline" size="sm">
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
