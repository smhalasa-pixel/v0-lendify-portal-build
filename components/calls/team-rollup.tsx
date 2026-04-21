"use client"

import * as React from "react"
import { Phone, Coffee, Radio, PowerOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/ringcentral"
import type { AgentTelephonyState } from "@/lib/ringcentral"

interface TeamRollupProps {
  agents: AgentTelephonyState[]
}

interface TeamSummary {
  teamId: string
  teamName: string
  leaderName?: string
  total: number
  onCall: number
  available: number
  away: number
  offline: number
  callsHandled: number
  enrolledToday: number
  avgAHT: number
  avgAdherence: number
}

/** Summarises telephony state grouped by team - great for supervisor views. */
export function TeamRollup({ agents }: TeamRollupProps) {
  const summaries = React.useMemo<TeamSummary[]>(() => {
    const byTeam = new Map<string, AgentTelephonyState[]>()
    for (const a of agents) {
      if (!byTeam.has(a.teamId)) byTeam.set(a.teamId, [])
      byTeam.get(a.teamId)!.push(a)
    }
    return Array.from(byTeam.entries()).map(([teamId, list]) => {
      const onCall = list.filter(
        (a) => a.presence === "on_call" || a.presence === "hold",
      ).length
      const available = list.filter((a) => a.presence === "available").length
      const away = list.filter(
        (a) =>
          a.presence === "break" ||
          a.presence === "lunch" ||
          a.presence === "meeting" ||
          a.presence === "training",
      ).length
      const offline = list.filter((a) => a.presence === "offline").length
      const callsHandled = list.reduce((s, a) => s + a.callsHandled, 0)
      const enrolledToday = list.reduce((s, a) => s + a.enrolledToday, 0)
      const avgAHT = Math.round(
        list.reduce((s, a) => s + a.avgHandleTimeSec, 0) / Math.max(list.length, 1),
      )
      const avgAdherence = Math.round(
        list.reduce((s, a) => s + a.scriptAdherence, 0) /
          Math.max(list.length, 1),
      )
      return {
        teamId,
        teamName: list[0]?.teamName ?? teamId,
        leaderName: list[0]?.leaderName,
        total: list.length,
        onCall,
        available,
        away,
        offline,
        callsHandled,
        enrolledToday,
        avgAHT,
        avgAdherence,
      }
    })
  }, [agents])

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No team data available in scope.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle
          className="text-base"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Team Rollups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaries.map((t) => {
          const occupancy = (t.onCall / Math.max(t.total, 1)) * 100
          return (
            <div
              key={t.teamId}
              className="rounded-lg border border-border/50 bg-card/40 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{t.teamName}</p>
                  {t.leaderName && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      Led by {t.leaderName}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-mono"
                >
                  {t.total} agents
                </Badge>
              </div>

              {/* Presence distribution bars */}
              <div className="grid grid-cols-4 gap-1 mb-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-blue-400">
                    <Phone className="size-2.5" />
                    {t.onCall}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400">
                    <Radio className="size-2.5" />
                    {t.available}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400">
                    <Coffee className="size-2.5" />
                    {t.away}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <PowerOff className="size-2.5" />
                    {t.offline}
                  </div>
                </div>
              </div>

              <Progress
                value={occupancy}
                className={cn(
                  "h-1.5",
                  occupancy >= 70 && "[&>div]:bg-emerald-500",
                  occupancy >= 40 &&
                    occupancy < 70 &&
                    "[&>div]:bg-amber-500",
                  occupancy < 40 && "[&>div]:bg-rose-500",
                )}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Occupancy: {occupancy.toFixed(0)}%
              </p>

              {/* Team KPI trio */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/40">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Calls
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {t.callsHandled}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Enrolled
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-primary">
                    {t.enrolledToday}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Avg AHT
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatDuration(t.avgAHT)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
