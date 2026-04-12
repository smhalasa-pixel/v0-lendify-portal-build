'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'last3months'
  | 'last6months'
  | 'thisYear'
  | 'custom'

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  className?: string
  align?: 'start' | 'center' | 'end'
  presets?: boolean
}

const presetOptions: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3months', label: 'Last 3 Months' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

function getPresetDateRange(preset: DateRangePreset): DateRange | undefined {
  const today = new Date()
  
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'yesterday':
      const yesterday = subDays(today, 1)
      return { from: yesterday, to: yesterday }
    case 'last7days':
      return { from: subDays(today, 6), to: today }
    case 'last30days':
      return { from: subDays(today, 29), to: today }
    case 'thisMonth':
      return { from: startOfMonth(today), to: today }
    case 'lastMonth':
      const lastMonth = subMonths(today, 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    case 'last3months':
      return { from: subMonths(today, 3), to: today }
    case 'last6months':
      return { from: subMonths(today, 6), to: today }
    case 'thisYear':
      return { from: startOfYear(today), to: today }
    case 'custom':
    default:
      return undefined
  }
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  align = 'start',
  presets = true,
}: DateRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<DateRangePreset>('last30days')
  const [isOpen, setIsOpen] = React.useState(false)

  // Initialize with last 30 days
  React.useEffect(() => {
    if (!dateRange) {
      onDateRangeChange(getPresetDateRange('last30days'))
    }
  }, [])

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      onDateRangeChange(getPresetDateRange(preset))
    }
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setSelectedPreset('custom')
    onDateRangeChange(range)
  }

  const displayText = React.useMemo(() => {
    if (!dateRange?.from) {
      return 'Select date range'
    }
    if (dateRange.to) {
      if (format(dateRange.from, 'LLL dd, y') === format(dateRange.to, 'LLL dd, y')) {
        return format(dateRange.from, 'LLL dd, yyyy')
      }
      return `${format(dateRange.from, 'LLL dd')} - ${format(dateRange.to, 'LLL dd, yyyy')}`
    }
    return format(dateRange.from, 'LLL dd, yyyy')
  }, [dateRange])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {presets && (
        <Select value={selectedPreset} onValueChange={(value) => handlePresetChange(value as DateRangePreset)}>
          <SelectTrigger className="w-[160px] h-9 bg-card border-border">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal h-9 bg-card border-border',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handlePresetChange('last30days')
                setIsOpen(false)
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
