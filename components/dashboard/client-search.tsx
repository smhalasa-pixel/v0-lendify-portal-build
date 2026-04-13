'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Client } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ClientSearchProps {
  data: Client[]
}

const statusConfig: Record<Client['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  lead: { label: 'Lead', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  enrolled: { label: 'Enrolled', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'default' },
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
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ClientSearch({ data }: ClientSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredClients = React.useMemo(() => {
    if (!searchQuery.trim()) return data
    
    const query = searchQuery.toLowerCase()
    return data.filter(
      client =>
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query) ||
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-background/50 border-border/50 hover:bg-muted/50"
        >
          <Search className="mr-2 size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Search clients...</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Client Search</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto mt-4 border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Debt Load</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>1st Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? `No clients found matching "${searchQuery}"` : 'No clients available'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const status = statusConfig[client.status]
                  return (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {client.id}
                      </TableCell>
                      <TableCell className="font-medium">{client.firstName}</TableCell>
                      <TableCell className="font-medium">{client.lastName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={status.variant} 
                          className={cn(
                            "text-xs",
                            client.status === 'active' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                            client.status === 'enrolled' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                            client.status === 'completed' && "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          )}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(client.debtLoad)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(client.submittedDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(client.enrolledDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(client.firstPaymentDate)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Showing {filteredClients.length} of {data.length} clients
        </div>
      </DialogContent>
    </Dialog>
  )
}
