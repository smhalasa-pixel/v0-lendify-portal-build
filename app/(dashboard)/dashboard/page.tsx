'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, TrendingUp, TrendingDown, AlertTriangle, Target, Users, User, Filter, Search, ChevronDown, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { VolumeChart } from '@/components/dashboard/volume-chart'
import { ClientSearch } from '@/components/dashboard/client-search'
import { AnnouncementsList } from '@/components/dashboard/announcements-list'
import { TeamPerformanceTable } from '@/components/dashboard/team-performance-table'
import { AgentPerformanceTable } from '@/components/dashboard/agent-performance-table'
import { cn } from '@/lib/utils'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import type { DateRange } from 'react-day-picker'

// Compact metric display with hover tooltip for full value
function Metric({ 
  label, 
  value, 
  change, 
  format: fmt = 'number',
  numerator,
  denominator,
  decimals,
}: { 
  label: string
  value: number
  change?: number
  format?: 'currency' | 'number' | 'percentage'
  numerator?: number
  denominator?: number
  decimals?: number
}) {
  const formatted = React.useMemo(() => {
    if (fmt === 'currency') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toLocaleString()}`
    }
    if (fmt === 'percentage') return `${value.toFixed(1)}%`
    if (decimals !== undefined) return value.toFixed(decimals)
    return value.toLocaleString()
  }, [value, fmt, decimals])

  const fullValue = React.useMemo(() => {
    if (fmt === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    }
    if (fmt === 'percentage') return `${value.toFixed(2)}%`
    return new Intl.NumberFormat('en-US').format(value)
  }, [value, fmt])

  const needsTooltip = (fmt === 'currency' && value >= 1000) || (fmt === 'percentage' && numerator !== undefined && denominator !== undefined)

  const tooltipContent = React.useMemo(() => {
    if (fmt === 'percentage' && numerator !== undefined && denominator !== undefined) {
      return (
        <div className="text-center">
          <div className="font-semibold">{numerator} Closed / {denominator} Assigned</div>
          <div className="text-muted-foreground text-xs mt-0.5">= {value.toFixed(2)}%</div>
        </div>
      )
    }
    return <span className="font-mono">{fullValue}</span>
  }, [fmt, numerator, denominator, value, fullValue])

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1.5">
        {needsTooltip ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-base font-semibold text-foreground tabular-nums cursor-help border-b border-dotted border-muted-foreground/30">
                  {formatted}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-sm">
                {tooltipContent}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-base font-semibold text-foreground tabular-nums">{formatted}</span>
        )}
        {change !== undefined && (
          <span className={cn(
            "text-[10px] font-medium flex items-center gap-0.5",
            change > 0 ? "text-emerald-400" : change < 0 ? "text-rose-400" : "text-muted-foreground"
          )}>
            {change > 0 ? <TrendingUp className="size-2.5" /> : change < 0 ? <TrendingDown className="size-2.5" /> : null}
            {change > 0 && '+'}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

// Date preset options - used for label lookup (includes aliases for different value formats)
const DATE_PRESETS_LOOKUP: Record<string, string> = {
  'today': 'Today',
  'yesterday': 'Yesterday',
  '7d': '7 Days',
  '14d': '14 Days',
  '30d': '30 Days',
  '60d': '60 Days',
  '90d': '90 Days',
  'this-week': 'This Week',
  'last-week': 'Last Week',
  'mtd': 'MTD',
  'this-month': 'MTD',
  'last-month': 'Last Month',
  'qtd': 'QTD',
  'this-quarter': 'QTD',
  'ytd': 'YTD',
  'this-year': 'YTD',
  'last-quarter': 'Last Quarter',
  'last-year': 'Last Year',
  'all': 'All Time',
  'custom': 'Custom...',
}

// Date options for dropdown selectors (no duplicates)
const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'mtd', label: 'MTD' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'qtd', label: 'QTD' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'ytd', label: 'YTD' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom...' },
]

// Compact metric tile with date preset selector
function MetricTile({ 
  label, 
  value, 
  change, 
  format: fmt = 'number',
  decimals,
  dateValue,
  onDateChange,
  highlighted = false,
  subtleHighlight = false,
  hideDateSlicer = false,
}: { 
  label: string
  value: number
  change?: number
  format?: 'currency' | 'number' | 'percentage'
  decimals?: number
  dateValue?: string
  onDateChange?: (val: string) => void
  highlighted?: boolean
  subtleHighlight?: boolean
  hideDateSlicer?: boolean
}) {
  const [showCustom, setShowCustom] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({})
  
  const formatted = React.useMemo(() => {
    if (fmt === 'currency') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toLocaleString()}`
    }
    if (fmt === 'percentage') return `${value.toFixed(1)}%`
    if (decimals !== undefined) return value.toFixed(decimals)
    return value.toLocaleString()
  }, [value, fmt, decimals])
  
  // Full unabbreviated value for tooltip on currency
  const fullValue = fmt === 'currency' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null

  // Check if current value is a custom date range (format: "YYYY-MM-DD to YYYY-MM-DD")
  const isCustomValue = dateValue?.includes(' to ') ?? false
  const dateLabel = isCustomValue && dateValue
    ? dateValue.split(' to ').map(d => format(new Date(d), 'MMM d')).join(' - ')
    : dateValue ? (DATE_PRESETS_LOOKUP[dateValue] || dateValue) : ''

  const handleSelectChange = (val: string) => {
    if (val === 'custom') {
      setShowCustom(true)
    } else {
      onDateChange(val)
    }
  }

  const handleApplyCustom = () => {
    if (dateRange.from && dateRange.to) {
      const startStr = format(dateRange.from, 'yyyy-MM-dd')
      const endStr = format(dateRange.to, 'yyyy-MM-dd')
      onDateChange(`${startStr} to ${endStr}`)
      setShowCustom(false)
    }
  }

  return (
    <div className={cn(
      "rounded-lg p-2.5 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 hover:z-10 cursor-default",
      highlighted 
        ? "bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/40 p-3" 
        : subtleHighlight
          ? "bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-2.5"
          : "bg-card/50 border border-border/30"
    )}>
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className={cn(
          "text-muted-foreground truncate flex-1",
          highlighted ? "text-xs font-medium" : subtleHighlight ? "text-[11px] font-medium" : "text-[10px]"
        )}>{label}</span>
        {!hideDateSlicer && dateValue && onDateChange && (
          <Popover open={showCustom} onOpenChange={setShowCustom}>
            <PopoverTrigger asChild>
              <div>
                <Select value={isCustomValue ? 'custom' : dateValue} onValueChange={handleSelectChange}>
                  <SelectTrigger className="h-5 text-[9px] w-auto min-w-[70px] bg-muted/30 border-border/40 px-1.5 py-0 [&>svg]:size-2.5 [&>svg]:opacity-50">
                    <span className="truncate">{dateLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_PRESETS.map(d => (
                      <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-3">
                <div className="text-xs font-medium">Select Date Range</div>
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || {})}
                  className="rounded-md border"
                />
                <div className="text-xs text-muted-foreground">
                  {dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Select start'} 
                  {' - '} 
                  {dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Select end'}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCustom(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleApplyCustom} disabled={!dateRange.from || !dateRange.to}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex flex-col items-center text-center">
        {fullValue ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "font-semibold text-foreground tabular-nums cursor-help",
                  highlighted ? "text-xl" : "text-base"
                )}>{formatted}</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-sm font-medium">{fullValue}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className={cn(
            "font-semibold text-foreground tabular-nums",
            highlighted ? "text-xl" : "text-base"
          )}>{formatted}</span>
        )}
        {change !== undefined && (
          <span className={cn(
            "font-medium flex items-center justify-center gap-0.5 mt-0.5",
            highlighted ? "text-[10px]" : "text-[9px]",
            change > 0 ? "text-emerald-400" : change < 0 ? "text-rose-400" : "text-muted-foreground"
          )}>
            {change > 0 ? <TrendingUp className="size-2.5" /> : change < 0 ? <TrendingDown className="size-2.5" /> : null}
            {change > 0 && '+'}{change.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isSupervisor = user?.role === 'supervisor'
  const isExecutive = user?.role === 'executive'
  const isAdmin = user?.role === 'admin'
  // Admin and Executive see the same dashboard view
  const hasExecutiveView = isExecutive || isAdmin

  // Get all team leads and supervisors for filter options - dynamically from dataService
  const teamLeads = React.useMemo(() => dataService.getTeamLeads(), [])
  const supervisors = React.useMemo(() => dataService.getSupervisors(), [])
  const allTeamIds = React.useMemo(() => dataService.getAllTeamIds(), [])

  // Filter state - simplified hierarchy-based selection
  const [selectedTeamLeads, setSelectedTeamLeads] = React.useState<string[]>([]) // empty = all
  const [selectedSupervisors, setSelectedSupervisors] = React.useState<string[]>([]) // empty = all
  const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]) // empty = all
  const [selectedAgents, setSelectedAgents] = React.useState<string[]>([]) // empty = all
  
  // Global date slicer - affects all metrics when set
  const [globalDateFilter, setGlobalDateFilter] = React.useState<string>('this-month')
  const [globalCustomDateRange, setGlobalCustomDateRange] = React.useState<DateRange | undefined>(undefined)
  const [showGlobalCustomPicker, setShowGlobalCustomPicker] = React.useState(false)
  const [useGlobalDate, setUseGlobalDate] = React.useState(true) // When true, global date overrides individual slicers
  
  // View toggle for tables: 'teams' or 'agents'
  const [tableView, setTableView] = React.useState<'teams' | 'agents'>('teams')
  
  // Filter popover states
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false)
  const [filterSearchTerm, setFilterSearchTerm] = React.useState('')
  const [activeFilterTab, setActiveFilterTab] = React.useState<'team-leads' | 'supervisors' | 'teams' | 'agents'>('teams')
  
  // Month selector for Monthly Targets
  const [selectedTargetMonth, setSelectedTargetMonth] = React.useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  // Get all agents for the filter dropdown
  const allAgents = React.useMemo(() => dataService.getAgents(), [])
  const allTeamsData = React.useMemo(() => dataService.getTeamMetrics(), [])
  
  // Compute active filter summary for display
  const activeFilterSummary = React.useMemo(() => {
    const parts: string[] = []
    
    if (selectedTeamLeads.length > 0) {
      const names = selectedTeamLeads.map(id => teamLeads.find(l => l.id === id)?.name).filter(Boolean)
      parts.push(`${names.length} Lead Source${names.length > 1 ? 's' : ''}`)
    }
    if (selectedSupervisors.length > 0) {
      const names = selectedSupervisors.map(id => supervisors.find(s => s.id === id)?.name).filter(Boolean)
      parts.push(`${names.length} Supervisor${names.length > 1 ? 's' : ''}`)
    }
    if (selectedTeams.length > 0) {
      parts.push(`${selectedTeams.length} Team${selectedTeams.length > 1 ? 's' : ''}`)
    }
    if (selectedAgents.length > 0) {
      parts.push(`${selectedAgents.length} Agent${selectedAgents.length > 1 ? 's' : ''}`)
    }
    
    return parts.length > 0 ? parts.join(', ') : 'All Data'
  }, [selectedTeamLeads, selectedSupervisors, selectedTeams, selectedAgents, teamLeads, supervisors])
  
  // Filtered teams based on hierarchy selections
  const filteredTeamsForDropdown = React.useMemo(() => {
    let teams = allTeamsData
    
    // Filter by selected team leads
    if (selectedTeamLeads.length > 0) {
      const leadTeamIds = selectedTeamLeads
        .map(id => teamLeads.find(l => l.id === id)?.teamId)
        .filter(Boolean) as string[]
      teams = teams.filter(t => leadTeamIds.includes(t.teamId))
    }
    
    // Filter by selected supervisors
    if (selectedSupervisors.length > 0) {
      const supTeamIds = new Set<string>()
      selectedSupervisors.forEach(id => {
        const sup = supervisors.find(s => s.id === id)
        sup?.teamIds?.forEach(tid => supTeamIds.add(tid))
      })
      teams = teams.filter(t => supTeamIds.has(t.teamId))
    }
    
    return teams
  }, [allTeamsData, selectedTeamLeads, selectedSupervisors, teamLeads, supervisors])
  
  // Filtered agents based on hierarchy selections
  const filteredAgentsForDropdown = React.useMemo(() => {
    let agents = allAgents
    
    // Filter by selected teams (from filtered teams)
    if (selectedTeams.length > 0) {
      agents = agents.filter(a => selectedTeams.includes(a.teamId || ''))
    } else if (selectedTeamLeads.length > 0 || selectedSupervisors.length > 0) {
      // If teams not explicitly selected but team leads/supervisors are, filter by their teams
      const teamIds = filteredTeamsForDropdown.map(t => t.teamId)
      agents = agents.filter(a => teamIds.includes(a.teamId || ''))
    }
    
    return agents
  }, [allAgents, selectedTeams, selectedTeamLeads, selectedSupervisors, filteredTeamsForDropdown])

  // Get filtered metrics based on hierarchical selection
  const metrics = React.useMemo(() => {
    // Agent always sees their own metrics
    if (isAgent && user) return dataService.getDashboardMetrics(user.id)
    
    // If specific agents are selected, show first agent's metrics (or aggregate)
    if (selectedAgents.length === 1) {
      return dataService.getDashboardMetrics(selectedAgents[0])
    }
    
    // If specific teams are selected, show first team's metrics
    if (selectedTeams.length === 1) {
      return dataService.getDashboardMetrics(undefined, selectedTeams[0])
    }
    
    // If teams/supervisors/leads selected, show aggregated
    if (selectedTeams.length > 0 || selectedSupervisors.length > 0 || selectedTeamLeads.length > 0) {
      // For now, show global (would need to aggregate in real implementation)
      return dataService.getDashboardMetrics()
    }
    
    // Default: leadership sees their team, others see global
    if (isLeadership && user?.teamId) return dataService.getDashboardMetrics(undefined, user.teamId)
    return dataService.getDashboardMetrics()
  }, [user, isAgent, isLeadership, selectedAgents, selectedTeams, selectedSupervisors, selectedTeamLeads])

  const pipeline = React.useMemo(() => {
    if (isAgent && user) return dataService.getPipeline(user.id)
    return dataService.getPipeline()
  }, [user, isAgent])

  // Clients data for client search - agents only see their own clients
  const clients = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getClients(user.id)
    }
    if (isLeadership && user?.teamId) {
      return dataService.getClients(undefined, [user.teamId])
    }
    if (isSupervisor && user?.teamIds) {
      return dataService.getClients(undefined, user.teamIds)
    }
    // Executives see all clients
    return dataService.getClients()
  }, [user, isAgent, isLeadership, isSupervisor])

  const volumeData = React.useMemo(() => dataService.getVolumeChartData(30), [])
  const announcements = React.useMemo(() => dataService.getAnnouncements(), [])
  
  // Team metrics - filtered by hierarchical selection
  const teamMetrics = React.useMemo(() => {
    // If specific teams selected, show those
    if (selectedTeams.length > 0) {
      return allTeamsData.filter(t => selectedTeams.includes(t.teamId))
    }
    
    // Use the hierarchically filtered teams
    if (selectedTeamLeads.length > 0 || selectedSupervisors.length > 0) {
      return filteredTeamsForDropdown
    }
    
    // Default behavior by role
    if (isLeadership && user?.teamId) {
      return allTeamsData.filter(t => t.teamId === user.teamId)
    }
    if (isSupervisor && user?.teamIds) {
      return allTeamsData.filter(t => user.teamIds!.includes(t.teamId))
    }
    
    return allTeamsData
  }, [selectedTeams, selectedTeamLeads, selectedSupervisors, filteredTeamsForDropdown, allTeamsData, isLeadership, isSupervisor, user?.teamId, user?.teamIds])
  
  // Agent performance - filtered by hierarchical selection
  const agentPerformance = React.useMemo(() => {
    // If specific agents selected, show those
    if (selectedAgents.length > 0) {
      const allAgentPerf = dataService.getAgentPerformanceByTeams(allTeamIds)
      return allAgentPerf.filter(a => selectedAgents.includes(a.agentId))
    }
    
    // Get team IDs to filter by
    const teamIdsToUse = selectedTeams.length > 0 
      ? selectedTeams 
      : filteredTeamsForDropdown.map(t => t.teamId)
    
    if (teamIdsToUse.length > 0 && (selectedTeams.length > 0 || selectedTeamLeads.length > 0 || selectedSupervisors.length > 0)) {
      return dataService.getAgentPerformanceByTeams(teamIdsToUse)
    }
    
    // Default behavior by role
    if (isLeadership && user?.teamId) {
      return dataService.getAgentPerformanceByTeam(user.teamId)
    }
    if (isSupervisor && user?.teamIds && user.teamIds.length > 0) {
      return dataService.getAgentPerformanceByTeams(user.teamIds)
    }
    if (hasExecutiveView) {
      return dataService.getAgentPerformanceByTeams(allTeamIds)
    }
    
    return []
  }, [selectedAgents, selectedTeams, selectedTeamLeads, selectedSupervisors, filteredTeamsForDropdown, allTeamIds, isLeadership, isSupervisor, hasExecutiveView, user?.teamId, user?.teamIds])

  // Dashboard title based on hierarchical selection
  const dashboardTitle = React.useMemo(() => {
    if (isAgent) return 'My Dashboard'
    
    // If specific agent selected
    if (selectedAgents.length === 1) {
      const agent = allAgents.find(a => a.id === selectedAgents[0])
      return agent ? `${agent.name}'s Dashboard` : 'Agent Dashboard'
    }
    if (selectedAgents.length > 1) return `${selectedAgents.length} Agents Dashboard`
    
    // If specific teams selected
    if (selectedTeams.length === 1) {
      const team = allTeamsData.find(t => t.teamId === selectedTeams[0])
      return team ? `${team.teamName} Dashboard` : 'Team Dashboard'
    }
    if (selectedTeams.length > 1) return `${selectedTeams.length} Teams Dashboard`
    
    // If supervisors selected
    if (selectedSupervisors.length === 1) {
      const sup = supervisors.find(s => s.id === selectedSupervisors[0])
      return sup ? `${sup.name}'s Teams` : 'Supervisor Dashboard'
    }
    if (selectedSupervisors.length > 1) return `${selectedSupervisors.length} Supervisors Dashboard`
    
    // If lead sources selected
    if (selectedTeamLeads.length === 1) {
      const lead = teamLeads.find(l => l.id === selectedTeamLeads[0])
      return lead ? `${lead.name} Dashboard` : 'Lead Source Dashboard'
    }
    if (selectedTeamLeads.length > 1) return `${selectedTeamLeads.length} Lead Sources Dashboard`
    
    if (isLeadership) return `${user?.teamName || 'Team'} Dashboard`
    if (isSupervisor) return 'Supervisor Dashboard'
    if (isAdmin) return 'Admin Dashboard'
    return 'Executive Dashboard'
  }, [isAgent, isLeadership, isSupervisor, isAdmin, selectedAgents, selectedTeams, selectedSupervisors, selectedTeamLeads, allAgents, allTeamsData, supervisors, teamLeads, user?.teamName])

  // Date slicer states - each metric has its own
  const [unitsSubmittedDate, setUnitsSubmittedDate] = React.useState('this-month')
  const [debtLoadSubmittedDate, setDebtLoadSubmittedDate] = React.useState('this-month')
  const [convRateDate, setConvRateDate] = React.useState('this-month')
  const [qualConvDate, setQualConvDate] = React.useState('this-month')
  const [unitsEnrolledDate, setUnitsEnrolledDate] = React.useState('this-month')
  const [debtLoadEnrolledDate, setDebtLoadEnrolledDate] = React.useState('this-month')
  const [unitsFpcDate, setUnitsFpcDate] = React.useState('this-month')
  const [debtLoadFpcDate, setDebtLoadFpcDate] = React.useState('this-month')
  const [ancillaryDate, setAncillaryDate] = React.useState('this-month')
  const [avgDebtPerFileDate, setAvgDebtPerFileDate] = React.useState('this-month')
  const [avgDailyDebtDate, setAvgDailyDebtDate] = React.useState('this-month')
  const [avgDailyUnitsDate, setAvgDailyUnitsDate] = React.useState('this-month')
  const [clientsEnrolledDate, setClientsEnrolledDate] = React.useState('this-month')
  const [clientsActiveDate, setClientsActiveDate] = React.useState('this-month')
  const [clientsCancelledDate, setClientsCancelledDate] = React.useState('this-month')
  const [cancellationRateDate, setCancellationRateDate] = React.useState('this-month')
  const [epfsCollectedDate, setEpfsCollectedDate] = React.useState('this-month')
  const [epfsScheduledDate, setEpfsScheduledDate] = React.useState('this-month')
  
  // Region slicer state - for executive and admin views
  const [selectedRegion, setSelectedRegion] = React.useState<'all' | 'dubai' | 'jordan'>('all')
  
  const [customRange, setCustomRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [calendarOpen, setCalendarOpen] = React.useState<string | null>(null)

  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '7d', label: '7 Days' },
    { value: '14d', label: '14 Days' },
    { value: '30d', label: '30 Days' },
    { value: '60d', label: '60 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'mtd', label: 'MTD' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'qtd', label: 'QTD' },
    { value: 'ytd', label: 'YTD' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom...' },
  ]

  const DateSelector = ({ value, onChange, id }: { value: string; onChange: (val: string) => void; id: string }) => (
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={(val) => val === 'custom' ? setCalendarOpen(id) : onChange(val)}>
        <SelectTrigger className="h-5 text-[10px] w-auto min-w-[70px] bg-transparent border-border/40 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dateOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === 'custom' && (
        <Popover open={calendarOpen === id} onOpenChange={(open) => setCalendarOpen(open ? id : null)}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5">
              <CalendarIcon className="size-3 mr-1" />
              {customRange.from && customRange.to 
                ? `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`
                : 'Select'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: customRange.from, to: customRange.to }}
              onSelect={(range) => {
                setCustomRange({ from: range?.from, to: range?.to })
                if (range?.from && range?.to) setCalendarOpen(null)
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )

  // Month and year options for separate dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]
  
  // Years from 2020 to current year + 1
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearList = []
    for (let y = currentYear + 1; y >= 2020; y--) {
      yearList.push({ value: String(y), label: String(y) })
    }
    return yearList
  }, [])
  
  // Separate state for month and year (format is YYYY-MM)
  const [selectedYear, selectedMonth] = selectedTargetMonth.split('-')
  
  const handleMonthChange = (month: string) => {
    setSelectedTargetMonth(`${selectedYear}-${month}`)
  }
  
  const handleYearChange = (year: string) => {
    setSelectedTargetMonth(`${year}-${selectedMonth}`)
  }
  
  // Get monthly target metrics based on selected month
  const monthlyTargetMetrics = React.useMemo(() => {
    return dataService.getMonthlyTargetMetrics(selectedTargetMonth)
  }, [selectedTargetMonth])
  
  // Progress calculations - based on selected month
  const currentDate = new Date()
  const unitsProgress = Math.min((monthlyTargetMetrics.unitsEnrolled / monthlyTargetMetrics.monthlyTargetUnits) * 100, 100)
  const debtProgress = Math.min((monthlyTargetMetrics.debtLoadEnrolled / monthlyTargetMetrics.monthlyTargetDebtLoad) * 100, 100)

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
    return `$${val.toLocaleString()}`
  }

  // Apply global date to all metric slicers when changed
  const applyGlobalDate = React.useCallback((date: string) => {
    if (date === 'custom') {
      // Open the custom date picker instead of applying immediately
      setShowGlobalCustomPicker(true)
      return
    }
    
    setGlobalDateFilter(date)
    setGlobalCustomDateRange(undefined) // Clear custom range when selecting preset
    if (useGlobalDate) {
      setUnitsSubmittedDate(date)
      setDebtLoadSubmittedDate(date)
      setConvRateDate(date)
      setQualConvDate(date)
      setUnitsEnrolledDate(date)
      setDebtLoadEnrolledDate(date)
      setUnitsFpcDate(date)
      setDebtLoadFpcDate(date)
      setAncillaryDate(date)
      setAvgDebtPerFileDate(date)
      setAvgDailyDebtDate(date)
      setAvgDailyUnitsDate(date)
      setClientsEnrolledDate(date)
      setClientsActiveDate(date)
      setClientsCancelledDate(date)
      setCancellationRateDate(date)
      setEpfsCollectedDate(date)
      setEpfsScheduledDate(date)
    }
  }, [useGlobalDate])
  
  // Apply global custom date range to all metrics
  const applyGlobalCustomDateRange = React.useCallback(() => {
    if (!globalCustomDateRange?.from || !globalCustomDateRange?.to) return
    
    setGlobalDateFilter('custom')
    setShowGlobalCustomPicker(false)
    
    // For custom dates, we set all slicers to 'custom' 
    // The individual MetricTile components will need to use the global custom range
    if (useGlobalDate) {
      setUnitsSubmittedDate('custom')
      setDebtLoadSubmittedDate('custom')
      setConvRateDate('custom')
      setQualConvDate('custom')
      setUnitsEnrolledDate('custom')
      setDebtLoadEnrolledDate('custom')
      setUnitsFpcDate('custom')
      setDebtLoadFpcDate('custom')
      setAncillaryDate('custom')
      setAvgDebtPerFileDate('custom')
      setAvgDailyDebtDate('custom')
      setAvgDailyUnitsDate('custom')
      setClientsEnrolledDate('custom')
      setClientsActiveDate('custom')
      setClientsCancelledDate('custom')
      setCancellationRateDate('custom')
      setEpfsCollectedDate('custom')
      setEpfsScheduledDate('custom')
    }
  }, [globalCustomDateRange, useGlobalDate])
  
  // Clear all filters
  const clearAllFilters = React.useCallback(() => {
    setSelectedTeamLeads([])
    setSelectedSupervisors([])
    setSelectedTeams([])
    setSelectedAgents([])
  }, [])

  return (
    <div className="p-4 lg:p-5 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">{dashboardTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Global Date Slicer */}
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1.5">
            <CalendarIcon className="size-3.5 text-muted-foreground ml-1" />
            <Select 
              value={globalDateFilter} 
              onValueChange={(val) => {
                if (val === 'custom') {
                  setShowGlobalCustomPicker(true)
                } else {
                  applyGlobalDate(val)
                }
              }}
            >
              <SelectTrigger className="h-7 text-xs w-auto min-w-[100px] bg-background border-0">
                <SelectValue>
                  {globalDateFilter === 'custom' && globalCustomDateRange?.from && globalCustomDateRange?.to
                    ? `${format(globalCustomDateRange.from, 'MMM d')} - ${format(globalCustomDateRange.to, 'MMM d')}`
                    : dateOptions.find(o => o.value === globalDateFilter)?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {globalDateFilter === 'custom' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-1.5 text-xs"
                onClick={() => setShowGlobalCustomPicker(true)}
              >
                <CalendarIcon className="size-3" />
              </Button>
            )}
          </div>
          
          {/* Custom Date Range Picker Dialog */}
          <Dialog open={showGlobalCustomPicker} onOpenChange={setShowGlobalCustomPicker}>
            <DialogContent className="max-w-fit">
              <DialogHeader>
                <DialogTitle>Select Date Range</DialogTitle>
                <DialogDescription>
                  Choose a custom date range to apply to all metrics
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Calendar
                  mode="range"
                  selected={globalCustomDateRange}
                  onSelect={setGlobalCustomDateRange}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {globalCustomDateRange?.from ? format(globalCustomDateRange.from, 'MMM d, yyyy') : 'Select start'} 
                {' - '} 
                {globalCustomDateRange?.to ? format(globalCustomDateRange.to, 'MMM d, yyyy') : 'Select end'}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGlobalCustomPicker(false)}>
                  Cancel
                </Button>
                <Button onClick={applyGlobalCustomDateRange} disabled={!globalCustomDateRange?.from || !globalCustomDateRange?.to}>
                  Apply to All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Region Slicer - Only for Executive and Admin */}
          {hasExecutiveView && (
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1.5">
              <Select value={selectedRegion} onValueChange={(val) => setSelectedRegion(val as 'all' | 'dubai' | 'jordan')}>
                <SelectTrigger className="h-7 text-xs w-auto min-w-[100px] bg-background border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="dubai">Dubai</SelectItem>
                  <SelectItem value="jordan">Jordan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Unified Filter - Multi-select with tabs */}
          {!isAgent && (
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-8 text-xs gap-1.5 bg-muted/50 border-0",
                    (selectedTeamLeads.length > 0 || selectedSupervisors.length > 0 || selectedTeams.length > 0 || selectedAgents.length > 0) && "bg-primary/10 text-primary"
                  )}
                >
                  <Filter className="size-3.5" />
                  <span>{activeFilterSummary}</span>
                  <ChevronDown className="size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Filter Data</span>
                    {(selectedTeamLeads.length > 0 || selectedSupervisors.length > 0 || selectedTeams.length > 0 || selectedAgents.length > 0) && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={filterSearchTerm}
                      onChange={(e) => setFilterSearchTerm(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-border/50">
                  {(['team-leads', 'supervisors', 'teams', 'agents'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilterTab(tab)}
                      className={cn(
                        "flex-1 px-2 py-2 text-[10px] font-medium transition-colors",
                        activeFilterTab === tab 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === 'team-leads' ? 'Lead Source' : tab === 'supervisors' ? 'Supervisors' : tab === 'teams' ? 'Teams' : 'Agents'}
                      {tab === 'team-leads' && selectedTeamLeads.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0">{selectedTeamLeads.length}</Badge>
                      )}
                      {tab === 'supervisors' && selectedSupervisors.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0">{selectedSupervisors.length}</Badge>
                      )}
                      {tab === 'teams' && selectedTeams.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0">{selectedTeams.length}</Badge>
                      )}
                      {tab === 'agents' && selectedAgents.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[9px] px-1 py-0">{selectedAgents.length}</Badge>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div className="max-h-64 overflow-y-auto p-2">
                  {activeFilterTab === 'team-leads' && (
                    <div className="space-y-0.5">
                      {teamLeads
                        .filter(lead => lead.name.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(lead => (
                          <button
                            key={lead.id}
                            onClick={() => {
                              setSelectedTeamLeads(prev => 
                                prev.includes(lead.id) 
                                  ? prev.filter(id => id !== lead.id)
                                  : [...prev, lead.id]
                              )
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedTeamLeads.includes(lead.id) && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>{lead.name}</span>
                            {selectedTeamLeads.includes(lead.id) && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  )}
                  
                  {activeFilterTab === 'supervisors' && (
                    <div className="space-y-0.5">
                      {supervisors
                        .filter(sup => sup.name.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(sup => (
                          <button
                            key={sup.id}
                            onClick={() => {
                              setSelectedSupervisors(prev => 
                                prev.includes(sup.id) 
                                  ? prev.filter(id => id !== sup.id)
                                  : [...prev, sup.id]
                              )
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedSupervisors.includes(sup.id) && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>{sup.name}</span>
                            {selectedSupervisors.includes(sup.id) && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  )}
                  
                  {activeFilterTab === 'teams' && (
                    <div className="space-y-0.5">
                      {filteredTeamsForDropdown
                        .filter(team => team.teamName.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(team => (
                          <button
                            key={team.teamId}
                            onClick={() => {
                              setSelectedTeams(prev => 
                                prev.includes(team.teamId) 
                                  ? prev.filter(id => id !== team.teamId)
                                  : [...prev, team.teamId]
                              )
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedTeams.includes(team.teamId) && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>{team.teamName}</span>
                            {selectedTeams.includes(team.teamId) && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  )}
                  
                  {activeFilterTab === 'agents' && (
                    <div className="space-y-0.5">
                      {filteredAgentsForDropdown
                        .filter(agent => agent.name.toLowerCase().includes(filterSearchTerm.toLowerCase()))
                        .map(agent => (
                          <button
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgents(prev => 
                                prev.includes(agent.id) 
                                  ? prev.filter(id => id !== agent.id)
                                  : [...prev, agent.id]
                              )
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedAgents.includes(agent.id) && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>{agent.name}</span>
                            {selectedAgents.includes(agent.id) && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Current Date Display */}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-3">
          
          {/* Top Row - Submissions (subtle highlight) */}
          <div className="grid grid-cols-3 gap-2">
            <MetricTile label="Units Submitted" value={metrics.unitsSubmitted} change={metrics.unitsSubmittedChange} dateValue={unitsSubmittedDate} onDateChange={setUnitsSubmittedDate} subtleHighlight />
            <MetricTile label="Debt Submitted" value={metrics.debtLoadSubmitted} change={metrics.debtLoadSubmittedChange} format="currency" dateValue={debtLoadSubmittedDate} onDateChange={setDebtLoadSubmittedDate} subtleHighlight />
            <MetricTile label="Conv. Rate" value={metrics.conversionRate} change={metrics.conversionRateChange} format="percentage" dateValue={convRateDate} onDateChange={setConvRateDate} subtleHighlight />
          </div>

          {/* Highlighted KPIs - Units Enrolled, Debt Enrolled, Qualified Conv. */}
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="Units Enrolled" value={metrics.unitsEnrolled} change={metrics.unitsEnrolledChange} dateValue={unitsEnrolledDate} onDateChange={setUnitsEnrolledDate} highlighted />
            <MetricTile label="Debt Enrolled" value={metrics.debtLoadEnrolled} change={metrics.debtLoadEnrolledChange} format="currency" dateValue={debtLoadEnrolledDate} onDateChange={setDebtLoadEnrolledDate} highlighted />
            <MetricTile label="Qual. Conv." value={metrics.qualifiedConversionRate} change={metrics.qualifiedConversionRateChange} format="percentage" dateValue={qualConvDate} onDateChange={setQualConvDate} highlighted />
          </div>

          {/* FPC & Ancillary Row (dim highlight) */}
          <div className="grid grid-cols-3 gap-2">
            <MetricTile label="Units FPC" value={metrics.unitsFPC} change={metrics.unitsFPCChange} dateValue={unitsFpcDate} onDateChange={setUnitsFpcDate} subtleHighlight />
            <MetricTile label="Debt FPC" value={metrics.debtLoadFPC} change={metrics.debtLoadFPCChange} format="currency" dateValue={debtLoadFpcDate} onDateChange={setDebtLoadFpcDate} subtleHighlight />
            <MetricTile label="Ancillary Sales" value={metrics.ancillaryCount} change={metrics.ancillaryCountChange} dateValue={ancillaryDate} onDateChange={setAncillaryDate} subtleHighlight />
          </div>

          {/* Averages Row */}
          <div className="grid grid-cols-3 gap-2">
            <MetricTile label="Avg Daily Units" value={metrics.avgDailyEnrolledUnits} change={metrics.avgDailyEnrolledUnitsChange} decimals={1} dateValue={avgDailyUnitsDate} onDateChange={setAvgDailyUnitsDate} />
            <MetricTile label="Avg Daily Debt" value={metrics.avgDailyEnrolledDebt} change={metrics.avgDailyEnrolledDebtChange} format="currency" dateValue={avgDailyDebtDate} onDateChange={setAvgDailyDebtDate} />
            <MetricTile label="Avg Debt/File" value={metrics.avgDebtLoadPerFile} change={metrics.avgDebtLoadPerFileChange} format="currency" dateValue={avgDebtPerFileDate} onDateChange={setAvgDebtPerFileDate} />
          </div>

          {/* Clients Row - All client metrics together */}
          <div className="grid grid-cols-4 gap-2">
            <MetricTile label="Clients Enrolled" value={metrics.clientsEnrolled} change={metrics.clientsEnrolledChange} dateValue={clientsEnrolledDate} onDateChange={setClientsEnrolledDate} />
            <MetricTile label="Clients Active" value={metrics.clientsActive} change={metrics.clientsActiveChange} dateValue={clientsActiveDate} onDateChange={setClientsActiveDate} />
            <MetricTile label="Clients Cancelled" value={metrics.clientsCancelled} change={metrics.clientsCancelledChange} dateValue={clientsCancelledDate} onDateChange={setClientsCancelledDate} />
            <MetricTile label="Cancellation %" value={metrics.cancellationRate} change={metrics.cancellationRateChange} format="percentage" hideDateSlicer />
          </div>

          {/* Chart */}
          <VolumeChart data={volumeData} />
          
          {/* EPF KPIs - Executive and Admin only */}
          {hasExecutiveView && (
            <div className="grid grid-cols-2 gap-2">
              <MetricTile label="EPFs Collected" value={metrics.epfsCollected} change={metrics.epfsCollectedChange} dateValue={epfsCollectedDate} onDateChange={setEpfsCollectedDate} />
              <MetricTile label="EPFs Scheduled" value={metrics.epfsScheduled} change={metrics.epfsScheduledChange} dateValue={epfsScheduledDate} onDateChange={setEpfsScheduledDate} />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          
          {/* Monthly Targets - Featured Card */}
          <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-background to-primary/5">
            {/* Glow effect */}
            <div className="absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-20 bg-primary" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg flex items-center justify-center bg-primary/20">
                    <Target className="size-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Monthly Targets</span>
                    <p className="text-[10px] text-muted-foreground">Track your progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-auto h-7 text-xs bg-background/50 border-border/50 rounded-r-none border-r-0 [&>svg]:hidden px-2.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(m => (
                          <SelectItem key={m.value} value={m.value} className="text-xs">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-auto h-7 text-xs bg-background/50 border-border/50 rounded-l-none [&>svg]:hidden px-2.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y.value} value={y.value} className="text-xs">
                            {y.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {/* Units */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Units Enrolled</span>
                    <span className="text-sm font-bold text-foreground">{monthlyTargetMetrics.unitsEnrolled} <span className="text-muted-foreground font-normal">/ {monthlyTargetMetrics.monthlyTargetUnits}</span></span>
                  </div>
                  <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary/70"
                      style={{ width: `${unitsProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-primary">{unitsProgress.toFixed(0)}% complete</span>
                    <span className="text-muted-foreground">{Math.max(0, monthlyTargetMetrics.monthlyTargetUnits - monthlyTargetMetrics.unitsEnrolled)} remaining</span>
                  </div>
                </div>
                {/* Debt Load */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Debt Load</span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(monthlyTargetMetrics.debtLoadEnrolled)} <span className="text-muted-foreground font-normal">/ {formatCurrency(monthlyTargetMetrics.monthlyTargetDebtLoad)}</span></span>
                  </div>
                  <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 to-emerald-400"
                      style={{ width: `${debtProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-emerald-400">{debtProgress.toFixed(0)}% complete</span>
                    <span className="text-muted-foreground">{formatCurrency(Math.max(0, monthlyTargetMetrics.monthlyTargetDebtLoad - monthlyTargetMetrics.debtLoadEnrolled))} remaining</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

{/* Client Search */}
      <ClientSearch data={clients} />

          {/* Announcements */}
          <AnnouncementsList announcements={announcements} userId={user?.id} limit={3} />
        </div>
      </div>

      {/* Data Tables - Based on filter and view selection */}
      {!isAgent && (
        <div className="space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              <button
                onClick={() => setTableView('teams')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  tableView === 'teams' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="size-4" />
                Teams
              </button>
              <button
                onClick={() => setTableView('agents')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  tableView === 'agents' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="size-4" />
                Agents
              </button>
            </div>
          </div>

          {tableView === 'teams' && teamMetrics.length > 0 && (
            <TeamPerformanceTable 
              data={teamMetrics} 
              title={activeFilterSummary === 'All Data' ? 'All Teams' : `${activeFilterSummary} - Teams`}
              description={`Performance metrics for ${teamMetrics.length} team${teamMetrics.length !== 1 ? 's' : ''}`}
              highlightTeamId={user?.teamId}
            />
          )}
          
          {tableView === 'agents' && agentPerformance.length > 0 && (
            <AgentPerformanceTable 
              data={agentPerformance}
              title={activeFilterSummary === 'All Data' ? 'All Agents' : `${activeFilterSummary} - Agents`}
              description={`Individual performance for ${agentPerformance.length} agent${agentPerformance.length !== 1 ? 's' : ''}`}
            />
          )}
        </div>
      )}

      {/* EPF Lead Source Performance - Admin Only */}
      {user?.role === 'admin' && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <CardTitle>EPF Lead Source Performance</CardTitle>
                <CardDescription>Marketing spend and cost efficiency by lead source</CardDescription>
              </div>
              <Select defaultValue="mtd">
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Lead Source</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Spent Budget</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">CPE</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">CPDE</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Clients FPC</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">DE FPC</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Google Ads', spentBudget: 125000, cpe: 2450, cpde: 0.082, clientsFpc: 51, deFpc: 1520000 },
                    { name: 'Facebook Ads', spentBudget: 85000, cpe: 2125, cpde: 0.071, clientsFpc: 40, deFpc: 1200000 },
                    { name: 'TikTok Ads', spentBudget: 45000, cpe: 1875, cpde: 0.063, clientsFpc: 24, deFpc: 720000 },
                    { name: 'Referrals', spentBudget: 15000, cpe: 750, cpde: 0.025, clientsFpc: 20, deFpc: 600000 },
                    { name: 'Organic Search', spentBudget: 8000, cpe: 400, cpde: 0.013, clientsFpc: 20, deFpc: 600000 },
                    { name: 'Direct Mail', spentBudget: 32000, cpe: 3200, cpde: 0.107, clientsFpc: 10, deFpc: 300000 },
                    { name: 'Radio', spentBudget: 28000, cpe: 2800, cpde: 0.093, clientsFpc: 10, deFpc: 300000 },
                  ].map((source, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-center font-medium text-foreground">{source.name}</td>
                      <td className="py-3 px-4 text-center">
                        <CurrencyDisplay value={source.spentBudget} className="text-sm" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CurrencyDisplay value={source.cpe} className="text-sm" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <CurrencyDisplay value={source.cpde} className="text-sm" />
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{source.clientsFpc}</td>
                      <td className="py-3 px-4 text-center">
                        <CurrencyDisplay value={source.deFpc} className="text-sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-semibold">
                    <td className="py-3 px-4 text-center">Total</td>
                    <td className="py-3 px-4 text-center">
                      <CurrencyDisplay value={338000} className="text-sm font-semibold" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CurrencyDisplay value={1943} className="text-sm font-semibold" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CurrencyDisplay value={0.065} className="text-sm font-semibold" />
                    </td>
                    <td className="py-3 px-4 text-center">175</td>
                    <td className="py-3 px-4 text-center">
                      <CurrencyDisplay value={5240000} className="text-sm font-semibold" />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
