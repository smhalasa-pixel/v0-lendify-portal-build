"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type HourBucket = {
  hour: number // 0-23
  today: number
  yesterday: number
}

type Props = {
  hourly: HourBucket[]
  dailyTarget: number
}

export function PaceTracker({ hourly, dailyTarget }: Props) {
  const now = new Date()
  const currentHour = now.getHours()

  const todayTotal = hourly.reduce((sum, h) => sum + h.today, 0)
  const yesterdayTotal = hourly.reduce((sum, h) => sum + h.yesterday, 0)
  const yesterdayAtSameHour = hourly
    .filter((h) => h.hour <= currentHour)
    .reduce((sum, h) => sum + h.yesterday, 0)

  const paceVsYesterday = todayTotal - yesterdayAtSameHour

  const maxVal = Math.max(
    1,
    ...hourly.map((h) => Math.max(h.today, h.yesterday)),
  )

  // Assume 9-hour shift starting at 9 AM
  const shiftStart = 9
  const shiftEnd = 18
  const hoursElapsed = Math.max(0, Math.min(shiftEnd - shiftStart, currentHour - shiftStart))
  const expectedByNow = dailyTarget * (hoursElapsed / (shiftEnd - shiftStart))
  const onTargetPace = todayTotal >= expectedByNow

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/20">
            <Activity className="size-4 text-chart-2" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Today vs Yesterday</h3>
            <p className="text-[11px] text-muted-foreground">Hourly close pace</p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold",
            paceVsYesterday > 0
              ? "border-chart-3/40 bg-chart-3/10 text-chart-3"
              : paceVsYesterday < 0
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border/60 bg-muted/30 text-muted-foreground",
          )}
        >
          {paceVsYesterday > 0 && <Zap className="size-3" />}
          {paceVsYesterday > 0 && `+${paceVsYesterday} ahead`}
          {paceVsYesterday === 0 && "Dead even"}
          {paceVsYesterday < 0 && `${paceVsYesterday} behind`}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Today
          </div>
          <div className="mt-0.5 font-mono text-xl font-bold tabular-nums">
            {todayTotal}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Yesterday
          </div>
          <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-muted-foreground">
            {yesterdayTotal}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            On pace?
          </div>
          <div
            className={cn(
              "mt-0.5 font-mono text-xl font-bold tabular-nums",
              onTargetPace ? "text-chart-3" : "text-destructive",
            )}
          >
            {onTargetPace ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {/* Hourly bars */}
      <div className="mt-4 space-y-1">
        <div className="flex h-24 items-end gap-1">
          {hourly.map((h) => {
            const isPast = h.hour <= currentHour
            const todayHeight = (h.today / maxVal) * 100
            const yesterdayHeight = (h.yesterday / maxVal) * 100
            const isCurrent = h.hour === currentHour
            return (
              <div
                key={h.hour}
                className="flex h-full flex-1 items-end gap-0.5"
              >
                {/* Yesterday (ghost) */}
                <div
                  className="w-1/2 rounded-t bg-muted"
                  style={{ height: `${yesterdayHeight}%` }}
                />
                {/* Today */}
                <div
                  className={cn(
                    "w-1/2 rounded-t transition-all",
                    isCurrent
                      ? "bg-chart-3 shadow-[0_0_12px_var(--color-chart-3)]"
                      : isPast
                        ? "bg-chart-3/80"
                        : "bg-muted/40",
                  )}
                  style={{ height: isPast ? `${todayHeight}%` : "0%" }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{shiftStart}:00</span>
          <span>12:00</span>
          <span>{shiftEnd}:00</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 border-t border-border/50 pt-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3 rounded-sm bg-chart-3" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3 rounded-sm bg-muted" />
          <span className="text-muted-foreground">Yesterday</span>
        </div>
      </div>
    </Card>
  )
}
