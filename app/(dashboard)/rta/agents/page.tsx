'use client'

import * as React from 'react'
import { 
  Users, 
  Radio, 
  Coffee, 
  Phone, 
  Clock, 
  AlertTriangle, 
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Eye,
  Bell,
  MessageSquare,
  MoreHorizontal,
  LayoutGrid,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { AgentStatus, AgentActivityStatus, Team } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'

const STATUS_CONFIG: Record<AgentActivityStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-500', icon: Radio },
  break: { label: 'Break', color: 'text-amber-400', bgColor: 'bg-amber-500', icon: Coffee },
  restroom: { label: 'Rest-Room', color: 'text-blue-400', bgColor: 'bg-blue-500', icon: Clock },
  coaching: { label: 'Coaching', color: 'text-purple-400', bgColor: 'bg-purple-500', icon: Users },
  offline: { label: 'Offline', color: 'text-gray-400', bgColor: 'bg-gray-500', icon: Users },
}

export default function AgentStatusPage() {
  const { user } = useAuth()
  const [agentStatuses, setAgentStatuses] = React.useState<AgentStatus[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<AgentActivityStatus | 'all'>('all')
  const [teamFilter, setTeamFilter] = React.useState<string>('all')
  const [lastRefresh, setLastRefresh] = React.useState(new Date())
  const [selectedAgent, setSelectedAgent] = React.useState<AgentStatus | null>(null)
  const [isNotifyOpen, setIsNotifyOpen] = React.useState(false)
  const [notifyMessage, setNotifyMessage] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid')

  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'
  const isRTA = user?.role === 'rta'
  const isAdmin = user?.role === 'admin'

  const [isLive, setIsLive] = React.useState(true)
  const [refreshInterval, setRefreshInterval] = React.useState(1) // 1 second true live feed
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = React.useState(1)

  // Load data with live feed
  React.useEffect(() => {
    const loadData = () => {
      setIsRefreshing(true)
      let filters: { teamId?: string; supervisorId?: string } = {}
      
      if (isLeadership && user?.teamId) {
        filters.teamId = user.teamId
      } else if (isSupervisor && user?.id) {
        filters.supervisorId = user.id
      }
      
      setAgentStatuses(dataService.getAgentStatuses(filters))
      setTeams(dataService.getTeams())
      setLastRefresh(new Date())
      setSecondsUntilRefresh(refreshInterval)
      setTimeout(() => setIsRefreshing(false), 300)
    }

    loadData()
    
    if (!isLive) return

    const interval = setInterval(loadData, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [user, isLeadership, isSupervisor, isLive, refreshInterval])

  // Countdown timer
  React.useEffect(() => {
    if (!isLive) return
    
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => (prev <= 1 ? refreshInterval : prev - 1))
    }, 1000)
    
    return () => clearInterval(countdownInterval)
  }, [isLive, refreshInterval])

  // Filter agents
  const filteredAgents = React.useMemo(() => {
    let results = [...agentStatuses]

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(a => 
        a.agentName.toLowerCase().includes(searchLower) ||
        a.teamName.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      results = results.filter(a => a.status === statusFilter)
    }

    if (teamFilter !== 'all') {
      results = results.filter(a => a.teamId === teamFilter)
    }

    return results
  }, [agentStatuses, search, statusFilter, teamFilter])

  // Stats
  const stats = React.useMemo(() => {
    const total = agentStatuses.length
    const active = agentStatuses.filter(a => a.status === 'active').length
    const onBreak = agentStatuses.filter(a => a.status === 'break').length
    const restroom = agentStatuses.filter(a => a.status === 'restroom').length
    const coaching = agentStatuses.filter(a => a.status === 'coaching').length
    const offline = agentStatuses.filter(a => a.status === 'offline').length
    const withInfractions = agentStatuses.filter(a => a.isInfraction).length

    return { total, active, onBreak, restroom, coaching, offline, withInfractions }
  }, [agentStatuses])

  const handleRefresh = () => {
    setIsRefreshing(true)
    let filters: { teamId?: string; supervisorId?: string } = {}
    if (isLeadership && user?.teamId) {
      filters.teamId = user.teamId
    } else if (isSupervisor && user?.id) {
      filters.supervisorId = user.id
    }
    setAgentStatuses(dataService.getAgentStatuses(filters))
    setLastRefresh(new Date())
    setSecondsUntilRefresh(refreshInterval)
    setTimeout(() => setIsRefreshing(false), 300)
  }

  const handleNotifyLeadership = () => {
    if (!selectedAgent || !notifyMessage) return
    
    // In real app, this would send a notification
    const recipientId = selectedAgent.leaderId || selectedAgent.supervisorId
    if (recipientId) {
      // Create infraction and notify
      console.log('[v0] Notifying leadership:', { agent: selectedAgent, message: notifyMessage })
    }
    
    setIsNotifyOpen(false)
    setNotifyMessage('')
    setSelectedAgent(null)
  }

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

  const getBreakDuration = (agent: AgentStatus) => {
    if (!agent.currentBreak) return null
    const start = new Date(agent.currentBreak.startTime)
    const now = new Date()
    const diffMins = Math.floor((now.getTime() - start.getTime()) / 60000)
    return diffMins
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
              {isLive ? 'Streaming real-time data' : 'Live feed paused'}
            </span>
            {isLive && (
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
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
              <option value={1}>1s (Live)</option>
              <option value={2}>2s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
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
          <h1 className="text-2xl font-bold tracking-tight">Agent Status</h1>
          <p className="text-muted-foreground">
            Real-time view of {isLeadership ? 'your team\'s' : isSupervisor ? 'your teams\'' : 'all'} agent activity
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="bg-gradient-to-br from-muted/50 to-background">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-background border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Radio className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-background border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Coffee className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.onBreak}</p>
                <p className="text-xs text-muted-foreground">Break</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-background border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.restroom}</p>
                <p className="text-xs text-muted-foreground">Rest-Room</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-background border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="size-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.coaching}</p>
                <p className="text-xs text-muted-foreground">Coaching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-background border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">{stats.away}</p>
                <p className="text-xs text-muted-foreground">Away</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/10 to-background border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Users className="size-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.offline}</p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br to-background",
          stats.withInfractions > 0 
            ? "from-rose-500/20 border-rose-500/30" 
            : "from-muted/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center",
                stats.withInfractions > 0 ? "bg-rose-500/20" : "bg-muted"
              )}>
                <AlertTriangle className={cn(
                  "size-5",
                  stats.withInfractions > 0 ? "text-rose-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  stats.withInfractions > 0 ? "text-rose-400" : ""
                )}>{stats.withInfractions}</p>
                <p className="text-xs text-muted-foreground">Infractions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AgentActivityStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="restroom">Rest-Room</SelectItem>
              <SelectItem value="coaching">Coaching</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          {(isSupervisor || isRTA || isAdmin) && (
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 px-2"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Agent Grid View */}
      {viewMode === 'grid' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map(agent => {
          const statusConfig = STATUS_CONFIG[agent.status]
          const StatusIcon = statusConfig.icon
          const breakDuration = getBreakDuration(agent)
          const isOvertime = agent.currentBreak && breakDuration && breakDuration > agent.currentBreak.scheduledDuration
          const breakProgress = agent.totalBreakTimeToday / agent.scheduledBreakTime * 100

          return (
            <Card 
              key={agent.agentId}
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-md",
                agent.isInfraction && "border-rose-500/50 bg-rose-500/5"
              )}
            >
              {/* Status indicator bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", statusConfig.bgColor)} />

              <CardHeader className="pb-3 pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-10 border-2 border-background">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background",
                        statusConfig.bgColor
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{agent.agentName}</CardTitle>
                      <CardDescription className="text-xs">{agent.teamName}</CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="size-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="size-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedAgent(agent)
                          setIsNotifyOpen(true)
                        }}
                        className="text-amber-500"
                      >
                        <Bell className="size-4 mr-2" />
                        Flag for Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn("size-4", statusConfig.color)} />
                    <span className={cn("text-sm font-medium", statusConfig.color)}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeSince(agent.lastStatusChange)}
                  </span>
                </div>

                {/* Break Timer (if on break) */}
                {agent.currentBreak && breakDuration !== null && (
                  <div className={cn(
                    "p-2 rounded-md",
                    isOvertime ? "bg-rose-500/10" : "bg-amber-500/10"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Time in {STATUS_LABELS[agent.status]}</span>
                      {isOvertime && (
                        <Badge variant="destructive" className="text-[10px]">
                          +{breakDuration - agent.currentBreak.scheduledDuration}m over
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={cn(
                        "size-4",
                        isOvertime ? "text-rose-400" : "text-amber-400"
                      )} />
                      <span className={cn(
                        "text-lg font-mono font-bold",
                        isOvertime ? "text-rose-400" : "text-amber-400"
                      )}>
                        {breakDuration}m
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {agent.currentBreak.scheduledDuration}m
                      </span>
                    </div>
                  </div>
                )}

                {/* Break Time Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Daily Break Time</span>
                    <span className={cn(
                      breakProgress > 100 ? "text-rose-400" : "text-muted-foreground"
                    )}>
                      {agent.totalBreakTimeToday}m / {agent.scheduledBreakTime}m
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(breakProgress, 100)} 
                    className={cn(
                      "h-1.5",
                      breakProgress > 100 && "[&>div]:bg-rose-500"
                    )}
                  />
                </div>

                {/* Infraction Warning */}
                {agent.isInfraction && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-rose-500/10 border border-rose-500/30">
                    <AlertTriangle className="size-4 text-rose-500 shrink-0" />
                    <span className="text-xs text-rose-400">{agent.infractionReason}</span>
                  </div>
                )}

                {/* Shift Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Shift: {agent.shiftstartTime} - {agent.shiftEndTime}</span>
                  <span>Lead: {agent.leaderName}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      )}

      {/* Agent Table View */}
      {viewMode === 'table' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Daily Break</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map(agent => {
                const statusConfig = STATUS_CONFIG[agent.status]
                const StatusIcon = statusConfig.icon
                const breakDuration = getBreakDuration(agent)
                const isOvertime = agent.currentBreak && breakDuration && breakDuration > agent.currentBreak.scheduledDuration
                const breakProgress = agent.totalBreakTimeToday / agent.scheduledBreakTime * 100

                return (
                  <TableRow 
                    key={agent.agentId}
                    className={cn(
                      agent.isInfraction && "bg-rose-500/5"
                    )}
                  >
                    {/* Agent Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="size-8">
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback className="text-xs">
                              {agent.agentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
                            statusConfig.bgColor
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{agent.agentName}</p>
                          {agent.isInfraction && (
                            <div className="flex items-center gap-1 text-rose-400">
                              <AlertTriangle className="size-3" />
                              <span className="text-[10px]">Infraction</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Team */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{agent.teamName}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("size-4", statusConfig.color)} />
                        <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      {agent.status !== 'active' && agent.status !== 'offline' && breakDuration !== null ? (
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "font-mono font-medium",
                            isOvertime ? "text-rose-400" : statusConfig.color
                          )}>
                            {breakDuration}m
                          </span>
                          {agent.currentBreak && (
                            <span className="text-xs text-muted-foreground">
                              / {agent.currentBreak.scheduledDuration}m
                            </span>
                          )}
                          {isOvertime && (
                            <Badge variant="destructive" className="text-[10px] ml-1">
                              +{breakDuration - (agent.currentBreak?.scheduledDuration || 0)}m
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {/* Daily Break Progress */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(breakProgress, 100)} 
                          className={cn(
                            "h-1.5 w-16",
                            breakProgress > 100 && "[&>div]:bg-rose-500"
                          )}
                        />
                        <span className={cn(
                          "text-xs tabular-nums",
                          breakProgress > 100 ? "text-rose-400" : "text-muted-foreground"
                        )}>
                          {agent.totalBreakTimeToday}m
                        </span>
                      </div>
                    </TableCell>

                    {/* Shift */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {agent.shiftstartTime} - {agent.shiftEndTime}
                      </span>
                    </TableCell>

                    {/* Leader */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{agent.leaderName}</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="size-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="size-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedAgent(agent)
                              setIsNotifyOpen(true)
                            }}
                            className="text-amber-500"
                          >
                            <Bell className="size-4 mr-2" />
                            Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredAgents.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Users className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No agents found</h3>
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== 'all' || teamFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No agent status data available'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notify Leadership Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Agent for Review</DialogTitle>
            <DialogDescription>
              Send a notification to {selectedAgent?.leaderName || 'team leadership'} about {selectedAgent?.agentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAgent && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarImage src={selectedAgent.avatar} />
                  <AvatarFallback>{selectedAgent.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedAgent.agentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAgent.teamName}</p>
                </div>
                <Badge variant="outline" className={STATUS_CONFIG[selectedAgent.status].color}>
                  {STATUS_CONFIG[selectedAgent.status].label}
                </Badge>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Describe the issue or reason for flagging..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNotifyLeadership}>
              <Bell className="size-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
