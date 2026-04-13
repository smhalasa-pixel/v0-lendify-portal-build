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
  Award,
  Wallet,
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  title="Qualified Conv."
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

          {/* COMMISSIONS Section */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commissions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <KPICard
                  title="FPC Units"
                  value={metrics.unitsFPC}
                  change={metrics.unitsFPCChange}
                  format="number"
                  icon={<CheckCircle className="size-3" />}
                  color="emerald"
                  compact
                />
                <KPICard
                  title="FPC Debt Load"
                  value={metrics.debtLoadFPC}
                  change={metrics.debtLoadFPCChange}
                  format="currency"
                  icon={<CheckCircle className="size-3" />}
                  color="emerald"
                  compact
                />
                <KPICard
                  title="Commission"
                  value={metrics.totalCommissions}
                  change={metrics.commissionsChange}
                  format="currency"
                  icon={<TrendingUp className="size-3" />}
                  color="emerald"
                  compact
                />
                <KPICard
                  title="Clawbacks"
                  value={metrics.totalClawbacks}
                  change={metrics.clawbacksChange}
                  format="currency"
                  icon={<TrendingDown className="size-3" />}
                  color="rose"
                  compact
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-card rounded-lg p-2.5 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="p-1 rounded bg-amber-500/10">
                      <Award className="size-3 text-amber-400" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">Current Tier</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {tierLabels[metrics.currentTier - 1]} (T{metrics.currentTier})
                  </span>
                </div>
                <div className="glass-card rounded-lg p-2.5 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="p-1 rounded bg-purple-500/10">
                      <Wallet className="size-3 text-purple-400" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">Expected Comm.</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    ${(metrics.expectedCommission / 1000).toFixed(1)}K
                  </span>
                </div>
                <div className="glass-card rounded-lg p-2.5 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="p-1 rounded bg-blue-500/10">
                      <Award className="size-3 text-blue-400" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">Expected Tier</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {tierLabels[metrics.expectedTier - 1]} (T{metrics.expectedTier})
                  </span>
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
