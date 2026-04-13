'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, TrendingUp, TrendingDown, AlertTriangle, Target, Users, User, Filter, Search, ChevronDown, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { VolumeChart } from '@/components/dashboard/volume-chart'
import { ClientSearch } from '@/components/dashboard/client-search'
import { AnnouncementsList } from '@/components/dashboard/announcements-list'
import { TeamPerformanceTable } from '@/components/dashboard/team-performance-table'
import { AgentPerformanceTable } from '@/components/dashboard/agent-performance-table'
import { cn } from '@/lib/utils'

// Compact metric display with hover tooltip for full value
function Metric({ 
  label, 
  value, 
  change, 
  format: fmt = 'number',
  numerator,
  denominator,
}: { 
  label: string
  value: number
  change?: number
  format?: 'currency' | 'number' | 'percentage'
  numerator?: number
  denominator?: number
}) {
  const formatted = React.useMemo(() => {
    if (fmt === 'currency') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toLocaleString()}`
    }
    if (fmt === 'percentage') return `${value.toFixed(1)}%`
    return value.toLocaleString()
  }, [value, fmt])

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

  // Filter state: 'overall' | 'team-lead' | 'supervisor'
  const [filterType, setFilterType] = React.useState<'overall' | 'team-lead' | 'supervisor'>('overall')
  const [selectedTeamLead, setSelectedTeamLead] = React.useState<string>('all')
  const [selectedSupervisor, setSelectedSupervisor] = React.useState<string>('all')
  
  // View toggle for tables: 'teams' or 'agents'
  const [tableView, setTableView] = React.useState<'teams' | 'agents'>('teams')
  
  // Selected specific team or agent from dropdown
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null)
  
  // Search terms for dropdowns
  const [teamSearchTerm, setTeamSearchTerm] = React.useState('')
  const [agentSearchTerm, setAgentSearchTerm] = React.useState('')
  
  // Popover open states
  const [teamsPopoverOpen, setTeamsPopoverOpen] = React.useState(false)
  const [agentsPopoverOpen, setAgentsPopoverOpen] = React.useState(false)
  
  // Month selector for Monthly Targets
  const [selectedTargetMonth, setSelectedTargetMonth] = React.useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  // Get all agents for the agent dropdown - filtered based on current filter selection
  const allAgents = React.useMemo(() => dataService.getAgents(), [])
  
  // Filtered agents list based on current filter type selection
  const filteredAgentsForDropdown = React.useMemo(() => {
    const agents = dataService.getAgents()
    
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') {
        // Show agents from all team lead teams
        const teamLeadTeamIds = teamLeads.map(l => l.teamId).filter(Boolean) as string[]
        return agents.filter(a => teamLeadTeamIds.includes(a.teamId || ''))
      }
      const lead = teamLeads.find(l => l.id === selectedTeamLead)
      if (lead?.teamId) {
        return agents.filter(a => a.teamId === lead.teamId)
      }
    }
    
    if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') {
        // Show agents from all supervisor teams
        const supervisorTeamIds = new Set<string>()
        supervisors.forEach(s => s.teamIds?.forEach(id => supervisorTeamIds.add(id)))
        return agents.filter(a => supervisorTeamIds.has(a.teamId || ''))
      }
      const supervisor = supervisors.find(s => s.id === selectedSupervisor)
      if (supervisor?.teamIds) {
        return agents.filter(a => supervisor.teamIds!.includes(a.teamId || ''))
      }
    }
    
    // Default: return all agents
    return agents
  }, [filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors])
  
  // Filtered teams list based on current filter type selection
  const filteredTeamsForDropdown = React.useMemo(() => {
    const allTeams = dataService.getTeamMetrics()
    
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') {
        const teamLeadTeamIds = teamLeads.map(l => l.teamId).filter(Boolean) as string[]
        return allTeams.filter(t => teamLeadTeamIds.includes(t.teamId))
      }
      const lead = teamLeads.find(l => l.id === selectedTeamLead)
      if (lead?.teamId) {
        return allTeams.filter(t => t.teamId === lead.teamId)
      }
    }
    
    if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') {
        const supervisorTeamIds = new Set<string>()
        supervisors.forEach(s => s.teamIds?.forEach(id => supervisorTeamIds.add(id)))
        return allTeams.filter(t => supervisorTeamIds.has(t.teamId))
      }
      const supervisor = supervisors.find(s => s.id === selectedSupervisor)
      if (supervisor?.teamIds) {
        return allTeams.filter(t => supervisor.teamIds!.includes(t.teamId))
      }
    }
    
    return allTeams
  }, [filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors])

  // Get filtered metrics based on filter selection AND dropdown selections
  const metrics = React.useMemo(() => {
    // Agent always sees their own metrics
    if (isAgent && user) return dataService.getDashboardMetrics(user.id)
    
    // If a specific agent is selected from the Agents dropdown, show that agent's metrics
    if (selectedAgentId) {
      return dataService.getDashboardMetrics(selectedAgentId)
    }
    
    // If a specific team is selected from the Teams dropdown, show that team's metrics
    if (selectedTeamId) {
      return dataService.getDashboardMetrics(undefined, selectedTeamId)
    }
    
    // For other roles, apply main filter
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') {
        // All team leads = all teams
        return dataService.getDashboardMetrics()
      }
      const lead = teamLeads.find(l => l.id === selectedTeamLead)
      if (lead?.teamId) {
        return dataService.getDashboardMetrics(undefined, lead.teamId)
      }
    }
    
    if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') {
        return dataService.getDashboardMetrics()
      }
      const supervisor = supervisors.find(s => s.id === selectedSupervisor)
      // For supervisor, we'd aggregate their teams - for now show global
      return dataService.getDashboardMetrics()
    }
    
    // Default: leadership sees their team, others see global
    if (isLeadership && user?.teamId) return dataService.getDashboardMetrics(undefined, user.teamId)
    return dataService.getDashboardMetrics()
  }, [user, isAgent, isLeadership, filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors, selectedTeamId, selectedAgentId])

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
  
  // Team metrics - filtered by selection
  const teamMetrics = React.useMemo(() => {
    const allTeams = dataService.getTeamMetrics()
    
    // If a specific team is selected from dropdown, filter to that team only
    if (selectedTeamId) {
      return allTeams.filter(t => t.teamId === selectedTeamId)
    }
    
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') {
        return allTeams
      }
      const lead = teamLeads.find(l => l.id === selectedTeamLead)
      if (lead?.teamId) {
        return allTeams.filter(t => t.teamId === lead.teamId)
      }
    }
    
    if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') {
        return allTeams
      }
      const supervisor = supervisors.find(s => s.id === selectedSupervisor)
      if (supervisor?.teamIds) {
        return allTeams.filter(t => supervisor.teamIds!.includes(t.teamId))
      }
    }
    
    // Default behavior by role
    if (isLeadership && user?.teamId) {
      return allTeams.filter(t => t.teamId === user.teamId)
    }
    if (isSupervisor && user?.teamIds) {
      return allTeams.filter(t => user.teamIds!.includes(t.teamId))
    }
    
    return allTeams
  }, [filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors, isLeadership, isSupervisor, user?.teamId, user?.teamIds, selectedTeamId])
  
  // Agent performance - filtered by selection
  const agentPerformance = React.useMemo(() => {
    let agents = [] as ReturnType<typeof dataService.getAgentPerformanceByTeams>
    
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') {
        const teamLeadTeamIds = teamLeads.map(l => l.teamId).filter(Boolean) as string[]
        agents = dataService.getAgentPerformanceByTeams(teamLeadTeamIds.length > 0 ? teamLeadTeamIds : allTeamIds)
      } else {
        const lead = teamLeads.find(l => l.id === selectedTeamLead)
        if (lead?.teamId) {
          agents = dataService.getAgentPerformanceByTeam(lead.teamId)
        }
      }
    } else if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') {
        const supervisorTeamIds = new Set<string>()
        supervisors.forEach(s => s.teamIds?.forEach(id => supervisorTeamIds.add(id)))
        agents = dataService.getAgentPerformanceByTeams(supervisorTeamIds.size > 0 ? Array.from(supervisorTeamIds) : allTeamIds)
      } else {
        const supervisor = supervisors.find(s => s.id === selectedSupervisor)
        if (supervisor?.teamIds) {
          agents = dataService.getAgentPerformanceByTeams(supervisor.teamIds)
        }
      }
    } else {
      // Default behavior by role
      if (isLeadership && user?.teamId) {
        agents = dataService.getAgentPerformanceByTeam(user.teamId)
      } else if (isSupervisor && user?.teamIds && user.teamIds.length > 0) {
        agents = dataService.getAgentPerformanceByTeams(user.teamIds)
} else if (hasExecutiveView) {
    agents = dataService.getAgentPerformanceByTeams(allTeamIds)
      }
    }
    
    // If a specific agent is selected from dropdown, filter to that agent only
    if (selectedAgentId) {
      return agents.filter(a => a.agentId === selectedAgentId)
    }
    
    return agents
  }, [filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors, allTeamIds, isLeadership, isSupervisor, hasExecutiveView, user?.teamId, user?.teamIds, selectedAgentId])

  // Dashboard title based on filter AND dropdown selections
  const dashboardTitle = React.useMemo(() => {
    if (isAgent) return 'My Dashboard'
    
    // If specific agent is selected from dropdown
    if (selectedAgentId) {
      const agent = allAgents.find(a => a.id === selectedAgentId)
      return agent ? `${agent.name}'s Dashboard` : 'Agent Dashboard'
    }
    
    // If specific team is selected from dropdown
    if (selectedTeamId) {
      const allTeams = dataService.getTeamMetrics()
      const team = allTeams.find(t => t.teamId === selectedTeamId)
      return team ? `${team.teamName} Dashboard` : 'Team Dashboard'
    }
    
    if (filterType === 'team-lead') {
      if (selectedTeamLead === 'all') return 'All Team Leads'
      const lead = teamLeads.find(l => l.id === selectedTeamLead)
      return lead ? `${lead.name}'s Team` : 'Team Lead Dashboard'
    }
    
    if (filterType === 'supervisor') {
      if (selectedSupervisor === 'all') return 'All Supervisors'
      const supervisor = supervisors.find(s => s.id === selectedSupervisor)
      return supervisor ? `${supervisor.name}'s Teams` : 'Supervisor Dashboard'
    }
    
    if (isLeadership) return `${user?.teamName || 'Team'} Dashboard`
    if (isSupervisor) return 'Supervisor Dashboard'
    if (isAdmin) return 'Admin Dashboard'
    return 'Executive Dashboard'
  }, [isAgent, isLeadership, isSupervisor, isAdmin, filterType, selectedTeamLead, selectedSupervisor, teamLeads, supervisors, user?.teamName, selectedAgentId, selectedTeamId, allAgents])

  // Date slicer states
  const [enrollmentDate, setEnrollmentDate] = React.useState('30d')
  const [conversionDate, setConversionDate] = React.useState('30d')
  const [submissionDate, setSubmissionDate] = React.useState('30d')
  
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
  const now = new Date()
  const selectedYearNum = parseInt(selectedYear)
  const selectedMonthNum = parseInt(selectedMonth)
  const isCurrentMonth = selectedYearNum === now.getFullYear() && selectedMonthNum === now.getMonth() + 1
  const daysInSelectedMonth = new Date(selectedYearNum, selectedMonthNum, 0).getDate()
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInSelectedMonth // For past months, show full month
  const expectedProgress = isCurrentMonth ? (dayOfMonth / daysInSelectedMonth) * 100 : 100
  
  const unitsProgress = Math.min((monthlyTargetMetrics.unitsEnrolled / monthlyTargetMetrics.monthlyTargetUnits) * 100, 100)
  const debtProgress = Math.min((monthlyTargetMetrics.debtLoadEnrolled / monthlyTargetMetrics.monthlyTargetDebtLoad) * 100, 100)
  const unitsBehind = unitsProgress < (expectedProgress - 20) && unitsProgress < 100
  const debtBehind = debtProgress < (expectedProgress - 20) && debtProgress < 100
  const isPIPRisk = unitsBehind || debtBehind

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
    return `$${val.toLocaleString()}`
  }

  // Reset sub-filter when main filter changes
  React.useEffect(() => {
    setSelectedTeamLead('all')
    setSelectedSupervisor('all')
    setSelectedTeamId(null)
    setSelectedAgentId(null)
  }, [filterType])
  
  // Reset team/agent dropdown selections when sub-filter changes
  React.useEffect(() => {
    setSelectedTeamId(null)
    setSelectedAgentId(null)
  }, [selectedTeamLead, selectedSupervisor])
  
  // When selecting a specific team, clear agent selection (and vice versa)
  React.useEffect(() => {
    if (selectedTeamId) {
      setSelectedAgentId(null)
    }
  }, [selectedTeamId])
  
  React.useEffect(() => {
    if (selectedAgentId) {
      setSelectedTeamId(null)
    }
  }, [selectedAgentId])

  return (
    <div className="p-4 lg:p-5 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">{dashboardTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Data Filter Slicer - Available to all roles except Agent */}
          {!isAgent && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1.5">
              <Filter className="size-3.5 text-muted-foreground ml-1" />
              
              {/* Filter Type */}
              <Select value={filterType} onValueChange={(val) => setFilterType(val as 'overall' | 'team-lead' | 'supervisor')}>
                <SelectTrigger className="h-7 text-xs w-auto min-w-[100px] bg-background border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="team-lead">Per Team Lead</SelectItem>
                  <SelectItem value="supervisor">Per Supervisor</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Team Lead Sub-filter */}
              {filterType === 'team-lead' && (
                <Select value={selectedTeamLead} onValueChange={setSelectedTeamLead}>
                  <SelectTrigger className="h-7 text-xs w-auto min-w-[130px] bg-background border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Leads</SelectItem>
                    {teamLeads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Supervisor Sub-filter */}
              {filterType === 'supervisor' && (
                <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
                  <SelectTrigger className="h-7 text-xs w-auto min-w-[130px] bg-background border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Supervisors</SelectItem>
                    {supervisors.map(sup => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          
          {/* View Toggle for tables (Teams/Agents) with searchable dropdowns - not for agents */}
          {!isAgent && (
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              {/* Teams Dropdown */}
              <Popover open={teamsPopoverOpen} onOpenChange={setTeamsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => {
                      setTableView('teams')
                      setTeamsPopoverOpen(true)
                    }}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      tableView === 'teams' 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="size-3" />
                    {selectedTeamId 
                      ? teamMetrics.find(t => t.teamId === selectedTeamId)?.teamName || 'Teams'
                      : 'Teams'}
                    <ChevronDown className="size-3 ml-0.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search teams..."
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      <button
                        onClick={() => {
                          setSelectedTeamId(null)
                          setTeamsPopoverOpen(false)
                          setTeamSearchTerm('')
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                          !selectedTeamId && "bg-primary/10 text-primary"
                        )}
                      >
                        <span>All Teams</span>
                        {!selectedTeamId && <Check className="size-3" />}
                      </button>
                      {filteredTeamsForDropdown
                        .filter(team => team.teamName.toLowerCase().includes(teamSearchTerm.toLowerCase()))
                        .map(team => (
                          <button
                            key={team.teamId}
                            onClick={() => {
                              setSelectedTeamId(team.teamId)
                              setTeamsPopoverOpen(false)
                              setTeamSearchTerm('')
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedTeamId === team.teamId && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>{team.teamName}</span>
                            {selectedTeamId === team.teamId && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Agents Dropdown */}
              <Popover open={agentsPopoverOpen} onOpenChange={setAgentsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => {
                      setTableView('agents')
                      setAgentsPopoverOpen(true)
                    }}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                      tableView === 'agents' 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <User className="size-3" />
                    {selectedAgentId 
                      ? allAgents.find(a => a.id === selectedAgentId)?.name || 'Agents'
                      : 'Agents'}
                    <ChevronDown className="size-3 ml-0.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search agents..."
                        value={agentSearchTerm}
                        onChange={(e) => setAgentSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      <button
                        onClick={() => {
                          setSelectedAgentId(null)
                          setAgentsPopoverOpen(false)
                          setAgentSearchTerm('')
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                          !selectedAgentId && "bg-primary/10 text-primary"
                        )}
                      >
                        <span>All Agents</span>
                        {!selectedAgentId && <Check className="size-3" />}
                      </button>
                      {filteredAgentsForDropdown
                        .filter(agent => agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()))
                        .map(agent => (
                          <button
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgentId(agent.id)
                              setAgentsPopoverOpen(false)
                              setAgentSearchTerm('')
                            }}
                            className={cn(
                              "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-muted flex items-center justify-between",
                              selectedAgentId === agent.id && "bg-primary/10 text-primary"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span>{agent.name}</span>
                              <span className="text-muted-foreground text-[10px]">{agent.teamName}</span>
                            </div>
                            {selectedAgentId === agent.id && <Check className="size-3" />}
                          </button>
                        ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <span className="text-xs text-muted-foreground hidden sm:block">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-3">
          
          {/* Row 1: Submissions + Conversion */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="glass-card border-border/40">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Submissions</span>
                  <DateSelector value={submissionDate} onChange={setSubmissionDate} id="submission" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Metric label="Units" value={metrics.unitsSubmitted} change={metrics.unitsSubmittedChange} />
                  <Metric label="Debt Load" value={metrics.debtLoadSubmitted} change={metrics.debtLoadSubmittedChange} format="currency" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/40">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Conversion</span>
                  <DateSelector value={conversionDate} onChange={setConversionDate} id="conversion" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Metric 
                    label="Conv. Rate" 
                    value={metrics.conversionRate} 
                    change={metrics.conversionRateChange} 
                    format="percentage" 
                    numerator={metrics.conversionClosed}
                    denominator={metrics.conversionAssigned}
                  />
                  <Metric 
                    label="Qualified Conv." 
                    value={metrics.qualifiedConversionRate} 
                    change={metrics.qualifiedConversionRateChange} 
                    format="percentage"
                    numerator={metrics.qualifiedClosed}
                    denominator={metrics.qualifiedAssigned}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Enrollments */}
          <Card className="glass-card border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Enrollments</span>
                <DateSelector value={enrollmentDate} onChange={setEnrollmentDate} id="enrollment" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Units" value={metrics.unitsEnrolled} change={metrics.unitsEnrolledChange} />
                <Metric label="Debt Load" value={metrics.debtLoadEnrolled} change={metrics.debtLoadEnrolledChange} format="currency" />
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <VolumeChart data={volumeData} />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          
          {/* Monthly Targets - Featured Card */}
          <Card className={cn(
            "relative overflow-hidden border-2",
            isPIPRisk 
              ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/5" 
              : "border-primary/40 bg-gradient-to-br from-primary/10 via-background to-primary/5"
          )}>
            {/* Glow effect */}
            <div className={cn(
              "absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-20",
              isPIPRisk ? "bg-amber-500" : "bg-primary"
            )} />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center",
                    isPIPRisk ? "bg-amber-500/20" : "bg-primary/20"
                  )}>
                    <Target className={cn("size-4", isPIPRisk ? "text-amber-400" : "text-primary")} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Monthly Targets</span>
                    <p className="text-[10px] text-muted-foreground">Track your progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPIPRisk && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 gap-1 bg-amber-500/10 text-amber-400 border-amber-500/30">
                      <AlertTriangle className="size-3" />
                      Behind
                    </Badge>
                  )}
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
                    <span className={cn("text-xs font-medium", unitsBehind ? "text-amber-400" : "text-muted-foreground")}>
                      Units Enrolled {unitsBehind && <AlertTriangle className="inline size-3 ml-1" />}
                    </span>
                    <span className="text-sm font-bold text-foreground">{monthlyTargetMetrics.unitsEnrolled} <span className="text-muted-foreground font-normal">/ {monthlyTargetMetrics.monthlyTargetUnits}</span></span>
                  </div>
                  <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10 rounded-full" style={{ left: `${expectedProgress}%` }} />
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        unitsBehind ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-primary to-primary/70"
                      )} 
                      style={{ width: `${unitsProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={cn("font-semibold", unitsBehind ? "text-amber-400" : "text-primary")}>{unitsProgress.toFixed(0)}% complete</span>
                    <span className="text-muted-foreground">{Math.max(0, monthlyTargetMetrics.monthlyTargetUnits - monthlyTargetMetrics.unitsEnrolled)} remaining</span>
                  </div>
                </div>
                {/* Debt Load */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={cn("text-xs font-medium", debtBehind ? "text-amber-400" : "text-muted-foreground")}>
                      Debt Load {debtBehind && <AlertTriangle className="inline size-3 ml-1" />}
                    </span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(monthlyTargetMetrics.debtLoadEnrolled)} <span className="text-muted-foreground font-normal">/ {formatCurrency(monthlyTargetMetrics.monthlyTargetDebtLoad)}</span></span>
                  </div>
                  <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10 rounded-full" style={{ left: `${expectedProgress}%` }} />
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        debtBehind ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      )} 
                      style={{ width: `${debtProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={cn("font-semibold", debtBehind ? "text-amber-400" : "text-emerald-400")}>{debtProgress.toFixed(0)}% complete</span>
                    <span className="text-muted-foreground">{formatCurrency(Math.max(0, monthlyTargetMetrics.monthlyTargetDebtLoad - monthlyTargetMetrics.debtLoadEnrolled))} remaining</span>
                  </div>
                </div>
                {/* Expected Progress Indicator */}
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">
                      {isCurrentMonth ? 'Expected progress for today' : 'Month completed'}
                    </span>
                    <span className="font-semibold text-foreground">{expectedProgress.toFixed(0)}%</span>
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
        <>
          {tableView === 'teams' && teamMetrics.length > 0 && (
            <TeamPerformanceTable 
              data={teamMetrics} 
              title={filterType === 'overall' ? 'All Teams' : 
                     filterType === 'team-lead' ? (selectedTeamLead === 'all' ? 'All Teams' : `${teamLeads.find(l => l.id === selectedTeamLead)?.teamName || 'Team'}`) :
                     filterType === 'supervisor' ? (selectedSupervisor === 'all' ? 'All Teams' : `${supervisors.find(s => s.id === selectedSupervisor)?.name}'s Teams`) :
                     'Teams'}
              description={`Performance metrics for ${teamMetrics.length} team${teamMetrics.length !== 1 ? 's' : ''}`}
              highlightTeamId={user?.teamId}
            />
          )}
          
          {tableView === 'agents' && agentPerformance.length > 0 && (
            <AgentPerformanceTable 
              data={agentPerformance}
              title={filterType === 'overall' ? 'All Agents' : 
                     filterType === 'team-lead' ? (selectedTeamLead === 'all' ? 'All Agents' : `${teamLeads.find(l => l.id === selectedTeamLead)?.teamName || 'Team'} Agents`) :
                     filterType === 'supervisor' ? (selectedSupervisor === 'all' ? 'All Agents' : `${supervisors.find(s => s.id === selectedSupervisor)?.name}'s Agents`) :
                     'Agents'}
              description={`Individual performance for ${agentPerformance.length} agent${agentPerformance.length !== 1 ? 's' : ''}`}
            />
          )}
        </>
      )}
    </div>
  )
}
