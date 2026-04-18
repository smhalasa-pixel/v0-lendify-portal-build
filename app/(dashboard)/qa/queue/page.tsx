'use client'

import * as React from 'react'
import { 
  ClipboardCheck, 
  AlertTriangle,
  Clock,
  Calendar,
  Search,
  Filter,
  UserPlus,
  Check,
  RefreshCw,
  ChevronLeft,
  ListTodo,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { QAAnalystWorkload, QAAuditQueue } from '@/lib/types'
import Link from 'next/link'

export default function QueuePage() {
  const { user } = useAuth()
  
  const isQASenior = user?.role === 'qa_senior' || user?.role === 'admin'
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_analyst' || user?.role === 'qa_trainer' || user?.role === 'admin'
  
  const [search, setSearch] = React.useState('')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [assignmentFilter, setAssignmentFilter] = React.useState<string>('all')
  
  // State for data
  const [auditQueue, setAuditQueue] = React.useState<QAAuditQueue[]>([])
  const [analystWorkloads, setAnalystWorkloads] = React.useState<QAAnalystWorkload[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)
  const [selectedAudit, setSelectedAudit] = React.useState<QAAuditQueue | null>(null)
  const [selectedAnalystId, setSelectedAnalystId] = React.useState<string>('')
  const [isAssigning, setIsAssigning] = React.useState(false)

  // Load data
  const loadData = React.useCallback(() => {
    setAuditQueue(dataService.getAuditQueue())
    setAnalystWorkloads(dataService.getQAAnalystWorkloads())
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Filter audits
  const filteredAudits = React.useMemo(() => {
    let results = auditQueue
    
    if (priorityFilter !== 'all') {
      results = results.filter(a => a.priority === priorityFilter)
    }
    if (statusFilter !== 'all') {
      results = results.filter(a => a.status === statusFilter)
    }
    if (assignmentFilter === 'unassigned') {
      results = results.filter(a => !a.assignedToId)
    } else if (assignmentFilter === 'assigned') {
      results = results.filter(a => a.assignedToId)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(a => 
        a.agentName.toLowerCase().includes(searchLower) ||
        a.agentTeamName.toLowerCase().includes(searchLower) ||
        a.reason.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by priority and due date
    return results.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [auditQueue, priorityFilter, statusFilter, assignmentFilter, search])

  // Handle assign
  const handleOpenAssignModal = (audit: QAAuditQueue) => {
    setSelectedAudit(audit)
    setSelectedAnalystId('')
    setIsAssignModalOpen(true)
  }

  const handleAssignAudit = () => {
    if (!selectedAudit || !selectedAnalystId) return

    setIsAssigning(true)

    setTimeout(() => {
      dataService.assignAudit(selectedAudit.id, selectedAnalystId)
      loadData()
      setIsAssigning(false)
      setIsAssignModalOpen(false)
      setSelectedAudit(null)
      setSelectedAnalystId('')
    }, 500)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">High</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-info/10 text-info border-info/30">Pending</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isQA) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              The QA Queue is only accessible to Quality Analysts.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/qa">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ListTodo className="size-6" />
              Audit Queue
            </h1>
            <p className="text-muted-foreground">
              Manage and assign pending quality audits
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total in Queue</p>
                <p className="text-3xl font-bold">{auditQueue.length}</p>
              </div>
              <ListTodo className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent/High</p>
                <p className="text-3xl font-bold text-warning">
                  {auditQueue.filter(a => a.priority !== 'normal').length}
                </p>
              </div>
              <AlertTriangle className="size-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-3xl font-bold text-info">
                  {auditQueue.filter(a => !a.assignedToId).length}
                </p>
              </div>
              <UserPlus className="size-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-destructive">
                  {auditQueue.filter(a => new Date(a.dueDate) < new Date() && a.status !== 'completed').length}
                </p>
              </div>
              <Clock className="size-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by agent, team, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Queue ({filteredAudits.length})</CardTitle>
          <CardDescription>Sorted by priority and due date</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Call Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                {isQASenior && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((audit) => {
                const isOverdue = new Date(audit.dueDate) < new Date() && audit.status !== 'completed'
                return (
                  <TableRow key={audit.id} className={cn(isOverdue && "bg-destructive/5")}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${audit.agentName}`} />
                          <AvatarFallback>{audit.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{audit.agentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{audit.agentTeamName}</TableCell>
                    <TableCell>{getPriorityBadge(audit.priority)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{audit.reason}</TableCell>
                    <TableCell className="capitalize">{audit.callType.replace('_', ' ')}</TableCell>
                    <TableCell>
                      {Math.floor(audit.callDuration / 60)}m {audit.callDuration % 60}s
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isOverdue && <Clock className="size-3 text-destructive" />}
                        <span className={cn(isOverdue && "text-destructive")}>
                          {new Date(audit.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {audit.assignedToName || (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(audit.status)}</TableCell>
                    {isQASenior && (
                      <TableCell>
                        {!audit.assignedToId && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenAssignModal(audit)}
                          >
                            <UserPlus className="size-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {filteredAudits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isQASenior ? 10 : 9} className="text-center py-8 text-muted-foreground">
                    No audits found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Audit</DialogTitle>
            <DialogDescription>
              Select a QA analyst to assign this audit to
            </DialogDescription>
          </DialogHeader>
          
          {selectedAudit && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedAudit.agentName}</span>
                  {getPriorityBadge(selectedAudit.priority)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedAudit.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedAudit.callType} call - {Math.floor(selectedAudit.callDuration / 60)}m {selectedAudit.callDuration % 60}s
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to</label>
                <Select value={selectedAnalystId} onValueChange={setSelectedAnalystId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an analyst" />
                  </SelectTrigger>
                  <SelectContent>
                    {analystWorkloads.map((analyst) => (
                      <SelectItem key={analyst.analystId} value={analyst.analystId}>
                        <div className="flex items-center gap-2">
                          <span>{analyst.analystName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({analyst.pendingAudits} pending)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAudit}
              disabled={!selectedAnalystId || isAssigning}
            >
              {isAssigning ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="size-4 mr-2" />
                  Assign Audit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
