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

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  lead: 'outline',
  application: 'outline',
  processing: 'secondary',
  underwriting: 'secondary',
  approved: 'default',
  closing: 'default',
  funded: 'default',
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expected Close</TableHead>
              {showAgent && <TableHead>Agent</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showAgent ? 6 : 5} className="text-center text-muted-foreground py-8">
                  No loans in pipeline
                </TableCell>
              </TableRow>
            ) : (
              data.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                  <TableCell>{formatCurrency(loan.loanAmount)}</TableCell>
                  <TableCell>{loan.loanType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[loan.status]}>
                      {statusLabels[loan.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(loan.expectedCloseDate)}</TableCell>
                  {showAgent && <TableCell>{loan.agentName}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
