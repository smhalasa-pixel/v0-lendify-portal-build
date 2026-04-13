'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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

  // Show tooltip for currency values >= 1000 OR for percentages with numerator/denominator
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
  const isExecutive = user?.role === 'executive'

  const metrics = React.useMemo(() => {
    if (isAgent && user) return dataService.getDashboardMetrics(user.id)
    if (isLeadership && user?.teamId) return dataService.getDashboardMetrics(undefined, user.teamId)
    return dataService.getDashboardMetrics()
  }, [user, isAgent, isLeadership])

  const pipeline = React.useMemo(() => {
    if (isAgent && user) return dataService.getPipeline(user.id)
    return dataService.getPipeline()
  }, [user, isAgent])

  const volumeData = React.useMemo(() => dataService.getVolumeChartData(30), [])
  const announcements = React.useMemo(() => dataService.getAnnouncements(), [])
  const teamMetrics = React.useMemo(() => {
    if (isLeadership || isExecutive) return dataService.getTeamMetrics()
    return []
  }, [isLeadership, isExecutive])

  const dashboardTitle = isAgent ? 'My Dashboard' : isLeadership ? `${user?.teamName || 'Team'} Dashboard` : 'Executive Dashboard'

  // Date slicer states for each section
  const [enrollmentDate, setEnrollmentDate] = React.useState('30d')
  const [conversionDate, setConversionDate] = React.useState('30d')
  const [submissionDate, setSubmissionDate] = React.useState('30d')
  const [commissionDate, setCommissionDate] = React.useState('30d')
  
  // Custom date range state
  const [customRange, setCustomRange] = React.useState<{ from?: Date; to?: Date }>({})
  const [calendarOpen, setCalendarOpen] = React.useState<string | null>(null)

  // Date preset options
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

  // Reusable date selector component
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

  // Progress calculations
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const expectedProgress = (now.getDate() / daysInMonth) * 100
  const unitsProgress = Math.min((metrics.unitsEnrolled / metrics.monthlyTargetUnits) * 100, 100)
  const debtProgress = Math.min((metrics.debtLoadEnrolled / metrics.monthlyTargetDebtLoad) * 100, 100)
  const unitsBehind = unitsProgress < (expectedProgress - 20) && unitsProgress < 100
  const debtBehind = debtProgress < (expectedProgress - 20) && debtProgress < 100
  const isPIPRisk = unitsBehind || debtBehind

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
    return `$${val.toLocaleString()}`
  }

  return (
    <div className="p-4 lg:p-5 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{dashboardTitle}</h1>
        <span className="text-xs text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
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
          
          {/* Monthly Targets */}
          <Card className={cn("glass-card border-border/40", isPIPRisk && "border-rose-500/30")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Target className="size-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Monthly Targets</span>
                </div>
                {isPIPRisk && (
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 gap-0.5 bg-rose-500/20 text-rose-400 border-rose-500/30">
                    <AlertTriangle className="size-2.5" />
                    PIP
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {/* Units */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className={cn("text-muted-foreground", unitsBehind && "text-rose-400")}>
                      Units {unitsBehind && <AlertTriangle className="inline size-2.5 ml-0.5" />}
                    </span>
                    <span className="font-medium">{metrics.unitsEnrolled} / {metrics.monthlyTargetUnits}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 w-px bg-muted-foreground/50 z-10" style={{ left: `${expectedProgress}%` }} />
                    <Progress value={unitsProgress} className={cn("h-1.5", unitsBehind && "[&>div]:bg-rose-500")} />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>{unitsProgress.toFixed(0)}%</span>
                    <span>{metrics.monthlyTargetUnits - metrics.unitsEnrolled} left</span>
                  </div>
                </div>
                {/* Debt Load */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className={cn("text-muted-foreground", debtBehind && "text-rose-400")}>
                      Debt Load {debtBehind && <AlertTriangle className="inline size-2.5 ml-0.5" />}
                    </span>
                    <span className="font-medium">{formatCurrency(metrics.debtLoadEnrolled)} / {formatCurrency(metrics.monthlyTargetDebtLoad)}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 w-px bg-muted-foreground/50 z-10" style={{ left: `${expectedProgress}%` }} />
                    <Progress value={debtProgress} className={cn("h-1.5", debtBehind && "[&>div]:bg-rose-500")} />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>{debtProgress.toFixed(0)}%</span>
                    <span>{formatCurrency(metrics.monthlyTargetDebtLoad - metrics.debtLoadEnrolled)} left</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Search */}
          <ClientSearch data={pipeline} />

          {/* Announcements */}
          <AnnouncementsList announcements={announcements} userId={user?.id} limit={3} />
        </div>
      </div>

      {/* Cleared Payments & Commissions */}
      <Card className="glass-card border-border/40">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cleared Payments & Commissions</span>
            <DateSelector value={commissionDate} onChange={setCommissionDate} id="commission" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            <Metric label="FPC Units" value={metrics.unitsFPC} change={metrics.unitsFPCChange} />
            <Metric label="FPC Debt" value={metrics.debtLoadFPC} change={metrics.debtLoadFPCChange} format="currency" />
            <Metric label="Commission" value={metrics.totalCommissions} format="currency" />
            <Metric label="Clawbacks" value={metrics.totalClawbacks} format="currency" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tier</span>
              <span className="text-base font-semibold text-amber-400">T{metrics.currentTier}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Exp. Comm</span>
              <span className="text-base font-semibold text-purple-400">{formatCurrency(metrics.expectedCommission)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Exp. Tier</span>
              <span className="text-base font-semibold text-blue-400">T{metrics.expectedTier}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      {(isLeadership || isExecutive) && teamMetrics.length > 0 && (
        <TeamPerformanceTable data={teamMetrics} />
      )}
    </div>
  )
}
