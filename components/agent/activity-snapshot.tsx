"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Phone,
  PhoneIncoming,
  Timer,
  TrendingUp,
  Users,
  Calendar,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  todayDials: number
  yesterdayDials: number
  todayConnects: number
  talkTimeMinutes: number
  avgHandleSeconds: number
  pipelineCount: number
  pipelineValue: number
  callbacksScheduled: number
  followUpsDue: number
  periodLabel?: string
  isLive?: boolean
}

function formatTalkTime(mins: number) {
  if (mins < 60) return `${Math.round(mins)}m`
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return `${h}h ${m}m`
}

function formatAHT(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

type RowProps = {
  icon: React.ComponentType<{ className?: string }>
  iconClass: string
  label: string
  value: string | number
  sub?: string
  trend?: { value: number; positive?: boolean } | null
}

function Row({ icon: Icon, iconClass, label, value, sub, trend }: RowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          iconClass,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          {trend && (
            <div
              className={cn(
                "text-[10px] font-bold tabular-nums",
                trend.positive ? "text-chart-3" : "text-muted-foreground",
              )}
            >
              {trend.positive ? "+" : ""}
              {trend.value}
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-mono text-lg font-bold tabular-nums leading-tight">
            {value}
          </div>
          {sub && (
            <div className="text-[11px] text-muted-foreground">{sub}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ActivitySnapshot({
  todayDials,
  yesterdayDials,
  todayConnects,
  talkTimeMinutes,
  avgHandleSeconds,
  pipelineCount,
  pipelineValue,
  callbacksScheduled,
  followUpsDue,
  periodLabel = "Today",
  isLive = true,
}: Props) {
  const connectRate =
    todayDials > 0 ? (todayConnects / todayDials) * 100 : 0
  const dialsDelta = todayDials - yesterdayDials

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/20">
            <Activity className="size-4 text-chart-2" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {isLive ? "Today's Activity" : `Activity · ${periodLabel}`}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Dials, talk time, pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <Row
          icon={Phone}
          iconClass="bg-chart-2/15 text-chart-2"
          label={isLive ? "Dials today" : `Dials · ${periodLabel}`}
          value={todayDials}
          sub={isLive ? `vs ${yesterdayDials} yesterday` : `Avg ${Math.round(yesterdayDials)}/day`}
          trend={
            isLive && dialsDelta !== 0
              ? { value: dialsDelta, positive: dialsDelta > 0 }
              : null
          }
        />
        <Row
          icon={PhoneIncoming}
          iconClass="bg-chart-4/15 text-chart-4"
          label="Connect rate"
          value={`${connectRate.toFixed(1)}%`}
          sub={`${todayConnects} connected`}
        />
        <Row
          icon={Timer}
          iconClass="bg-chart-5/15 text-chart-5"
          label="Talk time"
          value={formatTalkTime(talkTimeMinutes)}
          sub={`AHT ${formatAHT(avgHandleSeconds)}`}
        />
        <Row
          icon={Users}
          iconClass="bg-primary/15 text-primary"
          label="Active pipeline"
          value={pipelineCount}
          sub={formatMoney(pipelineValue)}
        />
        <Row
          icon={Calendar}
          iconClass="bg-chart-3/15 text-chart-3"
          label="Callbacks"
          value={callbacksScheduled}
          sub={`${followUpsDue} follow-ups due`}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-2.5">
        <TrendingUp className="size-3.5 text-chart-3" />
        <div className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {isLive ? "Keep dialing." : "Historical conversion ratio."}
          </span>{" "}
          Every 10 dials ≈ 1 enrollment at your current rate.
        </div>
      </div>
    </Card>
  )
}
