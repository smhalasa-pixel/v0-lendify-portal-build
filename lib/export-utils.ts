/**
 * Export utility for turning arrays of objects into downloadable CSV / XLSX files.
 *
 * CSV is generated natively (no dependency) so it works offline.
 * XLSX uses SheetJS (`xlsx`) lazily imported so it doesn't bloat the client bundle.
 */

export interface ExportColumn<T> {
  key: keyof T | string
  label: string
  format?: (value: unknown, row: T) => string | number | null | undefined
}

export interface ExportOptions<T> {
  filename: string
  columns: ExportColumn<T>[]
  rows: T[]
  sheetName?: string
}

function getValue<T>(row: T, column: ExportColumn<T>): string | number {
  const raw = (row as Record<string, unknown>)[column.key as string]
  const value = column.format ? column.format(raw, row) : raw
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

function timestamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

export function exportToCsv<T>(options: ExportOptions<T>): void {
  const { filename, columns, rows } = options
  const header = columns.map(c => escapeCsv(c.label)).join(',')
  const body = rows
    .map(row => columns.map(col => escapeCsv(getValue(row, col))).join(','))
    .join('\n')

  const csv = '\uFEFF' + header + '\n' + body // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const finalName = filename.endsWith('.csv') ? filename : `${filename}_${timestamp()}.csv`
  triggerDownload(blob, finalName)
}

export async function exportToXlsx<T>(options: ExportOptions<T>): Promise<void> {
  const { filename, columns, rows, sheetName = 'Sheet1' } = options

  // Dynamic import so xlsx is only loaded when needed
  const XLSX = await import('xlsx')

  const header = columns.map(c => c.label)
  const data = rows.map(row => columns.map(col => getValue(row, col)))

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...data])

  // Auto-size columns based on content length
  const colWidths = columns.map((col, i) => {
    const headerLen = col.label.length
    const maxDataLen = Math.max(
      0,
      ...data.map(row => String(row[i] ?? '').length)
    )
    return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) }
  })
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31))

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}_${timestamp()}.xlsx`
  triggerDownload(blob, finalName)
}

/**
 * Multi-sheet XLSX export — useful for "export full report" actions.
 */
export async function exportMultiSheetXlsx(
  filename: string,
  sheets: Array<{ name: string; columns: ExportColumn<unknown>[]; rows: unknown[] }>
): Promise<void> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()

  sheets.forEach(sheet => {
    const header = sheet.columns.map(c => c.label)
    const data = sheet.rows.map(row =>
      sheet.columns.map(col => getValue(row, col as ExportColumn<unknown>))
    )
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data])
    const colWidths = sheet.columns.map((col, i) => {
      const headerLen = col.label.length
      const maxDataLen = Math.max(0, ...data.map(r => String(r[i] ?? '').length))
      return { wch: Math.min(Math.max(headerLen, maxDataLen) + 2, 50) }
    })
    worksheet['!cols'] = colWidths
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31))
  })

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}_${timestamp()}.xlsx`
  triggerDownload(blob, finalName)
}

/**
 * Common formatters for consistent data export across the app.
 */
export const formatters = {
  date: (v: unknown) => {
    if (!v) return ''
    const d = new Date(String(v))
    if (isNaN(d.getTime())) return String(v)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
  },
  datetime: (v: unknown) => {
    if (!v) return ''
    const d = new Date(String(v))
    if (isNaN(d.getTime())) return String(v)
    return d.toLocaleString('en-US')
  },
  currency: (v: unknown) => {
    const n = Number(v)
    if (isNaN(n)) return ''
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  },
  percent: (v: unknown) => {
    const n = Number(v)
    if (isNaN(n)) return ''
    return `${n.toFixed(1)}%`
  },
  duration: (v: unknown) => {
    const seconds = Number(v)
    if (isNaN(seconds)) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  },
  minutes: (v: unknown) => {
    const n = Number(v)
    if (isNaN(n)) return ''
    return `${n} min`
  },
  boolean: (v: unknown) => (v ? 'Yes' : 'No'),
}
