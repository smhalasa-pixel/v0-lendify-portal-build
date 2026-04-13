'use client'

import * as React from 'react'
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CurrencyDisplay } from '@/components/ui/currency-display'

interface ClientSearchProps {
  data: Client[]
}

type SortField = 'debtLoad' | 'enrolledDate' | null
type SortDirection = 'asc' | 'desc'

const statusConfig: Record<Client['status'], { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  lead: { label: 'Lead', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  enrolled: { label: 'Enrolled', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'default' },
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
  const [sortField, setSortField] = React.useState<SortField>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to desc
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedClients = React.useMemo(() => {
    let result = data
    
    // Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        client =>
          client.firstName.toLowerCase().includes(query) ||
          client.lastName.toLowerCase().includes(query) ||
          client.id.toLowerCase().includes(query) ||
          `${client.firstName} ${client.lastName}`.toLowerCase().includes(query)
      )
    }
    
    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === 'debtLoad') {
          return sortDirection === 'asc' 
            ? a.debtLoad - b.debtLoad 
            : b.debtLoad - a.debtLoad
        }
        if (sortField === 'enrolledDate') {
          const dateA = a.enrolledDate ? new Date(a.enrolledDate).getTime() : 0
          const dateB = b.enrolledDate ? new Date(b.enrolledDate).getTime() : 0
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
        }
        return 0
      })
    }
    
    return result
  }, [data, searchQuery, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 size-3 text-muted-foreground" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 size-3" />
      : <ArrowDown className="ml-1 size-3" />
  }

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
      <DialogContent className="!w-[98vw] !h-[95vh] !max-w-[98vw] !max-h-[95vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Client Search</DialogTitle>
          <DialogDescription>
            Search and view client information including status, debt load, and dates.
          </DialogDescription>
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
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead className="w-[140px]">First Name</TableHead>
                <TableHead className="w-[140px]">Last Name</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[140px]">
                  <button
                    onClick={() => handleSort('debtLoad')}
                    className="flex items-center justify-center font-medium hover:text-foreground transition-colors mx-auto"
                  >
                    Debt Load
                    <SortIcon field="debtLoad" />
                  </button>
                </TableHead>
                <TableHead className="w-[130px]">Submitted</TableHead>
                <TableHead className="w-[130px]">
                  <button
                    onClick={() => handleSort('enrolledDate')}
                    className="flex items-center justify-center font-medium hover:text-foreground transition-colors mx-auto"
                  >
                    Enrolled
                    <SortIcon field="enrolledDate" />
                  </button>
                </TableHead>
                <TableHead className="w-[130px]">1st Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? `No clients found matching "${searchQuery}"` : 'No clients available'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedClients.map((client) => {
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
                      <TableCell className="font-medium">
                        <CurrencyDisplay value={client.debtLoad} />
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
          Showing {filteredAndSortedClients.length} of {data.length} clients
        </div>
      </DialogContent>
    </Dialog>
  )
}
