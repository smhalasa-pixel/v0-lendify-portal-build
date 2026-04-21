'use client'

import * as React from 'react'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Check,
  X,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { useTeamScope } from '@/lib/team-scope'
import { KPICard } from '@/components/dashboard/kpi-card'
import { DateRangePicker } from '@/components/date-range-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyDisplay } from '@/components/ui/currency-display'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  approved: { label: 'Approved', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'default' },
  clawback: { label: 'Clawback', variant: 'destructive' },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getTierFromRate(rate: number): { tier: number; label: string } {
  if (rate >= 0.0175) return { tier: 3, label: 'T3' }
  if (rate >= 0.015) return { tier: 2, label: 'T2' }
  return { tier: 1, label: 'T1' }
}

function getTierBadgeColor(tier: number): string {
  switch (tier) {
    case 3: return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 2: return 'bg-slate-400/20 text-slate-300 border-slate-400/30'
    default: return 'bg-orange-700/20 text-orange-400 border-orange-700/30'
  }
}

export default function CommissionsPage() {
  const { user } = useAuth()
  const scope = useTeamScope()
  const isAgent = user?.role === 'agent'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Get commissions scoped to the user's visibility
  //   - agent     : self only
  //   - team lead : agents on their team
  //   - supervisor: agents on all their teams
  //   - exec/admin: everything
  const allCommissions = React.useMemo(() => {
    const full = dataService.getCommissions()
    if (scope.isOrgWide) return full
    if (scope.isSelfOnly && user) return full.filter((c) => c.agentId === user.id)
    const allowed = new Set(scope.agentIds)
    return full.filter((c) => allowed.has(c.agentId))
  }, [scope, user])

  // Filter commissions
  const filteredCommissions = React.useMemo(() => {
    return allCommissions.filter((commission) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          commission.borrowerName.toLowerCase().includes(query) ||
          commission.id.toLowerCase().includes(query) ||
          commission.loanId.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && commission.status !== statusFilter) {
        return false
      }

      // Date filter
      if (dateRange?.from) {
        const fundedDate = new Date(commission.fundedDate)
        if (fundedDate < dateRange.from) return false
        if (dateRange.to && fundedDate > dateRange.to) return false
      }

      return true
    })
  }, [allCommissions, searchQuery, statusFilter, dateRange])

  // Calculate summary metrics
  const metrics = React.useMemo(() => {
    const total = allCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const paid = allCommissions
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    const pending = allCommissions
      .filter((c) => c.status === 'pending' || c.status === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    const clawback = allCommissions
      .filter((c) => c.status === 'clawback')
      .reduce((sum, c) => sum + c.commissionAmount, 0)

    return { total, paid, pending, clawback }
  }, [allCommissions])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">
            {isAgent
              ? 'Your commission history and earnings'
              : scope.isOrgWide
                ? 'All commission records and payouts'
                : `Commissions for ${scope.label} (${scope.agentIds.length} agent${scope.agentIds.length === 1 ? '' : 's'})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button variant="outline" className="w-fit">
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Commissions"
          value={metrics.total}
          format="currency"
          icon={<DollarSign className="size-4" />}
          showDateFilter={false}
        />
        <KPICard
          title="Paid"
          value={metrics.paid}
          format="currency"
          icon={<CheckCircle className="size-4" />}
          color="emerald"
          showDateFilter={false}
        />
        <KPICard
          title="Pending"
          value={metrics.pending}
          format="currency"
          icon={<Clock className="size-4" />}
          color="amber"
          showDateFilter={false}
        />
        <KPICard
          title="Clawbacks"
          value={metrics.clawback}
          format="currency"
          icon={<AlertTriangle className="size-4" />}
          color="rose"
          showDateFilter={false}
        />
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Records</CardTitle>
          <CardDescription>
            {filteredCommissions.length} of {allCommissions.length} commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="clawback">Clawback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-center">ID</TableHead>
                  {!isAgent && <TableHead className="font-semibold text-center">Agent</TableHead>}
                  <TableHead className="font-semibold text-center">Client Name</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Debt Load</TableHead>
                  <TableHead className="font-semibold text-center">Tier</TableHead>
                  <TableHead className="font-semibold text-center">Tier %</TableHead>
                  <TableHead className="font-semibold text-center">Commission</TableHead>
                  <TableHead className="font-semibold text-center">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAgent ? 8 : 9}
                      className="text-center text-muted-foreground py-8"
                    >
                      No commissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((commission) => {
                    const tierInfo = getTierFromRate(commission.commissionRate)
                    const isPaid = commission.status === 'paid'
                    
                    return (
                      <TableRow key={commission.id} className="hover:bg-muted/20">
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {commission.id.slice(0, 12)}
                        </TableCell>
                        {!isAgent && (
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {commission.agentName}
                          </TableCell>
                        )}
                        <TableCell className="text-center font-medium">
                          {commission.borrowerName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusConfig[commission.status].variant}>
                            {statusConfig[commission.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <CurrencyDisplay value={commission.loanAmount} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getTierBadgeColor(tierInfo.tier)}>
                            {tierInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {(commission.commissionRate * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-center font-mono font-medium text-emerald-400">
                          <CurrencyDisplay value={commission.commissionAmount} />
                        </TableCell>
                        <TableCell className="text-center">
                          {isPaid ? (
                            <div className="flex items-center justify-center">
                              <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="size-3.5 text-emerald-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                                <Clock className="size-3.5 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
