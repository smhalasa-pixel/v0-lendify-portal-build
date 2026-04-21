"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Wallet, Trophy } from "lucide-react"

type Props = {
  todayEarned: number
  mtdEarned: number
  projectedPayout: number
  personalBest: number
  periodLabel?: string // e.g. "Today", "This Week", "Oct 1–15"
  isLive?: boolean // true only when period === "today"
}

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

export function MoneyTicker({
  todayEarned,
  mtdEarned,
  projectedPayout,
  personalBest,
  periodLabel = "Today",
  isLive = true,
}: Props) {
  const animated = useCountUp(todayEarned)
  const isRecord = todayEarned > 0 && todayEarned >= personalBest

  return (
    <Card className="relative overflow-hidden border-chart-3/20 bg-gradient-to-br from-card to-chart-3/5 p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-chart-3/15 blur-2xl"
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-chart-3/20">
            <Wallet className="size-4 text-chart-3" />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Money Earned {periodLabel}
            </div>
            <div className="text-xs text-muted-foreground">
              {isLive ? "Live commission tally" : "Commission total for period"}
            </div>
          </div>
        </div>
        {isRecord && (
          <div className="flex items-center gap-1 rounded-full border border-chart-5/40 bg-chart-5/10 px-2 py-1 text-[11px] font-semibold text-chart-5">
            <Trophy className="size-3" />
            New record
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <div className="flex items-baseline gap-1">
          <DollarSign className="size-6 text-chart-3 lg:size-7" />
          <div className="font-mono text-4xl font-bold tabular-nums lg:text-5xl">
            {Math.round(animated).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-border/50 pt-4">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {isLive ? "Month to date" : "MTD total"}
          </div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums">
            {fmt(mtdEarned)}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="size-3" />
            {isLive ? "Projected payout" : "Avg per day"}
          </div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-chart-3">
            {fmt(projectedPayout)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {isLive ? "Personal best" : "Best day in period"}
          </div>
          <div className="mt-0.5 font-mono text-sm font-bold tabular-nums">
            {fmt(personalBest)}
          </div>
        </div>
      </div>
    </Card>
  )
}
