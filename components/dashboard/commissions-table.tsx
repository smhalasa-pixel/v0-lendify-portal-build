'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Check, X, AlertCircle, Clock, Search } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Commission, Clawback } from '@/lib/types'

interface CommissionsTableProps {
  commissions: Commission[]
  clawbacks: Clawback[]
}

type FilterType = 'all' | 'pending' | 'approved' | 'paid' | 'clawback'

export function CommissionsTable({ commissions, clawbacks }: CommissionsTableProps) {
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<FilterType>('all')

  // Combine commissions and format for display
  const tableData = React.useMemo(() => {
    return commissions.map(c => {
      // Check if this commission has a clawback
      const relatedClawback = clawbacks.find(cb => cb.originalCommissionId === c.id)
      
      return {
        id: c.id,
        clientName: c.borrowerName,
        status: relatedClawback ? 'clawback' : c.status,
        debtLoad: c.loanAmount,
        payableTier: c.commissionRate >= 0.0175 ? 3 : c.commissionRate >= 0.015 ? 2 : 1,
        commission: relatedClawback ? c.commissionAmount - relatedClawback.clawbackAmount : c.commissionAmount,
        isPaid: c.status === 'paid',
        paidDate: c.paidDate,
        clawbackAmount: relatedClawback?.clawbackAmount,
      }
    })
  }, [commissions, clawbacks])

  // Filter data
  const filteredData = React.useMemo(() => {
    return tableData.filter(item => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        item.id.toLowerCase().includes(searchLower) ||
        item.clientName.toLowerCase().includes(searchLower)
      
      // Status filter
      const matchesFilter = filter === 'all' || item.status === filter

      return matchesSearch && matchesFilter
    })
  }, [tableData, search, filter])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Paid</Badge>
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Approved</Badge>
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Pending</Badge>
      case 'clawback':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">Clawback</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    }
  }

  const getTierBadge = (tier: number) => {
    const labels = ['T1', 'T2', 'T3']
    const colors = [
      'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
      'bg-slate-400/20 text-slate-300 border-slate-400/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ]
    return <Badge className={`${colors[tier - 1]} text-[10px]`}>{labels[tier - 1]}</Badge>
  }

  const getPaidIcon = (isPaid: boolean, status: string) => {
    if (status === 'clawback') {
      return <AlertCircle className="size-4 text-rose-400" />
    }
    if (isPaid) {
      return <Check className="size-4 text-emerald-400" />
    }
    if (status === 'pending') {
      return <Clock className="size-4 text-amber-400" />
    }
    return <X className="size-4 text-muted-foreground" />
  }

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Commissions & Clawbacks
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <Input
                placeholder="Search ID or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-7 text-xs w-36 bg-background/50 border-border/50"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="h-7 text-xs w-24 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="clawback">Clawback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="max-h-[280px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 w-20">ID</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8">Client Name</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 w-20">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 text-right w-24">Debt Load</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 text-center w-16">Tier</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 text-right w-24">Commission</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground uppercase h-8 text-center w-14">Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground text-xs py-8">
                      No commissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="text-xs font-mono text-muted-foreground py-2">
                        {item.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground py-2 truncate max-w-[120px]">
                        {item.clientName}
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right text-foreground py-2">
                        {formatCurrency(item.debtLoad)}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {getTierBadge(item.payableTier)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right py-2">
                        <span className={item.status === 'clawback' ? 'text-rose-400' : 'text-emerald-400'}>
                          {item.status === 'clawback' ? '-' : ''}{formatCurrency(item.commission)}
                        </span>
                        {item.clawbackAmount && (
                          <span className="block text-[10px] text-rose-400/70">
                            (-{formatCurrency(item.clawbackAmount)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <div className="flex items-center justify-center">
                          {getPaidIcon(item.isPaid, item.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] text-muted-foreground">
            Showing {filteredData.length} of {tableData.length} records
          </span>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="size-3 text-emerald-400" /> Paid
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-amber-400" /> Pending
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="size-3 text-rose-400" /> Clawback
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
