'use client'

import * as React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Ticket,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  Send,
  User,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { Ticket as TicketType, TicketPriority, TicketStatus, TicketCategory, User as UserType } from '@/lib/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  high: { label: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  urgent: { label: 'Urgent', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
}

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; color: string }> = {
  open: { label: 'Open', icon: Circle, color: 'text-blue-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-400' },
  escalated: { label: 'Escalated', icon: ArrowUpRight, color: 'text-purple-400' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'text-emerald-400' },
  closed: { label: 'Closed', icon: CheckCircle2, color: 'text-muted-foreground' },
}

const categoryConfig: Record<TicketCategory, { label: string; color: string }> = {
  technical: { label: 'Technical', color: 'bg-cyan-500/20 text-cyan-400' },
  commission: { label: 'Commission', color: 'bg-emerald-500/20 text-emerald-400' },
  client: { label: 'Client', color: 'bg-amber-500/20 text-amber-400' },
  hr: { label: 'HR', color: 'bg-purple-500/20 text-purple-400' },
  other: { label: 'Other', color: 'bg-slate-500/20 text-slate-400' },
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = React.useState<TicketType[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [selectedTicket, setSelectedTicket] = React.useState<TicketType | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [newComment, setNewComment] = React.useState('')
  const [escalationTargets, setEscalationTargets] = React.useState<UserType[]>([])

  // New ticket form state
  const [newTicket, setNewTicket] = React.useState({
    title: '',
    description: '',
    category: 'other' as TicketCategory,
    priority: 'medium' as TicketPriority,
  })

  React.useEffect(() => {
    if (user) {
      setTickets(dataService.getTickets(user.id))
      setEscalationTargets(dataService.getEscalationTargets(user.id))
    }
  }, [user])

  const filteredTickets = React.useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tickets, searchQuery, statusFilter, priorityFilter])

  const ticketStats = React.useMemo(() => {
    return {
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      escalated: tickets.filter(t => t.status === 'escalated').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    }
  }, [tickets])

  const handleCreateTicket = () => {
    if (!user || !newTicket.title.trim()) return

    const ticket = dataService.createTicket({
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
      createdById: user.id,
      createdByName: user.name,
      createdByRole: user.role,
      createdByTeamId: user.teamId,
    })

    setTickets(prev => [ticket, ...prev])
    setNewTicket({ title: '', description: '', category: 'other', priority: 'medium' })
    setIsCreateOpen(false)
  }

  const handleAddComment = () => {
    if (!user || !selectedTicket || !newComment.trim()) return

    const comment = dataService.addTicketComment(selectedTicket.id, user.id, newComment)
    if (comment) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment],
      } : null)
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, comments: [...t.comments, comment] }
          : t
      ))
      setNewComment('')
    }
  }

  const handleEscalate = (ticketId: string, escalateToId: string) => {
    dataService.escalateTicket(ticketId, escalateToId)
    const updatedTicket = dataService.getTicketById(ticketId)
    if (updatedTicket) {
      setSelectedTicket(updatedTicket)
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t))
    }
  }

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    dataService.updateTicketStatus(ticketId, status)
    const updatedTicket = dataService.getTicketById(ticketId)
    if (updatedTicket) {
      setSelectedTicket(updatedTicket)
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t))
    }
  }

  const openTicketDetail = (ticket: TicketType) => {
    setSelectedTicket(ticket)
    setIsDetailOpen(true)
  }

  const canEscalate = user && (user.role === 'leadership' || user.role === 'supervisor' || user.role === 'admin')
  const canChangeStatus = user && (user.role === 'leadership' || user.role === 'supervisor' || user.role === 'admin')

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">
            Create and manage support tickets
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Submit a new support ticket. Your team lead or supervisor will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Provide more details about your issue..."
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value: TicketCategory) => setNewTicket(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: TicketPriority) => setNewTicket(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={!newTicket.title.trim()}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Circle className="size-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ticketStats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="size-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ticketStats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ArrowUpRight className="size-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ticketStats.escalated}</p>
                <p className="text-xs text-muted-foreground">Escalated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ticketStats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="size-4" />
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="size-12 mx-auto mb-4 opacity-20" />
              <p>No tickets found</p>
              <p className="text-sm">Create a new ticket to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const StatusIcon = statusConfig[ticket.status].icon
                return (
                  <div
                    key={ticket.id}
                    onClick={() => openTicketDetail(ticket)}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={cn("size-4", statusConfig[ticket.status].color)} />
                          <span className="font-medium truncate">{ticket.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cn("text-[10px]", categoryConfig[ticket.category].color)}>
                            {categoryConfig[ticket.category].label}
                          </Badge>
                          <Badge variant="outline" className={cn("text-[10px]", priorityConfig[ticket.priority].color)}>
                            {priorityConfig[ticket.priority].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {ticket.createdByName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </span>
                          {ticket.comments.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MessageSquare className="size-3" />
                              {ticket.comments.length}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-lg">{selectedTicket.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      Created by {selectedTicket.createdByName} ({selectedTicket.createdByRole})
                      {' '}{formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Status and Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn(statusConfig[selectedTicket.status].color)}>
                    {statusConfig[selectedTicket.status].label}
                  </Badge>
                  <Badge variant="outline" className={cn(priorityConfig[selectedTicket.priority].color)}>
                    {priorityConfig[selectedTicket.priority].label}
                  </Badge>
                  <Badge variant="outline" className={cn(categoryConfig[selectedTicket.category].color)}>
                    {categoryConfig[selectedTicket.category].label}
                  </Badge>

                  <div className="flex-1" />

                  {canChangeStatus && selectedTicket.status !== 'closed' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          Status <ChevronDown className="size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}>
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}>
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, 'closed')}>
                          Close Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {canEscalate && selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && escalationTargets.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ArrowUpRight className="size-3" />
                          Escalate
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {escalationTargets.map(target => (
                          <DropdownMenuItem 
                            key={target.id}
                            onClick={() => handleEscalate(selectedTicket.id, target.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="size-5">
                                <AvatarImage src={target.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {target.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{target.name}</span>
                              <Badge variant="secondary" className="text-[9px] ml-auto">
                                {target.role}
                              </Badge>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Escalation Info */}
                {selectedTicket.escalatedToName && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowUpRight className="size-4 text-purple-400" />
                      <span className="text-purple-400 font-medium">Escalated to:</span>
                      <span>{selectedTicket.escalatedToName} ({selectedTicket.escalatedToRole})</span>
                    </div>
                  </div>
                )}

                {/* Assigned Info */}
                {selectedTicket.assignedToName && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="size-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">Assigned to:</span>
                      <span>{selectedTicket.assignedToName} ({selectedTicket.assignedToRole})</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    Comments ({selectedTicket.comments.length})
                  </h4>
                  
                  {selectedTicket.comments.length > 0 && (
                    <div className="space-y-3">
                      {selectedTicket.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-[10px]">
                                {comment.authorName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.authorName}</span>
                            <Badge variant="secondary" className="text-[9px]">{comment.authorRole}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="icon" 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
