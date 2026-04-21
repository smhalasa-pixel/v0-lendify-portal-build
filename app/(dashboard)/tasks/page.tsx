'use client'

import * as React from 'react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import {
  ClipboardList,
  Plus,
  Check,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Calendar,
  User,
  Users,
  Building2,
  ChevronDown,
  CheckCircle2,
  Circle,
  PlayCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth, useHasAccess } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { Task, User as UserType } from '@/lib/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  high: { label: 'High', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  urgent: { label: 'Urgent', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
}

const statusConfig = {
  pending: { label: 'Pending', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-blue-400' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400' },
  overdue: { label: 'Overdue', icon: AlertTriangle, color: 'text-rose-400' },
}

const categoryConfig = {
  compliance: { label: 'Compliance', color: 'bg-purple-500/20 text-purple-400' },
  training: { label: 'Training', color: 'bg-cyan-500/20 text-cyan-400' },
  sales: { label: 'Sales', color: 'bg-emerald-500/20 text-emerald-400' },
  administrative: { label: 'Administrative', color: 'bg-amber-500/20 text-amber-400' },
  other: { label: 'Other', color: 'bg-slate-500/20 text-slate-400' },
}

function formatDueDate(dueDate: string, dueTime?: string): string {
  const date = new Date(dueDate)
  if (isToday(date)) {
    return dueTime ? `Today at ${dueTime}` : 'Today'
  }
  if (isTomorrow(date)) {
    return dueTime ? `Tomorrow at ${dueTime}` : 'Tomorrow'
  }
  return dueTime 
    ? `${format(date, 'MMM d, yyyy')} at ${dueTime}`
    : format(date, 'MMM d, yyyy')
}

function getTaskStatus(task: Task): Task['status'] {
  if (task.status === 'completed') return 'completed'
  const dueDate = new Date(task.dueDate)
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':')
    dueDate.setHours(parseInt(hours), parseInt(minutes))
  }
  if (isPast(dueDate) && task.status !== 'completed') {
    return 'overdue'
  }
  return task.status
}

export default function TasksPage() {
  const { user } = useAuth()
  // All roles can create tasks, but assignment options vary by role
  const canCreateTasks = useHasAccess(['agent', 'leadership', 'supervisor', 'admin'])
  
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'completed'>('all')
  const [search, setSearch] = React.useState('')
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  
  // New task form state - will be updated when user loads
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: 'other' as Task['category'],
    assignmentType: 'individual' as Task['assignmentType'],
    assignedToId: '',
    assignedToTeamId: '',
    dueDate: undefined as Date | undefined,
    dueTime: '',
  })
  
  // Set role-appropriate defaults when user loads
  React.useEffect(() => {
    if (user) {
      setNewTask(prev => ({
        ...prev,
        assignmentType: user.role === 'agent' || user.role === 'leadership' ? 'individual' : 'department',
        assignedToId: user.role === 'agent' ? user.id : '',
      }))
    }
  }, [user])

  // Load tasks
  React.useEffect(() => {
    if (user) {
      const userTasks = dataService.getTasks(user.id, user.teamId)
      setTasks(userTasks)
    }
  }, [user])

  // Get all users and teams for assignment
  const allUsers = React.useMemo(() => dataService.getUsers(), [])
  const teams = React.useMemo(() => {
    const teamMap = new Map<string, string>()
    allUsers.forEach(u => {
      if (u.teamId && u.teamName) {
        teamMap.set(u.teamId, u.teamName)
      }
    })
    return Array.from(teamMap.entries()).map(([id, name]) => ({ id, name }))
  }, [allUsers])

  // Role-based assignment options
  // Agent: can only assign to themselves
  // Leadership (Team Lead): can assign to agents on their team
  // Supervisor: can assign to any agent or team
  // Admin: full access
  const assignableUsers = React.useMemo(() => {
    if (!user) return []
    
    if (user.role === 'agent') {
      // Agents can only assign tasks to themselves
      return allUsers.filter(u => u.id === user.id)
    }
    
    if (user.role === 'leadership') {
      // Team leads can assign to agents on their team
      return allUsers.filter(u => u.role === 'agent' && u.teamId === user.teamId)
    }
    
    if (user.role === 'supervisor') {
      // Supervisors can assign to agents on any of their teams
      const teamIds = new Set(user.teamIds || [])
      return allUsers.filter(u => u.role === 'agent' && u.teamId && teamIds.has(u.teamId))
    }
    
    if (user.role === 'admin' || user.role === 'executive') {
      // Admins and execs can assign to any agent
      return allUsers.filter(u => u.role === 'agent')
    }
    
    return []
  }, [user, allUsers])

  const assignableTeams = React.useMemo(() => {
    if (!user) return []

    // Supervisors: only their own teams
    if (user.role === 'supervisor') {
      const allowed = new Set(user.teamIds || [])
      return teams.filter(t => allowed.has(t.id))
    }

    // Admins and executives: all teams
    if (user.role === 'admin' || user.role === 'executive') {
      return teams
    }

    return []
  }, [user, teams])

  // Determine available assignment types based on role
  const availableAssignmentTypes = React.useMemo(() => {
    if (!user) return []
    
    if (user.role === 'agent') {
      // Agents can only assign to themselves (individual only)
      return ['individual']
    }
    
    if (user.role === 'leadership') {
      // Team leads can assign to individuals on their team
      return ['individual']
    }
    
    if (user.role === 'supervisor' || user.role === 'admin') {
      // Supervisors and admins can assign to individuals, teams, or department
      return ['individual', 'team', 'department']
    }
    
    return []
  }, [user])

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const status = getTaskStatus(task)
      
      // Filter by status
      if (filter === 'pending' && (status === 'completed')) return false
      if (filter === 'completed' && status !== 'completed') return false
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
  }, [tasks, filter, search])

  // Check if user has completed a task
  const hasUserCompleted = (task: Task): boolean => {
    if (!user) return false
    if (task.assignmentType === 'individual') {
      return task.status === 'completed'
    }
    return task.completedBy?.includes(user.id) || false
  }

  // Handle task completion
  const handleMarkComplete = (taskId: string) => {
    if (!user) return
    dataService.markTaskComplete(taskId, user.id)
    setTasks(dataService.getTasks(user.id, user.teamId))
  }

  // Handle create task
  const handleCreateTask = () => {
    if (!user || !newTask.title || !newTask.dueDate) return

    // For agents, automatically assign to themselves
    const effectiveAssignedToId = user.role === 'agent' ? user.id : newTask.assignedToId
    
    const assignedUser = newTask.assignmentType === 'individual' 
      ? allUsers.find(u => u.id === effectiveAssignedToId)
      : undefined
    const assignedTeam = newTask.assignmentType === 'team'
      ? teams.find(t => t.id === newTask.assignedToTeamId)
      : undefined

    dataService.createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: 'pending',
      dueDate: format(newTask.dueDate, 'yyyy-MM-dd'),
      dueTime: newTask.dueTime || undefined,
      createdById: user.id,
      createdByName: user.name,
      assignmentType: newTask.assignmentType,
      assignedToId: assignedUser?.id,
      assignedToName: assignedUser?.name,
      assignedToTeamId: assignedTeam?.id,
      assignedToTeamName: assignedTeam?.name,
    })

    setTasks(dataService.getTasks(user.id, user.teamId))
    setCreateDialogOpen(false)
    // Reset form with role-appropriate defaults
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      assignmentType: user.role === 'agent' || user.role === 'leadership' ? 'individual' : 'department',
      assignedToId: user.role === 'agent' ? user.id : '',
      assignedToTeamId: '',
      dueDate: undefined,
      dueTime: '',
    })
  }

  // Count tasks by status
  const taskCounts = React.useMemo(() => {
    const counts = { all: 0, pending: 0, completed: 0 }
    tasks.forEach(task => {
      counts.all++
      const status = getTaskStatus(task)
      if (status === 'completed') {
        counts.completed++
      } else {
        counts.pending++
      }
    })
    return counts
  }, [tasks])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">To Do List</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and assignments
          </p>
        </div>
        {canCreateTasks && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Assign a task to an individual, team, or the entire department.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Task description..."
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v as Task['priority'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTask.category}
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, category: v as Task['category'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select
                    value={newTask.assignmentType}
                    onValueChange={(v) => setNewTask(prev => ({ 
                      ...prev, 
                      assignmentType: v as Task['assignmentType'],
                      assignedToId: user?.role === 'agent' ? user.id : '',
                      assignedToTeamId: '',
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssignmentTypes.includes('department') && (
                        <SelectItem value="department">
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4" />
                            Entire Department
                          </div>
                        </SelectItem>
                      )}
                      {availableAssignmentTypes.includes('team') && (
                        <SelectItem value="team">
                          <div className="flex items-center gap-2">
                            <Users className="size-4" />
                            Specific Team
                          </div>
                        </SelectItem>
                      )}
                      {availableAssignmentTypes.includes('individual') && (
                        <SelectItem value="individual">
                          <div className="flex items-center gap-2">
                            <User className="size-4" />
                            {user?.role === 'agent' ? 'Myself' : 'Individual Agent'}
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {newTask.assignmentType === 'team' && assignableTeams.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Team</label>
                    <Select
                      value={newTask.assignedToTeamId}
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, assignedToTeamId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team..." />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableTeams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {newTask.assignmentType === 'individual' && user?.role !== 'agent' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Agent</label>
                    <Select
                      value={newTask.assignedToId}
                      onValueChange={(v) => setNewTask(prev => ({ ...prev, assignedToId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableUsers.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} {agent.teamName ? `(${agent.teamName})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 size-4" />
                          {newTask.dueDate ? format(newTask.dueDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask(prev => ({ ...prev, dueDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Time (Optional)</label>
                    <Input
                      type="time"
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.dueDate}>
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({taskCounts.all})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({taskCounts.pending})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({taskCounts.completed})
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="glass-card border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const status = getTaskStatus(task)
            const StatusIcon = statusConfig[status].icon
            const userCompleted = hasUserCompleted(task)
            
            return (
              <Card 
                key={task.id} 
                className={cn(
                  "glass-card border-border/50 transition-all hover:border-border",
                  userCompleted && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Complete Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => !userCompleted && handleMarkComplete(task.id)}
                            disabled={userCompleted}
                            className={cn(
                              "mt-0.5 size-6 rounded-full border-2 flex items-center justify-center transition-all",
                              userCompleted
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                            )}
                          >
                            {userCompleted && <Check className="size-3.5" />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {userCompleted ? 'Completed' : 'Mark as complete'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={cn(
                            "font-medium text-foreground",
                            userCompleted && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={priorityConfig[task.priority].color}>
                            {priorityConfig[task.priority].label}
                          </Badge>
                          <Badge className={categoryConfig[task.category].color}>
                            {categoryConfig[task.category].label}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className={cn("flex items-center gap-1.5", statusConfig[status].color)}>
                          <StatusIcon className="size-3.5" />
                          {status === 'overdue' ? 'Overdue' : formatDueDate(task.dueDate, task.dueTime)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {task.assignmentType === 'department' && (
                            <>
                              <Building2 className="size-3.5" />
                              All Department
                            </>
                          )}
                          {task.assignmentType === 'team' && (
                            <>
                              <Users className="size-3.5" />
                              {task.assignedToTeamName}
                            </>
                          )}
                          {task.assignmentType === 'individual' && (
                            <>
                              <User className="size-3.5" />
                              {task.assignedToName}
                            </>
                          )}
                        </div>
                        <div className="text-muted-foreground/60">
                          Created by {task.createdByName}
                        </div>
                        {task.assignmentType !== 'individual' && task.completedBy && task.completedBy.length > 0 && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="size-3.5" />
                            {task.completedBy.length} completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
