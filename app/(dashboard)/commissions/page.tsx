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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Commission } from '@/lib/types'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  approved: { label: 'Approved', variant: 'secondary' },
  paid: { label: 'Paid', variant: 'default' },
  clawback: { label: 'Clawback', variant: 'destructive' },
}

const loanTypeLabels: Record<string, string> = {
  conventional: 'Conventional',
  fha: 'FHA',
  va: 'VA',
  jumbo: 'Jumbo',
  refinance: 'Refinance',
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

export default function CommissionsPage() {
  const { user } = useAuth()
  const isAgent = user?.role === 'agent'

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [typeFilters, setTypeFilters] = React.useState<string[]>([])

  // Get commissions based on role
  const allCommissions = React.useMemo(() => {
    if (isAgent && user) {
      return dataService.getCommissions(user.id)
    }
    return dataService.getCommissions()
  }, [user, isAgent])

  // Filter commissions
  const filteredCommissions = React.useMemo(() => {
    return allCommissions.filter((commission) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          commission.borrowerName.toLowerCase().includes(query) ||
          commission.loanId.toLowerCase().includes(query) ||
          commission.agentName.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && commission.status !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilters.length > 0 && !typeFilters.includes(commission.loanType)) {
        return false
      }

      return true
    })
  }, [allCommissions, searchQuery, statusFilter, typeFilters])

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

  const handleTypeFilterChange = (type: string, checked: boolean) => {
    if (checked) {
      setTypeFilters([...typeFilters, type])
    } else {
      setTypeFilters(typeFilters.filter((t) => t !== type))
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">
            {isAgent ? 'Your commission history and earnings' : 'All commission records and payouts'}
          </p>
        </div>
        <Button variant="outline" className="w-fit">
          <Download className="size-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Commissions"
          value={metrics.total}
          format="currency"
          icon={<DollarSign className="size-4" />}
        />
        <KPICard
          title="Paid"
          value={metrics.paid}
          format="currency"
          icon={<CheckCircle className="size-4" />}
        />
        <KPICard
          title="Pending"
          value={metrics.pending}
          format="currency"
          icon={<Clock className="size-4" />}
        />
        <KPICard
          title="Clawbacks"
          value={metrics.clawback}
          format="currency"
          icon={<AlertTriangle className="size-4" />}
        />
      </div>

      {/* Filters */}
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
                placeholder="Search by borrower, loan ID, or agent..."
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="size-4 mr-2" />
                  Loan Type
                  {typeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {typeFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                {Object.entries(loanTypeLabels).map(([value, label]) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={typeFilters.includes(value)}
                    onCheckedChange={(checked) => handleTypeFilterChange(value, checked)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                {!isAgent && <TableHead>Agent</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Loan Amount</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Funded</TableHead>
                <TableHead>Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAgent ? 9 : 10}
                    className="text-center text-muted-foreground py-8"
                  >
                    No commissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-mono text-xs">
                      {commission.loanId}
                    </TableCell>
                    <TableCell className="font-medium">
                      {commission.borrowerName}
                    </TableCell>
                    {!isAgent && <TableCell>{commission.agentName}</TableCell>}
                    <TableCell>
                      <Badge variant="outline">
                        {loanTypeLabels[commission.loanType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(commission.loanAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(commission.commissionRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(commission.commissionAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[commission.status].variant}>
                        {statusConfig[commission.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(commission.fundedDate)}</TableCell>
                    <TableCell>
                      {commission.paidDate ? formatDate(commission.paidDate) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
