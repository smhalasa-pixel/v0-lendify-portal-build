'use client'

import * as React from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
  Check,
  X,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CurrencyDisplay } from '@/components/ui/currency-display'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  deducted: { label: 'Deducted', variant: 'destructive' },
  disputed: { label: 'Disputed', variant: 'secondary' },
  waived: { label: 'Waived', variant: 'default' },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getTierFromAmount(originalAmount: number, clawbackAmount: number): { tier: number; label: string } {
  // Estimate tier based on the clawback ratio
  const ratio = clawbackAmount / originalAmount
  if (ratio >= 0.0175) return { tier: 3, label: 'T3' }
  if (ratio >= 0.015) return { tier: 2, label: 'T2' }
  return { tier: 1, label: 'T1' }
}

function getTierBadgeColor(tier: number): string {
  switch (tier) {
    case 3: return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 2: return 'bg-slate-400/20 text-slate-300 border-slate-400/30'
    default: return 'bg-orange-700/20 text-orange-400 border-orange-700/30'
  }
}

export default function ClawbacksPage() {
  const { user } = useAuth()
  const isAgent = user?.role === 'agent'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [disputeDialogOpen, setDisputeDialogOpen] = React.useState(false)
  const [selectedClawback, setSelectedClawback] = React.useState<string | null>(null)
  const [disputeReason, setDisputeReason] = React.useState('')

  // Get clawbacks based on role
  const allClawbacks = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getClawbacks(user.id)
    }
    return dataService.getClawbacks()
  }, [user, isAgent])

  // Filter clawbacks
  const filteredClawbacks = React.useMemo(() => {
    return allClawbacks.filter((clawback) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          clawback.borrowerName.toLowerCase().includes(query) ||
          clawback.id.toLowerCase().includes(query) ||
          clawback.loanId.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && clawback.status !== statusFilter) {
        return false
      }

      // Date filter
      if (dateRange?.from) {
        const createdDate = new Date(clawback.createdDate)
        if (createdDate < dateRange.from) return false
        if (dateRange.to && createdDate > dateRange.to) return false
      }

      return true
    })
  }, [allClawbacks, searchQuery, statusFilter, dateRange])

  // Calculate summary metrics
  const metrics = React.useMemo(() => {
    const total = allClawbacks.reduce((sum, c) => sum + c.clawbackAmount, 0)
    const pending = allClawbacks
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + c.clawbackAmount, 0)
    const deducted = allClawbacks
      .filter((c) => c.status === 'deducted')
      .reduce((sum, c) => sum + c.clawbackAmount, 0)
    const disputed = allClawbacks
      .filter((c) => c.status === 'disputed')
      .reduce((sum, c) => sum + c.clawbackAmount, 0)

    return { total, pending, deducted, disputed }
  }, [allClawbacks])

  const handleDispute = () => {
    setDisputeDialogOpen(false)
    setSelectedClawback(null)
    setDisputeReason('')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clawbacks</h1>
          <p className="text-muted-foreground">
            {isAgent
              ? 'Track and manage commission clawbacks'
              : 'Manage all commission clawbacks and disputes'}
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Clawbacks"
          value={metrics.total}
          format="currency"
          icon={<AlertTriangle className="size-4" />}
          color="rose"
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
          title="Deducted"
          value={metrics.deducted}
          format="currency"
          icon={<CheckCircle className="size-4" />}
          color="rose"
          showDateFilter={false}
        />
        <KPICard
          title="Disputed"
          value={metrics.disputed}
          format="currency"
          icon={<MessageSquare className="size-4" />}
          color="blue"
          showDateFilter={false}
        />
      </div>

      {/* Clawbacks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clawback Records</CardTitle>
          <CardDescription>
            {filteredClawbacks.length} of {allClawbacks.length} clawbacks
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
                <SelectItem value="deducted">Deducted</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold text-center">ID</TableHead>
                  <TableHead className="font-semibold text-center">Client Name</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">Debt Load</TableHead>
                  <TableHead className="font-semibold text-center">Tier</TableHead>
                  <TableHead className="font-semibold text-center">Tier %</TableHead>
                  <TableHead className="font-semibold text-center">Clawback</TableHead>
                  <TableHead className="font-semibold text-center">Deducted</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClawbacks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      No clawbacks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClawbacks.map((clawback) => {
                    const tierInfo = getTierFromAmount(clawback.originalAmount, clawback.clawbackAmount)
                    const isDeducted = clawback.status === 'deducted'
                    
                    return (
                      <TableRow key={clawback.id} className="hover:bg-muted/20">
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {clawback.id.slice(0, 12)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {clawback.borrowerName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusConfig[clawback.status].variant}>
                            {statusConfig[clawback.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <CurrencyDisplay value={clawback.originalAmount} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getTierBadgeColor(tierInfo.tier)}>
                            {tierInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {((clawback.clawbackAmount / clawback.originalAmount) * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-center font-mono font-medium text-rose-400">
                          -<CurrencyDisplay value={clawback.clawbackAmount} />
                        </TableCell>
                        <TableCell className="text-center">
                          {isDeducted ? (
                            <div className="flex items-center justify-center">
                              <div className="size-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                                <Check className="size-3.5 text-rose-400" />
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
                        <TableCell>
                          {clawback.status === 'pending' && (
                            <Dialog
                              open={disputeDialogOpen && selectedClawback === clawback.id}
                              onOpenChange={(open) => {
                                setDisputeDialogOpen(open)
                                if (!open) {
                                  setSelectedClawback(null)
                                  setDisputeReason('')
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedClawback(clawback.id)}
                                >
                                  Dispute
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Dispute Clawback</DialogTitle>
                                  <DialogDescription>
                                    Submit a dispute for clawback on loan {clawback.loanId}.
                                    Please provide a detailed explanation.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Clawback Details</Label>
                                    <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                                      <p>
                                        <span className="text-muted-foreground">Amount:</span>{' '}
                                        <CurrencyDisplay value={clawback.clawbackAmount} />
                                      </p>
                                      <p>
                                        <span className="text-muted-foreground">Reason:</span>{' '}
                                        {clawback.reason}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="dispute-reason">Dispute Reason</Label>
                                    <Textarea
                                      id="dispute-reason"
                                      placeholder="Explain why this clawback should be reviewed..."
                                      value={disputeReason}
                                      onChange={(e) => setDisputeReason(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setDisputeDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleDispute} disabled={!disputeReason.trim()}>
                                    Submit Dispute
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                          {clawback.status === 'disputed' && (
                            <Badge variant="secondary" className="text-xs">
                              Under Review
                            </Badge>
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

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Clawbacks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Clawbacks occur when a loan is paid off early, defaults, or is rescinded within
            a specified period. The commission earned on that loan may be partially or fully
            recovered.
          </p>
          <p>
            If you believe a clawback has been applied in error, you can submit a dispute
            for review. Disputes are typically reviewed within 5-7 business days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
