'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { PipelineLoan } from '@/lib/types'

interface PipelineTableProps {
  data: PipelineLoan[]
  title?: string
  description?: string
  showAgent?: boolean
}

const statusConfig: Record<string, { bg: string; text: string; glow: string }> = {
  lead: { bg: 'bg-slate-500/20', text: 'text-slate-300', glow: 'shadow-slate-500/20' },
  application: { bg: 'bg-blue-500/20', text: 'text-blue-300', glow: 'shadow-blue-500/20' },
  processing: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', glow: 'shadow-yellow-500/20' },
  underwriting: { bg: 'bg-orange-500/20', text: 'text-orange-300', glow: 'shadow-orange-500/20' },
  approved: { bg: 'bg-purple-500/20', text: 'text-purple-300', glow: 'shadow-purple-500/20' },
  closing: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', glow: 'shadow-emerald-500/20' },
  funded: { bg: 'bg-green-500/20', text: 'text-green-300', glow: 'shadow-green-500/20' },
}

const statusLabels: Record<string, string> = {
  lead: 'Lead',
  application: 'Application',
  processing: 'Processing',
  underwriting: 'Underwriting',
  approved: 'Approved',
  closing: 'Closing',
  funded: 'Funded',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PipelineTable({
  data,
  title = 'Active Pipeline',
  description = 'Loans currently in progress',
  showAgent = false,
}: PipelineTableProps) {
  return (
    <Card className="glass-card border-purple-500/20 overflow-hidden">
      <CardHeader className="border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardTitle className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-purple-300/60">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-500/10 hover:bg-transparent">
                <TableHead className="text-purple-300/70 font-medium">Borrower</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Amount</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Type</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Status</TableHead>
                <TableHead className="text-purple-300/70 font-medium">Expected Close</TableHead>
                {showAgent && <TableHead className="text-purple-300/70 font-medium">Agent</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAgent ? 6 : 5} className="text-center text-purple-300/50 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <span className="text-2xl opacity-50">0</span>
                      </div>
                      <span>No loans in pipeline</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((loan, index) => {
                  const config = statusConfig[loan.status] || statusConfig.lead
                  return (
                    <TableRow 
                      key={loan.id} 
                      className="border-purple-500/10 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-medium text-white group-hover:text-purple-200 transition-colors">
                        {loan.borrowerName}
                      </TableCell>
                      <TableCell className="text-purple-100/80 font-mono text-sm">
                        {formatCurrency(loan.loanAmount)}
                      </TableCell>
                      <TableCell className="text-purple-200/70">
                        {loan.loanType}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${config.bg} ${config.text} border-current/30 shadow-sm ${config.glow}`}
                        >
                          {statusLabels[loan.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-purple-200/70 text-sm">
                        {formatDate(loan.expectedCloseDate)}
                      </TableCell>
                      {showAgent && (
                        <TableCell className="text-purple-200/70">
                          {loan.agentName}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
