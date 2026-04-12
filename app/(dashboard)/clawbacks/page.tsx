'use client'

import * as React from 'react'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { KPICard } from '@/components/dashboard/kpi-card'
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'outline', icon: <Clock className="size-3" /> },
  deducted: { label: 'Deducted', variant: 'destructive', icon: <CheckCircle className="size-3" /> },
  disputed: { label: 'Disputed', variant: 'secondary', icon: <MessageSquare className="size-3" /> },
  waived: { label: 'Waived', variant: 'default', icon: <XCircle className="size-3" /> },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ClawbacksPage() {
  const { user } = useAuth()
  const isAgent = user?.role === 'agent'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
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
          clawback.loanId.toLowerCase().includes(query) ||
          clawback.agentName.toLowerCase().includes(query) ||
          clawback.reason.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && clawback.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [allClawbacks, searchQuery, statusFilter])

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
    // In a real app, this would submit the dispute
    setDisputeDialogOpen(false)
    setSelectedClawback(null)
    setDisputeReason('')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clawbacks</h1>
        <p className="text-muted-foreground">
          {isAgent
            ? 'Track and manage commission clawbacks'
            : 'Manage all commission clawbacks and disputes'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Clawbacks"
          value={metrics.total}
          format="currency"
          icon={<AlertTriangle className="size-4" />}
        />
        <KPICard
          title="Pending"
          value={metrics.pending}
          format="currency"
          icon={<Clock className="size-4" />}
        />
        <KPICard
          title="Deducted"
          value={metrics.deducted}
          format="currency"
          icon={<CheckCircle className="size-4" />}
        />
        <KPICard
          title="Disputed"
          value={metrics.disputed}
          format="currency"
          icon={<MessageSquare className="size-4" />}
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
                placeholder="Search by borrower, loan ID, or reason..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                {!isAgent && <TableHead>Agent</TableHead>}
                <TableHead className="text-right">Original Amount</TableHead>
                <TableHead className="text-right">Clawback Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClawbacks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAgent ? 8 : 9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No clawbacks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClawbacks.map((clawback) => (
                  <TableRow key={clawback.id}>
                    <TableCell className="font-mono text-xs">
                      {clawback.loanId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {clawback.borrowerName}
                    </TableCell>
                    {!isAgent && <TableCell>{clawback.agentName}</TableCell>}
                    <TableCell className="text-right">
                      {formatCurrency(clawback.originalAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -{formatCurrency(clawback.clawbackAmount)}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="truncate block" title={clawback.reason}>
                        {clawback.reason}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusConfig[clawback.status].variant}
                        className="gap-1"
                      >
                        {statusConfig[clawback.status].icon}
                        {statusConfig[clawback.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(clawback.createdDate)}</TableCell>
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
                                    {formatCurrency(clawback.clawbackAmount)}
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
                ))
              )}
            </TableBody>
          </Table>
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
