'use client'

import * as React from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  exportToCsv,
  exportToXlsx,
  type ExportColumn,
} from '@/lib/export-utils'

interface ExportButtonProps<T> {
  filename: string
  columns: ExportColumn<T>[]
  rows: T[]
  sheetName?: string
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  label?: string
}

export function ExportButton<T>({
  filename,
  columns,
  rows,
  sheetName,
  disabled,
  size = 'sm',
  variant = 'outline',
  label = 'Export',
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = React.useState<'csv' | 'xlsx' | null>(null)

  const handleCsv = () => {
    if (rows.length === 0) {
      toast.error('No data to export')
      return
    }
    setIsExporting('csv')
    try {
      exportToCsv({ filename, columns, rows })
      toast.success(`Exported ${rows.length} rows to CSV`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed'
      toast.error(msg)
    } finally {
      setIsExporting(null)
    }
  }

  const handleXlsx = async () => {
    if (rows.length === 0) {
      toast.error('No data to export')
      return
    }
    setIsExporting('xlsx')
    try {
      await exportToXlsx({ filename, columns, rows, sheetName })
      toast.success(`Exported ${rows.length} rows to Excel`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed'
      toast.error(msg)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isExporting !== null}>
          {isExporting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Download className="size-4 mr-2" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export {rows.length} rows</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCsv} disabled={isExporting !== null}>
          <FileText className="size-4 mr-2" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleXlsx} disabled={isExporting !== null}>
          <FileSpreadsheet className="size-4 mr-2" />
          Excel (.xlsx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
