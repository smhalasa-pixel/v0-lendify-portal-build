'use client'

import * as React from 'react'
import { 
  AlertTriangle, 
  Search,
  Filter,
  Bell,
  CheckCircle,
  Clock,
  ChevronDown,
  MessageSquare,
  Download,
  Eye,
  MoreHorizontal,
  XCircle,
  ArrowUpCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { RTAInfraction, Team } from '@/lib/types'

const SEVERITY_CONFIG = {
  low: { label: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  medium: { label: 'Medium', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  critical: { label: 'Critical', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-400', icon: Clock },
  acknowledged: { label: 'Acknowledged', color: 'text-blue-400', icon: Eye },
  resolved: { label: 'Resolved', color: 'text-emerald-400', icon: CheckCircle },
  escalated: { label: 'Escalated', color: 'text-rose-400', icon: ArrowUpCircle },
}

const TYPE_LABELS = {
  extended_break: 'Extended Break',
  unauthorized_break: 'Unauthorized Break',
  excessive_breaks: 'Excessive Breaks',
  late_return: 'Late Return',
  early_logout: 'Early Logout',
  missed_shift: 'Missed Shift',
}

export default function InfractionsPage() {
  const { user } = useAuth()
  const [infractions, setInfractions] = React.useState<RTAInfraction[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [severityFilter, setSeverityFilter] = React.useState<string>('all')
  const [teamFilter, setTeamFilter] = React.useState<string>('all')
  const [selectedInfraction, setSelectedInfraction] = React.useState<RTAInfraction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [isResolveOpen, setIsResolveOpen] = React.useState(false)
  const [isNotifyOpen, setIsNotifyOpen] = React.useState(false)
  const [resolution, setResolution] = React.useState('')
  const [notifyMessage, setNotifyMessage] = React.useState('')

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
      
      setInfractions(dataService.getInfractions(filters))
      setTeams(dataService.getTeams())
    }

    loadData()
  }, [user, isLeadership])

  // Filter infractions
  const filteredInfractions = React.useMemo(() => {
    let results = [...infractions]

    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(i => 
        i.agentName.toLowerCase().includes(searchLower) ||
        i.teamName.toLowerCase().includes(searchLower) ||
        i.description.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      results = results.filter(i => i.status === statusFilter)
    }

    if (severityFilter !== 'all') {
      results = results.filter(i => i.severity === severityFilter)
    }

    if (teamFilter !== 'all') {
      results = results.filter(i => i.teamId === teamFilter)
    }

    return results
  }, [infractions, search, statusFilter, severityFilter, teamFilter])

  // Stats
  const stats = {
    total: infractions.length,
    pending: infractions.filter(i => i.status === 'pending').length,
    acknowledged: infractions.filter(i => i.status === 'acknowledged').length,
    resolved: infractions.filter(i => i.status === 'resolved').length,
    critical: infractions.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAcknowledge = (infraction: RTAInfraction) => {
    if (user?.id) {
      dataService.acknowledgeInfraction(infraction.id, user.id)
      setInfractions(dataService.getInfractions())
    }
  }

  const handleResolve = () => {
    if (!selectedInfraction || !user?.id || !resolution) return
    
    dataService.resolveInfraction(selectedInfraction.id, user.id, resolution)
    setInfractions(dataService.getInfractions())
    setIsResolveOpen(false)
    setResolution('')
    setSelectedInfraction(null)
  }

  const handleNotify = () => {
    if (!selectedInfraction || !notifyMessage) return
    
    const recipientId = selectedInfraction.leaderId || selectedInfraction.supervisorId
    if (recipientId) {
      dataService.notifyLeadership(selectedInfraction.id, recipientId, notifyMessage)
      setInfractions(dataService.getInfractions())
    }
    
    setIsNotifyOpen(false)
    setNotifyMessage('')
    setSelectedInfraction(null)
  }

  const handleExport = () => {
    const headers = ['Agent', 'Team', 'Type', 'Severity', 'Status', 'Description', 'Occurred At', 'Resolved At', 'Resolution']
    const rows = filteredInfractions.map(i => [
      i.agentName,
      i.teamName,
      TYPE_LABELS[i.type],
      i.severity,
      i.status,
      i.description,
      formatDate(i.occurredAt),
      i.resolvedAt ? formatDate(i.resolvedAt) : '',
      i.resolution || ''
    ])
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infractions-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Infractions</h1>
          <p className="text-muted-foreground">
            Track and manage agent adherence violations
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.acknowledged}</p>
            <p className="text-xs text-muted-foreground">Acknowledged</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className={cn(stats.critical > 0 && "border-rose-500/30 bg-rose-500/5")}>
          <CardContent className="p-4 text-center">
            <p className={cn("text-2xl font-bold", stats.critical > 0 && "text-rose-400")}>
              {stats.critical}
            </p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search infractions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
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
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Occurred</TableHead>
              <TableHead>Notified</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInfractions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No infractions found
                </TableCell>
              </TableRow>
            ) : (
              filteredInfractions.map(infraction => {
                const severityConfig = SEVERITY_CONFIG[infraction.severity]
                const statusConfig = STATUS_CONFIG[infraction.status]
                const StatusIcon = statusConfig.icon

                return (
                  <TableRow key={infraction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {infraction.agentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{infraction.agentName}</p>
                          <p className="text-xs text-muted-foreground">{infraction.teamName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[infraction.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", severityConfig.color, severityConfig.borderColor)}
                      >
                        {severityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={cn("size-4", statusConfig.color)} />
                        <span className={cn("text-sm", statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[200px] truncate" title={infraction.description}>
                        {infraction.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(infraction.occurredAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {infraction.notifiedLeadership ? (
                        <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="size-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedInfraction(infraction)
                            setIsDetailOpen(true)
                          }}>
                            <Eye className="size-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {infraction.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleAcknowledge(infraction)}>
                              <CheckCircle className="size-4 mr-2" />
                              Acknowledge
                            </DropdownMenuItem>
                          )}
                          
                          {infraction.status !== 'resolved' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedInfraction(infraction)
                              setIsResolveOpen(true)
                            }}>
                              <CheckCircle className="size-4 mr-2" />
                              Resolve
                            </DropdownMenuItem>
                          )}
                          
                          {!infraction.notifiedLeadership && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedInfraction(infraction)
                                setIsNotifyOpen(true)
                              }}>
                                <Bell className="size-4 mr-2" />
                                Notify Leadership
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Infraction Details</DialogTitle>
          </DialogHeader>
          {selectedInfraction && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar>
                  <AvatarFallback>
                    {selectedInfraction.agentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedInfraction.agentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedInfraction.teamName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <Badge variant="outline">{TYPE_LABELS[selectedInfraction.type]}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <Badge 
                    variant="outline"
                    className={cn(
                      SEVERITY_CONFIG[selectedInfraction.severity].color,
                      SEVERITY_CONFIG[selectedInfraction.severity].borderColor
                    )}
                  >
                    {SEVERITY_CONFIG[selectedInfraction.severity].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge 
                    variant="outline"
                    className={STATUS_CONFIG[selectedInfraction.status].color}
                  >
                    {STATUS_CONFIG[selectedInfraction.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Occurred</p>
                  <p className="text-sm">{formatDate(selectedInfraction.occurredAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedInfraction.description}</p>
              </div>

              {selectedInfraction.leaderName && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Team Lead</p>
                  <p className="text-sm">{selectedInfraction.leaderName}</p>
                </div>
              )}

              {selectedInfraction.resolution && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                  <p className="text-sm">{selectedInfraction.resolution}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved: {selectedInfraction.resolvedAt && formatDate(selectedInfraction.resolvedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Infraction</DialogTitle>
            <DialogDescription>
              Provide a resolution for this infraction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe the resolution or action taken..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution}>
              <CheckCircle className="size-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Leadership</DialogTitle>
            <DialogDescription>
              Send a notification to {selectedInfraction?.leaderName || 'team leadership'} about this infraction
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter message for leadership..."
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNotify} disabled={!notifyMessage}>
              <Bell className="size-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
