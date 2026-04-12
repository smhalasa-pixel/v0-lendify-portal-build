'use client'

import * as React from 'react'
import {
  DollarSign,
  FileText,
  TrendingUp,
  Briefcase,
  Target,
  Users,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { KPICard } from '@/components/dashboard/kpi-card'
import { VolumeChart } from '@/components/dashboard/volume-chart'
import { PipelineChart } from '@/components/dashboard/pipeline-chart'
import { PipelineTable } from '@/components/dashboard/pipeline-table'
import { AnnouncementsList } from '@/components/dashboard/announcements-list'
import { TeamPerformanceTable } from '@/components/dashboard/team-performance-table'
import { DateRangePicker } from '@/components/date-range-picker'

export default function DashboardPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Determine which data to fetch based on role
  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isExecutive = user?.role === 'executive'

  // Get metrics based on role
  const metrics = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getDashboardMetrics(user.id)
    }
    if (isLeadership && user?.teamId) {
      return dataService.getDashboardMetrics(undefined, user.teamId)
    }
    return dataService.getDashboardMetrics()
  }, [user, isAgent, isLeadership])

  // Get pipeline data
  const pipeline = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getPipeline(user.id)
    }
    return dataService.getPipeline()
  }, [user, isAgent])

  // Get chart data
  const volumeData = React.useMemo(() => dataService.getVolumeChartData(30), [])

  // Get announcements
  const announcements = React.useMemo(() => dataService.getAnnouncements(), [])

  // Get team metrics for leadership/executive
  const teamMetrics = React.useMemo(() => {
    if (isLeadership || isExecutive) {
      return dataService.getTeamMetrics()
    }
    return []
  }, [isLeadership, isExecutive])

  const dashboardTitle = React.useMemo(() => {
    if (isAgent) return 'My Dashboard'
    if (isLeadership) return `${user?.teamName || 'Team'} Dashboard`
    return 'Executive Dashboard'
  }, [isAgent, isLeadership, user?.teamName])

  const dashboardDescription = React.useMemo(() => {
    if (isAgent) return 'Your personal performance metrics and pipeline'
    if (isLeadership) return 'Team performance overview and metrics'
    return 'Organization-wide performance and insights'
  }, [isAgent, isLeadership])

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            {dashboardTitle}
          </h1>
          <p className="text-muted-foreground mt-1">{dashboardDescription}</p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* KPI Cards - Row 1: Enrolled */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Debt Load Enrolled"
          value={metrics.debtLoadEnrolled}
          change={metrics.debtLoadEnrolledChange}
          format="currency"
          icon={<DollarSign className="size-4" />}
        />
        <KPICard
          title="Units Enrolled"
          value={metrics.unitsEnrolled}
          change={metrics.unitsEnrolledChange}
          format="number"
          icon={<FileText className="size-4" />}
        />
        <KPICard
          title="Commission"
          value={metrics.totalCommissions}
          change={metrics.commissionsChange}
          format="currency"
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* KPI Cards - Row 2: Submitted & Clawbacks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Debt Load Submitted"
          value={metrics.debtLoadSubmitted}
          change={metrics.debtLoadSubmittedChange}
          format="currency"
          icon={<Briefcase className="size-4" />}
        />
        <KPICard
          title="Units Submitted"
          value={metrics.unitsSubmitted}
          change={metrics.unitsSubmittedChange}
          format="number"
          icon={<Target className="size-4" />}
        />
        <KPICard
          title="Clawbacks"
          value={metrics.totalClawbacks}
          change={metrics.clawbacksChange}
          format="currency"
          icon={<Users className="size-4" />}
        />
      </div>

      {/* Additional KPIs for non-agents */}
      {(isLeadership || isExecutive) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPICard
            title="Average Loan Size"
            value={metrics.avgLoanSize}
            change={metrics.avgLoanSizeChange}
            format="currency"
            icon={<Target className="size-4" />}
          />
          <KPICard
            title="Closing Rate"
            value={metrics.closingRate}
            change={metrics.closingRateChange}
            format="percentage"
            icon={<Users className="size-4" />}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart data={volumeData} />
        </div>
        <div className="lg:col-span-1">
          <PipelineChart data={pipeline} />
        </div>
      </div>

      {/* Tables and Lists Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineTable
            data={pipeline}
            showAgent={!isAgent}
          />
        </div>
        <div className="lg:col-span-1">
          <AnnouncementsList
            announcements={announcements}
            userId={user?.id}
            limit={4}
          />
        </div>
      </div>

      {/* Team Performance for Leadership/Executive */}
      {(isLeadership || isExecutive) && teamMetrics.length > 0 && (
        <TeamPerformanceTable data={teamMetrics} />
      )}
    </div>
  )
}
