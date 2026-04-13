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

const statusConfig: Record<string, { bg: string; text: string }> = {
  lead: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
  application: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  processing: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
  underwriting: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  approved: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  closing: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  funded: { bg: 'bg-green-500/20', text: 'text-green-300' },
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
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium">Borrower</TableHead>
                <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
                <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Expected Close</TableHead>
                {showAgent && <TableHead className="text-muted-foreground font-medium">Agent</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAgent ? 6 : 5} className="text-center text-muted-foreground py-12">
                    No loans in pipeline
                  </TableCell>
                </TableRow>
              ) : (
                data.map((loan) => {
                  const config = statusConfig[loan.status] || statusConfig.lead
                  return (
                    <TableRow 
                      key={loan.id} 
                      className="border-border/50 hover:bg-muted/30"
                    >
                      <TableCell className="font-medium text-foreground">
                        {loan.borrowerName}
                      </TableCell>
                      <TableCell className="text-foreground/80 font-mono text-sm">
                        {formatCurrency(loan.loanAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {loan.loanType}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${config.bg} ${config.text} border-current/30`}
                        >
                          {statusLabels[loan.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(loan.expectedCloseDate)}
                      </TableCell>
                      {showAgent && (
                        <TableCell className="text-muted-foreground">
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
