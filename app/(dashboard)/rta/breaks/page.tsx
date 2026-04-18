'use client'

import * as React from 'react'
import { 
  Clock, 
  Search,
  Download,
  Calendar,
  Coffee,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { BreakSession, Team, AgentActivityStatus } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/types'

export default function BreakHistoryPage() {
  const { user } = useAuth()
  const [breakSessions, setBreakSessions] = React.useState<BreakSession[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [search, setSearch] = React.useState('')
  const [teamFilter, setTeamFilter] = React.useState<string>('all')
  const [statusTypeFilter, setStatusTypeFilter] = React.useState<string>('all')
  const [overtimeFilter, setOvertimeFilter] = React.useState<string>('all')

  const isRTA = user?.role === 'rta'
  const isAdmin = user?.role === 'admin'
  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'

  // Load data
  React.useEffect(() => {
    const loadData = () => {
      let filters: { teamId?: string } = {}
      
      if (isLeadership && user?.teamId) {
        filters.teamId = user.teamId
      }
      
      setBreakSessions(dataService.getBreakSessions(filters))
      setTeams(dataService.getTeams())
    }

    loadData()
  }, [user, isLeadership])

  // Filter sessions
  const filteredSessions = React.useMemo(() => {
    let results = [...breakSessions]

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(s => 
        s.agentName.toLowerCase().includes(searchLower) ||
        s.teamName.toLowerCase().includes(searchLower)
      )
    }

    if (teamFilter !== 'all') {
      results = results.filter(s => s.teamId === teamFilter)
    }

    if (statusTypeFilter !== 'all') {
      results = results.filter(s => s.statusType === statusTypeFilter)
    }

    if (overtimeFilter === 'overtime') {
      results = results.filter(s => s.isOvertime)
    } else if (overtimeFilter === 'on_time') {
      results = results.filter(s => !s.isOvertime && s.endTime)
    } else if (overtimeFilter === 'active') {
      results = results.filter(s => !s.endTime)
    }

    return results
  }, [breakSessions, search, teamFilter, statusTypeFilter, overtimeFilter])

  // Stats
  const stats = React.useMemo(() => {
    const completed = breakSessions.filter(s => s.endTime)
    const totalBreakTime = completed.reduce((sum, s) => sum + (s.actualDuration || 0), 0)
    const avgBreakTime = completed.length > 0 ? Math.round(totalBreakTime / completed.length) : 0
    const overtimeCount = completed.filter(s => s.isOvertime).length
    const overtimeRate = completed.length > 0 ? Math.round((overtimeCount / completed.length) * 100) : 0
    const activeBreaks = breakSessions.filter(s => !s.endTime).length

    return { 
      total: breakSessions.length, 
      completed: completed.length,
      totalBreakTime,
      avgBreakTime, 
      overtimeCount, 
      overtimeRate,
      activeBreaks
    }
  }, [breakSessions])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const handleExport = () => {
    const headers = ['Agent', 'Team', 'Status Type', 'Start Time', 'End Time', 'Scheduled', 'Actual', 'Overtime', 'Notes']
    const rows = filteredSessions.map(s => [
      s.agentName,
      s.teamName,
      STATUS_LABELS[s.statusType],
      new Date(s.startTime).toLocaleString(),
      s.endTime ? new Date(s.endTime).toLocaleString() : 'In Progress',
      `${s.scheduledDuration}m`,
      s.actualDuration ? `${s.actualDuration}m` : '-',
      s.isOvertime ? `+${s.overtimeMinutes}m` : 'No',
      s.notes || ''
    ])
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `break-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Break History</h1>
          <p className="text-muted-foreground">
            View and analyze agent break patterns
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Coffee className="size-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Breaks</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="size-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-400">{stats.activeBreaks}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.avgBreakTime}m</p>
            <p className="text-xs text-muted-foreground">Avg Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="size-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalBreakTime}m</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.overtimeCount > 0 && "border-rose-500/20")}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={cn(
              "size-5 mx-auto mb-2",
              stats.overtimeCount > 0 ? "text-rose-500" : "text-muted-foreground"
            )} />
            <p className={cn("text-2xl font-bold", stats.overtimeCount > 0 && "text-rose-400")}>
              {stats.overtimeCount}
            </p>
            <p className="text-xs text-muted-foreground">Overtime</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.overtimeRate > 20 && "border-rose-500/20")}>
          <CardContent className="p-4 text-center">
            <TrendingDown className={cn(
              "size-5 mx-auto mb-2",
              stats.overtimeRate > 20 ? "text-rose-500" : "text-emerald-500"
            )} />
            <p className={cn(
              "text-2xl font-bold",
              stats.overtimeRate > 20 ? "text-rose-400" : "text-emerald-400"
            )}>
              {stats.overtimeRate}%
            </p>
            <p className="text-xs text-muted-foreground">Overtime Rate</p>
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
        <div className="flex flex-wrap gap-2">
          <Select value={statusTypeFilter} onValueChange={setStatusTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="break">Break</SelectItem>
              <SelectItem value="restroom">Rest-Room</SelectItem>
              <SelectItem value="coaching">Coaching</SelectItem>
            </SelectContent>
          </Select>

          <Select value={overtimeFilter} onValueChange={setOvertimeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_time">On Time</SelectItem>
              <SelectItem value="overtime">Overtime</SelectItem>
            </SelectContent>
          </Select>

          {(isSupervisor || isRTA || isAdmin) && (
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Break Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No break sessions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {session.agentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{session.agentName}</p>
                        <p className="text-xs text-muted-foreground">{session.teamName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {STATUS_LABELS[session.statusType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(session.startTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {formatTime(session.startTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.endTime ? (
                      <span className="text-sm font-mono">
                        {formatTime(session.endTime)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
                        In Progress
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {session.scheduledDuration}m
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.actualDuration ? (
                      <span className={cn(
                        "text-sm font-medium",
                        session.isOvertime ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {session.actualDuration}m
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!session.endTime ? (
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                        <Clock className="size-3 mr-1" />
                        Active
                      </Badge>
                    ) : session.isOvertime ? (
                      <Badge variant="outline" className="text-rose-400 border-rose-500/30">
                        <AlertTriangle className="size-3 mr-1" />
                        +{session.overtimeMinutes}m
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="size-3 mr-1" />
                        On Time
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
