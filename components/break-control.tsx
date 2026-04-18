'use client'

import * as React from 'react'
import { Coffee, Clock, Play, Pause, User, ChevronDown, AlertTriangle, DoorOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { BreakSession, AgentActivityStatus } from '@/lib/types'
import { STATUS_LABELS, STATUS_DURATIONS } from '@/lib/types'

// Status types that can be selected (excluding active and offline which are automatic)
const SELECTABLE_STATUSES: AgentActivityStatus[] = ['break', 'restroom', 'coaching']

const STATUS_ICONS: Record<AgentActivityStatus, React.ElementType> = {
  active: Play,
  break: Coffee,
  restroom: DoorOpen,
  coaching: User,
  offline: Clock,
}

const STATUS_COLORS: Record<AgentActivityStatus, string> = {
  active: 'bg-emerald-500',
  break: 'bg-amber-500',
  restroom: 'bg-blue-500',
  coaching: 'bg-purple-500',
  offline: 'bg-gray-500',
}

const STATUS_BG_COLORS: Record<AgentActivityStatus, string> = {
  active: 'bg-emerald-500/10 border-emerald-500/30',
  break: 'bg-amber-500/10 border-amber-500/30',
  restroom: 'bg-blue-500/10 border-blue-500/30',
  coaching: 'bg-purple-500/10 border-purple-500/30',
  offline: 'bg-gray-500/10 border-gray-500/30',
}

const STATUS_TEXT_COLORS: Record<AgentActivityStatus, string> = {
  active: 'text-emerald-400',
  break: 'text-amber-400',
  restroom: 'text-blue-400',
  coaching: 'text-purple-400',
  offline: 'text-gray-400',
}

export function BreakControl() {
  const { user } = useAuth()
  const [currentBreak, setCurrentBreak] = React.useState<BreakSession | null>(null)
  const [status, setStatus] = React.useState<AgentActivityStatus>('active')
  const [elapsedTime, setElapsedTime] = React.useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<AgentActivityStatus | null>(null)
  const [notes, setNotes] = React.useState('')
  const [totalBreakToday, setTotalBreakToday] = React.useState(0)
  const [isOvertime, setIsOvertime] = React.useState(false)

  // Only show for agents, team leads, supervisors
  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'
  const showBreakControl = isAgent || isLeadership || isSupervisor

  // Load initial status
  React.useEffect(() => {
    if (user?.id) {
      const agentStatus = dataService.getAgentStatusById(user.id)
      if (agentStatus) {
        setStatus(agentStatus.status)
        setTotalBreakToday(agentStatus.totalBreakTimeToday)
        if (agentStatus.currentBreak) {
          setCurrentBreak(agentStatus.currentBreak)
        }
      }
    }
  }, [user?.id])

  // Timer for current break
  React.useEffect(() => {
    if (!currentBreak) {
      setElapsedTime(0)
      setIsOvertime(false)
      return
    }

    const startTime = new Date(currentBreak.startTime).getTime()
    
    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedTime(elapsed)
      
      // Check if overtime (elapsed > scheduled duration in seconds)
      const scheduledSeconds = currentBreak.scheduledDuration * 60
      setIsOvertime(elapsed > scheduledSeconds)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [currentBreak])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectStatus = (newStatus: AgentActivityStatus) => {
    setSelectedStatus(newStatus)
    setIsConfirmOpen(true)
  }

  const confirmStartBreak = () => {
    if (!user?.id || !selectedStatus) return

    const breakSession = dataService.startBreak(user.id, selectedStatus, notes)
    setCurrentBreak(breakSession)
    setStatus(selectedStatus)
    setNotes('')
    setIsConfirmOpen(false)
    setSelectedStatus(null)
  }

  const handleEndBreak = () => {
    if (!currentBreak) return

    const endedBreak = dataService.endBreak(currentBreak.id)
    if (endedBreak) {
      setTotalBreakToday(prev => prev + (endedBreak.actualDuration || 0))
    }
    setCurrentBreak(null)
    setStatus('active')
  }

  if (!showBreakControl) return null

  const isOnBreak = status !== 'active' && status !== 'offline'

  return (
    <>
      <div className="px-2 py-2 border-t border-border/50">
        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <div className={cn("size-2.5 rounded-full animate-pulse", STATUS_COLORS[status])} />
            <span className="text-xs font-medium">{STATUS_LABELS[status]}</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {totalBreakToday}m / 90m
          </Badge>
        </div>

        {isOnBreak && currentBreak ? (
          // Active Break Display
          <div className={cn(
            "rounded-lg p-3 space-y-2 border",
            isOvertime ? "bg-rose-500/10 border-rose-500/30" : STATUS_BG_COLORS[status]
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {React.createElement(STATUS_ICONS[status], { 
                  className: cn("size-4", isOvertime ? "text-rose-400" : STATUS_TEXT_COLORS[status])
                })}
                <span className="text-sm font-medium">{STATUS_LABELS[status]}</span>
              </div>
              {isOvertime && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangle className="size-3 mr-1" />
                  Overtime
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className={cn(
                "text-2xl font-mono font-bold tabular-nums",
                isOvertime ? "text-rose-400" : STATUS_TEXT_COLORS[status]
              )}>
                {formatTime(elapsedTime)}
              </div>
              <span className="text-xs text-muted-foreground">
                / {currentBreak.scheduledDuration}:00
              </span>
            </div>

            <Button 
              onClick={handleEndBreak}
              size="sm" 
              className="w-full"
              variant={isOvertime ? "destructive" : "default"}
            >
              <Play className="size-4 mr-2" />
              Return to Active
            </Button>
          </div>
        ) : (
          // Status Menu
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Pause className="size-4" />
                  <span>Change Status</span>
                </div>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Select Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SELECTABLE_STATUSES.map((statusType) => {
                const Icon = STATUS_ICONS[statusType]
                return (
                  <DropdownMenuItem 
                    key={statusType}
                    onClick={() => handleSelectStatus(statusType)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full", STATUS_COLORS[statusType])} />
                      <Icon className="size-4" />
                      <span>{STATUS_LABELS[statusType]}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {STATUS_DURATIONS[statusType]}m
                    </Badge>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirm Status Change Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Status to {selectedStatus && STATUS_LABELS[selectedStatus]}</DialogTitle>
            <DialogDescription>
              You have {STATUS_DURATIONS[selectedStatus || 'break']} minutes for this status.
              Exceeding this time will be flagged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Duration</span>
              <Badge variant="outline">
                {STATUS_DURATIONS[selectedStatus || 'break']} minutes
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-500">
                Status changes are monitored. Extended time will be recorded and may require justification.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStartBreak}>
              <Pause className="size-4 mr-2" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact version for header
export function BreakStatusIndicator() {
  const { user } = useAuth()
  const [status, setStatus] = React.useState<AgentActivityStatus>('active')
  const [currentBreak, setCurrentBreak] = React.useState<BreakSession | null>(null)
  const [elapsedTime, setElapsedTime] = React.useState(0)

  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'
  const showIndicator = isAgent || isLeadership || isSupervisor

  React.useEffect(() => {
    if (user?.id) {
      const agentStatus = dataService.getAgentStatusById(user.id)
      if (agentStatus) {
        setStatus(agentStatus.status)
        if (agentStatus.currentBreak) {
          setCurrentBreak(agentStatus.currentBreak)
        }
      }
    }
  }, [user?.id])

  React.useEffect(() => {
    if (!currentBreak) return

    const startTime = new Date(currentBreak.startTime).getTime()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [currentBreak])

  if (!showIndicator) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-2 rounded-full", STATUS_COLORS[status])} />
      {currentBreak && (
        <span className="text-xs font-mono tabular-nums text-muted-foreground">
          {formatTime(elapsedTime)}
        </span>
      )}
    </div>
  )
}
