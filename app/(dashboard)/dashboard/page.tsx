'use client'

import * as React from 'react'
import {
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Target,
  CheckCircle,
  Percent,
  ArrowRightLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { VolumeChart } from '@/components/dashboard/volume-chart'
import { ClientSearch } from '@/components/dashboard/client-search'
import { AnnouncementsList } from '@/components/dashboard/announcements-list'
import { TeamPerformanceTable } from '@/components/dashboard/team-performance-table'

export default function DashboardPage() {
  const { user } = useAuth()

  const isAgent = user?.role === 'agent'
  const isLeadership = user?.role === 'leadership'
  const isExecutive = user?.role === 'executive'

  const metrics = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getDashboardMetrics(user.id)
    }
    if (isLeadership && user?.teamId) {
      return dataService.getDashboardMetrics(undefined, user.teamId)
    }
    return dataService.getDashboardMetrics()
  }, [user, isAgent, isLeadership])

  const pipeline = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getPipeline(user.id)
    }
    return dataService.getPipeline()
  }, [user, isAgent])

  const volumeData = React.useMemo(() => dataService.getVolumeChartData(30), [])
  const announcements = React.useMemo(() => dataService.getAnnouncements(), [])

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

  // Format tier display
  const tierLabels = ['Bronze', 'Silver', 'Gold']

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {dashboardTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{dashboardDescription}</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-4">
        
        {/* Left Column - KPIs */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* ENROLLMENTS Section */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <KPICard
                  title="Units Enrolled"
                  value={metrics.unitsEnrolled}
                  change={metrics.unitsEnrolledChange}
                  format="number"
                  icon={<FileText className="size-3" />}
                  color="blue"
                  compact
                />
                <KPICard
                  title="Debt Load Enrolled"
                  value={metrics.debtLoadEnrolled}
                  change={metrics.debtLoadEnrolledChange}
                  format="currency"
                  icon={<DollarSign className="size-3" />}
                  color="purple"
                  compact
                />
              </div>
            </CardContent>
          </Card>

          {/* CONVERSION Section */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <KPICard
                  title="Conversion Rate"
                  value={metrics.conversionRate}
                  change={metrics.conversionRateChange}
                  format="percentage"
                  icon={<Percent className="size-3" />}
                  color="amber"
                  compact
                />
                <KPICard
                  title="Qualified Conversion"
                  value={metrics.qualifiedConversionRate}
                  change={metrics.qualifiedConversionRateChange}
                  format="percentage"
                  icon={<ArrowRightLeft className="size-3" />}
                  color="emerald"
                  compact
                />
              </div>
            </CardContent>
          </Card>

          {/* SUBMISSIONS Section */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <KPICard
                  title="Units Submitted"
                  value={metrics.unitsSubmitted}
                  change={metrics.unitsSubmittedChange}
                  format="number"
                  icon={<Briefcase className="size-3" />}
                  color="blue"
                  compact
                />
                <KPICard
                  title="Debt Load Submitted"
                  value={metrics.debtLoadSubmitted}
                  change={metrics.debtLoadSubmittedChange}
                  format="currency"
                  icon={<Target className="size-3" />}
                  color="purple"
                  compact
                />
              </div>
            </CardContent>
          </Card>

          {/* COMMISSIONS Section - Summary KPIs */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commissions Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                <KPICard
                  title="FPC Units"
                  value={metrics.unitsFPC}
                  format="number"
                  icon={<CheckCircle className="size-3" />}
                  color="emerald"
                  compact
                  minimal
                />
                <KPICard
                  title="FPC Debt"
                  value={metrics.debtLoadFPC}
                  format="currency"
                  icon={<CheckCircle className="size-3" />}
                  color="emerald"
                  compact
                  minimal
                />
                <KPICard
                  title="Commission"
                  value={metrics.totalCommissions}
                  format="currency"
                  icon={<TrendingUp className="size-3" />}
                  color="emerald"
                  compact
                  minimal
                />
                <KPICard
                  title="Clawbacks"
                  value={metrics.totalClawbacks}
                  format="currency"
                  icon={<TrendingDown className="size-3" />}
                  color="rose"
                  compact
                  minimal
                />
                <div className="glass-card rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">Tier</span>
                  <span className="text-sm font-bold text-amber-400">T{metrics.currentTier}</span>
                </div>
                <div className="glass-card rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">Exp. Comm</span>
                  <span className="text-sm font-bold text-purple-400">${(metrics.expectedCommission / 1000).toFixed(0)}K</span>
                </div>
                <div className="glass-card rounded-lg p-2 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-medium text-muted-foreground uppercase">Exp. Tier</span>
                  <span className="text-sm font-bold text-blue-400">T{metrics.expectedTier}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <VolumeChart data={volumeData} />
        </div>

        {/* Right Column - Targets, Search, Announcements */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Monthly Targets */}
          <ProgressCard
            title="Monthly Targets"
            items={[
              {
                label: 'Units to Target',
                current: metrics.unitsEnrolled,
                target: metrics.monthlyTargetUnits,
                format: 'number',
              },
              {
                label: 'Debt Load to Target',
                current: metrics.debtLoadEnrolled,
                target: metrics.monthlyTargetDebtLoad,
                format: 'currency',
              },
            ]}
          />

          {/* Client Search */}
          <ClientSearch data={pipeline} />

          {/* Announcements */}
          <AnnouncementsList
            announcements={announcements}
            userId={user?.id}
            limit={3}
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
