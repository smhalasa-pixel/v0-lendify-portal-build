'use client'

import * as React from 'react'
import {
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Target,
  Users,
  CheckCircle,
  Percent,
  ArrowRightLeft,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { KPICard } from '@/components/dashboard/kpi-card'
import { VolumeChart } from '@/components/dashboard/volume-chart'
import { PipelineChart } from '@/components/dashboard/pipeline-chart'
import { PipelineTable } from '@/components/dashboard/pipeline-table'
import { AnnouncementsList } from '@/components/dashboard/announcements-list'
import { TeamPerformanceTable } from '@/components/dashboard/team-performance-table'

export default function DashboardPage() {
  const { user } = useAuth()

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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {dashboardTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dashboardDescription}</p>
      </div>

      {/* Enrolled Metrics Section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Enrolled</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            title="Debt Load"
            value={metrics.debtLoadEnrolled}
            change={metrics.debtLoadEnrolledChange}
            format="currency"
            icon={<DollarSign className="size-3.5" />}
            color="purple"
          />
          <KPICard
            title="Units"
            value={metrics.unitsEnrolled}
            change={metrics.unitsEnrolledChange}
            format="number"
            icon={<FileText className="size-3.5" />}
            color="blue"
          />
          <KPICard
            title="Commission"
            value={metrics.totalCommissions}
            change={metrics.commissionsChange}
            format="currency"
            icon={<TrendingUp className="size-3.5" />}
            color="emerald"
          />
          <KPICard
            title="Clawbacks"
            value={metrics.totalClawbacks}
            change={metrics.clawbacksChange}
            format="currency"
            icon={<TrendingDown className="size-3.5" />}
            color="rose"
          />
        </div>
      </section>

      {/* Submitted Metrics Section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Submitted</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            title="Debt Load"
            value={metrics.debtLoadSubmitted}
            change={metrics.debtLoadSubmittedChange}
            format="currency"
            icon={<Briefcase className="size-3.5" />}
            color="purple"
          />
          <KPICard
            title="Units"
            value={metrics.unitsSubmitted}
            change={metrics.unitsSubmittedChange}
            format="number"
            icon={<Target className="size-3.5" />}
            color="blue"
          />
          <KPICard
            title="Conversion Rate"
            value={metrics.conversionRate}
            change={metrics.conversionRateChange}
            format="percentage"
            icon={<Percent className="size-3.5" />}
            color="amber"
          />
          <KPICard
            title="Qualified Conv."
            value={metrics.qualifiedConversionRate}
            change={metrics.qualifiedConversionRateChange}
            format="percentage"
            icon={<ArrowRightLeft className="size-3.5" />}
            color="emerald"
          />
        </div>
      </section>

      {/* FPC Metrics Section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">First Payment Cleared</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            title="Debt Load FPC"
            value={metrics.debtLoadFPC}
            change={metrics.debtLoadFPCChange}
            format="currency"
            icon={<CheckCircle className="size-3.5" />}
            color="emerald"
          />
          <KPICard
            title="Units FPC"
            value={metrics.unitsFPC}
            change={metrics.unitsFPCChange}
            format="number"
            icon={<CheckCircle className="size-3.5" />}
            color="blue"
          />
          {(isLeadership || isExecutive) && (
            <>
              <KPICard
                title="Avg Debt Size"
                value={metrics.avgLoanSize}
                change={metrics.avgLoanSizeChange}
                format="currency"
                icon={<Target className="size-3.5" />}
                color="purple"
              />
              <KPICard
                title="Closing Rate"
                value={metrics.closingRate}
                change={metrics.closingRateChange}
                format="percentage"
                icon={<Users className="size-3.5" />}
                color="amber"
              />
            </>
          )}
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VolumeChart data={volumeData} />
        </div>
        <div className="lg:col-span-1">
          <PipelineChart data={pipeline} />
        </div>
      </div>

      {/* Tables and Lists Row */}
      <div className="grid lg:grid-cols-3 gap-4">
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
