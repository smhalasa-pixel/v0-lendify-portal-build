'use client'

import * as React from 'react'
import { Coffee, Clock, Play, Pause, UtensilsCrossed, User, BookOpen, MessageSquare, Wrench, Heart, ChevronDown, AlertTriangle } from 'lucide-react'
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
import type { BreakType, BreakSession, AgentActivityStatus } from '@/lib/types'
import { BREAK_LABELS, BREAK_DURATIONS } from '@/lib/types'

const BREAK_ICONS: Record<BreakType, React.ElementType> = {
  lunch: UtensilsCrossed,
  bio: Coffee,
  prayer: Heart,
  meeting: MessageSquare,
  coaching: User,
  training: BookOpen,
  personal: Clock,
  system_issue: Wrench,
}

const STATUS_COLORS: Record<AgentActivityStatus, string> = {
  active: 'bg-emerald-500',
  on_break: 'bg-amber-500',
  offline: 'bg-gray-500',
  away: 'bg-rose-500',
  in_call: 'bg-blue-500',
}

const STATUS_LABELS: Record<AgentActivityStatus, string> = {
  active: 'Active',
  on_break: 'On Break',
  offline: 'Offline',
  away: 'Away',
  in_call: 'In Call',
}

export function BreakControl() {
  const { user } = useAuth()
  const [currentBreak, setCurrentBreak] = React.useState<BreakSession | null>(null)
  const [status, setStatus] = React.useState<AgentActivityStatus>('active')
  const [elapsedTime, setElapsedTime] = React.useState(0)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [selectedBreakType, setSelectedBreakType] = React.useState<BreakType | null>(null)
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

  const handleStartBreak = (breakType: BreakType) => {
    setSelectedBreakType(breakType)
    setIsConfirmOpen(true)
  }

  const confirmStartBreak = () => {
    if (!user?.id || !selectedBreakType) return

    const breakSession = dataService.startBreak(user.id, selectedBreakType, notes)
    setCurrentBreak(breakSession)
    setStatus('on_break')
    setNotes('')
    setIsConfirmOpen(false)
    setSelectedBreakType(null)
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

        {currentBreak ? (
          // Active Break Display
          <div className={cn(
            "rounded-lg p-3 space-y-2",
            isOvertime ? "bg-rose-500/10 border border-rose-500/30" : "bg-amber-500/10 border border-amber-500/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {React.createElement(BREAK_ICONS[currentBreak.breakType], { 
                  className: cn("size-4", isOvertime ? "text-rose-400" : "text-amber-400")
                })}
                <span className="text-sm font-medium">{BREAK_LABELS[currentBreak.breakType]}</span>
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
                isOvertime ? "text-rose-400" : "text-amber-400"
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
              End Break
            </Button>
          </div>
        ) : (
          // Break Menu
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Pause className="size-4" />
                  <span>Start Break</span>
                </div>
                <ChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Select Break Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(BREAK_LABELS) as BreakType[]).map((type) => {
                const Icon = BREAK_ICONS[type]
                return (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => handleStartBreak(type)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span>{BREAK_LABELS[type]}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {BREAK_DURATIONS[type]}m
                    </Badge>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirm Break Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start {selectedBreakType && BREAK_LABELS[selectedBreakType]}</DialogTitle>
            <DialogDescription>
              You have {BREAK_DURATIONS[selectedBreakType || 'bio']} minutes for this break type.
              Exceeding this time will be flagged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Duration</span>
              <Badge variant="outline">
                {BREAK_DURATIONS[selectedBreakType || 'bio']} minutes
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes for this break..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-500">
                Break time is monitored. Extended breaks will be recorded and may require justification.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStartBreak}>
              <Pause className="size-4 mr-2" />
              Start Break
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
