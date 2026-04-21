"use client"

import * as React from "react"
import {
  Activity,
  Coffee,
  Phone,
  PhoneForwarded,
  PowerOff,
  Radio,
  Timer,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/ringcentral"
import type { FloorSnapshot } from "@/lib/ringcentral"

interface FloorKPIsProps {
  snapshot: FloorSnapshot
  pulsing?: boolean
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  pulsing,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  tone: "brand" | "emerald" | "amber" | "blue" | "rose" | "muted" | "violet"
  pulsing?: boolean
}) {
  const tones: Record<
    "brand" | "emerald" | "amber" | "blue" | "rose" | "muted" | "violet",
    { border: string; accent: string; bg: string }
  > = {
    brand: {
      border: "border-primary/30",
      accent: "text-primary",
      bg: "from-primary/10",
    },
    emerald: {
      border: "border-emerald-500/30",
      accent: "text-emerald-400",
      bg: "from-emerald-500/10",
    },
    amber: {
      border: "border-amber-500/30",
      accent: "text-amber-400",
      bg: "from-amber-500/10",
    },
    blue: {
      border: "border-blue-500/30",
      accent: "text-blue-400",
      bg: "from-blue-500/10",
    },
    rose: {
      border: "border-rose-500/30",
      accent: "text-rose-400",
      bg: "from-rose-500/10",
    },
    muted: {
      border: "border-border/50",
      accent: "text-muted-foreground",
      bg: "from-muted/20",
    },
    violet: {
      border: "border-violet-500/30",
      accent: "text-violet-400",
      bg: "from-violet-500/10",
    },
  }
  const t = tones[tone]
  return (
    <Card className={cn("relative overflow-hidden", t.border)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none", t.bg)} />
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <Icon className={cn("size-5", t.accent)} />
          {pulsing && (
            <span className="relative flex size-2">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", t.accent.replace("text-", "bg-"))} />
              <span className={cn("relative inline-flex rounded-full size-2", t.accent.replace("text-", "bg-"))} />
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-2xl font-bold tabular-nums leading-none transition-transform duration-200",
            pulsing && "scale-[1.02]",
          )}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
          {label}
        </p>
        {sub && (
          <p className={cn("text-[10px] mt-1 font-medium", t.accent)}>{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function FloorKPIs({ snapshot, pulsing }: FloorKPIsProps) {
  const { totals } = snapshot
  const staffed =
    totals.agentsOnCall +
    totals.agentsAvailable +
    totals.agentsOnBreak

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8 gap-3">
      <Kpi
        label="On Call"
        value={totals.agentsOnCall}
        sub={`of ${staffed} staffed`}
        icon={Phone}
        tone="blue"
        pulsing={pulsing && totals.agentsOnCall > 0}
      />
      <Kpi
        label="Available"
        value={totals.agentsAvailable}
        sub="ready to dial"
        icon={Radio}
        tone="emerald"
        pulsing={pulsing}
      />
      <Kpi
        label="Away"
        value={totals.agentsOnBreak}
        sub="break / lunch / meeting"
        icon={Coffee}
        tone="amber"
      />
      <Kpi
        label="Offline"
        value={totals.agentsOffline}
        icon={PowerOff}
        tone="muted"
      />
      <Kpi
        label="Calls in Queue"
        value={totals.callsInQueue}
        sub={
          totals.longestWaitSec > 0
            ? `longest ${formatDuration(totals.longestWaitSec)}`
            : "all caught up"
        }
        icon={PhoneForwarded}
        tone={totals.callsInQueue > 4 ? "rose" : "brand"}
        pulsing={pulsing && totals.callsInQueue > 0}
      />
      <Kpi
        label="Service Level"
        value={`${totals.serviceLevelPct}%`}
        sub="answered within 20s"
        icon={TrendingUp}
        tone={totals.serviceLevelPct >= 85 ? "emerald" : totals.serviceLevelPct >= 75 ? "amber" : "rose"}
      />
      <Kpi
        label="Avg Handle Time"
        value={formatDuration(totals.avgHandleTimeSec)}
        sub="talk + wrap"
        icon={Timer}
        tone="violet"
      />
      <Kpi
        label="Enrolled Today"
        value={totals.enrolledToday}
        sub={`${totals.totalCallsToday} calls handled`}
        icon={Activity}
        tone="brand"
        pulsing={pulsing}
      />
    </div>
  )
}
