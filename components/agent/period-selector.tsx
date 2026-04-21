"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type PeriodKey = "today" | "wtd" | "mtd" | "qtd" | "ytd" | "custom"

export type AgentPeriod = {
  key: PeriodKey
  label: string
  shortLabel: string
  from: Date
  to: Date
}

const PRESETS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "wtd", label: "WTD" },
  { key: "mtd", label: "MTD" },
  { key: "qtd", label: "QTD" },
  { key: "ytd", label: "YTD" },
]

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function computePeriodRange(key: PeriodKey, custom?: DateRange): AgentPeriod {
  const now = new Date()
  const today = startOfDay(now)
  const endToday = endOfDay(now)

  if (key === "today") {
    return {
      key,
      label: "Today",
      shortLabel: format(today, "MMM d"),
      from: today,
      to: endToday,
    }
  }

  if (key === "wtd") {
    // Week starts Monday
    const day = today.getDay() // 0 Sun – 6 Sat
    const diff = day === 0 ? 6 : day - 1
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - diff)
    return {
      key,
      label: "Week to date",
      shortLabel: "This Week",
      from: weekStart,
      to: endToday,
    }
  }

  if (key === "mtd") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      key,
      label: "Month to date",
      shortLabel: format(monthStart, "MMM"),
      from: monthStart,
      to: endToday,
    }
  }

  if (key === "qtd") {
    const q = Math.floor(today.getMonth() / 3)
    const quarterStart = new Date(today.getFullYear(), q * 3, 1)
    return {
      key,
      label: "Quarter to date",
      shortLabel: `Q${q + 1}`,
      from: quarterStart,
      to: endToday,
    }
  }

  if (key === "ytd") {
    const yearStart = new Date(today.getFullYear(), 0, 1)
    return {
      key,
      label: "Year to date",
      shortLabel: String(today.getFullYear()),
      from: yearStart,
      to: endToday,
    }
  }

  // custom
  const from = custom?.from ? startOfDay(custom.from) : today
  const to = custom?.to ? endOfDay(custom.to) : endToday
  const sameDay =
    format(from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")
  return {
    key: "custom",
    label: sameDay
      ? format(from, "MMM d, yyyy")
      : `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`,
    shortLabel: sameDay ? format(from, "MMM d") : `${format(from, "MMM d")}–${format(to, "MMM d")}`,
    from,
    to,
  }
}

type Props = {
  period: AgentPeriod
  customRange?: DateRange
  onChange: (key: PeriodKey, custom?: DateRange) => void
}

export function PeriodSelector({ period, customRange, onChange }: Props) {
  const [open, setOpen] = React.useState(false)
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
    customRange,
  )

  React.useEffect(() => {
    setDraftRange(customRange)
  }, [customRange])

  const handleApplyCustom = () => {
    if (draftRange?.from) {
      onChange("custom", {
        from: draftRange.from,
        to: draftRange.to ?? draftRange.from,
      })
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="tablist"
        aria-label="Time period"
        className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5"
      >
        {PRESETS.map((preset) => {
          const active = period.key === preset.key
          return (
            <button
              key={preset.key}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(preset.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 border-border bg-card text-xs font-semibold",
              period.key === "custom" &&
                "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <CalendarIcon className="size-3.5" />
            {period.key === "custom" ? period.label : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={draftRange?.from ?? new Date()}
            selected={draftRange}
            onSelect={setDraftRange}
            numberOfMonths={2}
            disabled={(d) => d > new Date()}
          />
          <div className="flex items-center justify-between gap-2 border-t border-border p-3">
            <div className="text-[11px] text-muted-foreground">
              {draftRange?.from && draftRange?.to
                ? `${format(draftRange.from, "MMM d")} – ${format(draftRange.to, "MMM d, yyyy")}`
                : "Select a start and end date"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraftRange(undefined)
                  onChange("mtd")
                  setOpen(false)
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustom}
                disabled={!draftRange?.from}
                className="gap-1"
              >
                <Check className="size-3.5" />
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
