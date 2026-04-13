'use client'

import * as React from 'react'
import { Search, User, Calendar, DollarSign, FileCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { PipelineLoan } from '@/lib/types'

interface ClientSearchProps {
  data: PipelineLoan[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  lead: { label: 'Lead', variant: 'outline' },
  application: { label: 'Application', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'secondary' },
  underwriting: { label: 'Underwriting', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  closing: { label: 'Closing', variant: 'default' },
  funded: { label: 'Funded', variant: 'default' },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ClientSearch({ data }: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredClients = React.useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    return data.filter(
      client =>
        client.borrowerName.toLowerCase().includes(query) ||
        client.clientId.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query)
    ).slice(0, 5) // Limit to 5 results
  }, [data, searchQuery])

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">Client Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>

        {searchQuery.trim() && (
          <div className="space-y-2">
            {filteredClients.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No clients found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredClients.map((client) => {
                const status = statusConfig[client.status]
                return (
                  <div
                    key={client.id}
                    className="p-3 rounded-lg bg-background/30 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {client.borrowerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.clientId}
                          </p>
                        </div>
                      </div>
                      <Badge variant={status.variant} className="shrink-0 text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <DollarSign className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Debt Load:</span>
                        <span className="font-medium text-foreground">{formatCurrency(client.loanAmount)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span className="text-muted-foreground">1st Payment:</span>
                        <span className="font-medium text-foreground">{formatDate(client.firstPaymentDate)}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Enter a client name or ID to search
          </div>
        )}
      </CardContent>
    </Card>
  )
}
