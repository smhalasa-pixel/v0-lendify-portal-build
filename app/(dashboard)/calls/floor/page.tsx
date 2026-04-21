"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Phone,
  PhoneForwarded,
  Radio,
  ShieldAlert,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useTeamScope } from "@/lib/team-scope"
import {
  useRingCentral,
  PRESENCE_COLOR,
  PRESENCE_LABEL,
  formatDuration,
} from "@/lib/ringcentral"
import { ForgeLogo } from "@/components/forge-logo"

/**
 * Floor TV Mode
 *
 * High-contrast, high-density view designed for wall-mounted TVs on the
 * telesales floor. Big numbers, pulsing live calls, top-of-board leaderboards.
 */
export default function CallsFloorPage() {
  const { user } = useAuth()
  const scope = useTeamScope()
  const { snapshot } = useRingCentral({ intervalMs: 1000 })

  const [fullscreen, setFullscreen] = React.useState(false)

  const scopedAgents = React.useMemo(() => {
    if (scope.isOrgWide) return snapshot.agents
    if (scope.isSelfOnly) return snapshot.agents
    return snapshot.agents.filter((a) => scope.teamIds.includes(a.teamId))
  }, [snapshot.agents, scope])

  // Top performers within scope
  const topPerformers = React.useMemo(
    () =>
      [...scopedAgents]
        .sort((a, b) => b.enrolledToday - a.enrolledToday || b.conversionsToday - a.conversionsToday)
        .slice(0, 5),
    [scopedAgents],
  )

  // Group agents by team for floor display
  const byTeam = React.useMemo(() => {
    const map = new Map<string, typeof scopedAgents>()
    for (const a of scopedAgents) {
      if (!map.has(a.teamId)) map.set(a.teamId, [])
      map.get(a.teamId)!.push(a)
    }
    return Array.from(map.entries()).map(([teamId, agents]) => ({
      teamId,
      teamName: agents[0]?.teamName ?? teamId,
      agents,
    }))
  }, [scopedAgents])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
      setFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setFullscreen(false)
    }
  }

  const onCall = snapshot.totals.agentsOnCall
  const avail = snapshot.totals.agentsAvailable
  const enrolled = snapshot.totals.enrolledToday
  const callsToday = snapshot.totals.totalCallsToday

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 flex flex-col gap-4">
      {/* Floor toolbar */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/calls">
              <ArrowLeft className="size-4 mr-1" />
              Exit Floor
            </Link>
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <ForgeLogo variant="icon-dark" width={28} ariaLabel="" />
            <span
              className="text-xl font-bold tracking-[0.22em]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              FLOOR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
            Live
          </span>
          <Badge variant="outline" className="ml-2">
            {scope.label}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="ml-2"
          >
            {fullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Big 4 Score */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FloorStat
          label="On Call"
          value={onCall}
          color="text-blue-400"
          icon={<Phone className="size-8 text-blue-400" />}
          pulse
        />
        <FloorStat
          label="Available"
          value={avail}
          color="text-emerald-400"
          icon={<Radio className="size-8 text-emerald-400" />}
          pulse
        />
        <FloorStat
          label="Enrolled Today"
          value={enrolled}
          color="text-primary"
          icon={<Trophy className="size-8 text-primary" />}
          big
        />
        <FloorStat
          label="Calls Today"
          value={callsToday}
          color="text-foreground"
          icon={<PhoneForwarded className="size-8 text-foreground" />}
        />
      </div>

      {/* Hall of Today + Teams */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-4 flex-1 min-h-0">
        {/* Top performers */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-primary/10 to-background p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-5 text-primary" />
            <h2
              className="text-lg font-bold tracking-[0.15em] uppercase"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Top Today
            </h2>
          </div>
          <div className="space-y-2 flex-1 overflow-auto">
            {topPerformers.map((a, idx) => (
              <div
                key={a.agentId}
                className={cn(
                  "rounded-lg border p-3 flex items-center gap-3",
                  idx === 0
                    ? "border-primary/40 bg-primary/15"
                    : "border-border/50 bg-card/40",
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    idx === 0 &&
                      "bg-primary/30 text-primary ring-2 ring-primary/40",
                    idx === 1 && "bg-slate-400/20 text-slate-300",
                    idx === 2 && "bg-amber-600/20 text-amber-400",
                    idx > 2 && "bg-muted text-muted-foreground",
                  )}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.agentName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {a.teamName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-xl font-bold tabular-nums text-primary"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {a.enrolledToday}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    enrolled
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents by team */}
        <div className="space-y-4 overflow-auto">
          {byTeam.map((team) => (
            <div
              key={team.teamId}
              className="rounded-xl border border-border/50 bg-card/30 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-sm font-bold tracking-[0.18em] uppercase text-muted-foreground"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {team.teamName}
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-blue-400 tabular-nums">
                    {team.agents.filter((a) => a.presence === "on_call").length}{" "}
                    on call
                  </span>
                  <span className="text-emerald-400 tabular-nums">
                    {team.agents.filter((a) => a.presence === "available").length}{" "}
                    avail
                  </span>
                  <span className="text-primary tabular-nums font-semibold">
                    {team.agents.reduce((s, a) => s + a.enrolledToday, 0)} enr
                  </span>
                </div>
              </div>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {team.agents.map((a) => {
                  const p = PRESENCE_COLOR[a.presence]
                  const onCallNow = !!a.activeCall
                  return (
                    <div
                      key={a.agentId}
                      className={cn(
                        "rounded-md border px-2 py-1.5 transition-colors min-w-0",
                        p.border,
                        onCallNow
                          ? "bg-blue-500/10 ring-1 ring-blue-500/40"
                          : "bg-card/40",
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            p.dot,
                            onCallNow && "animate-pulse",
                          )}
                        />
                        <span className="text-xs font-medium truncate">
                          {a.agentName.split(" ")[0]}{" "}
                          {a.agentName.split(" ").slice(1, 2).map((n) => n[0]).join("")}
                        </span>
                      </div>
                      {onCallNow ? (
                        <p
                          className="text-sm font-bold tabular-nums text-blue-400 mt-0.5"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {formatDuration(
                            Math.floor(
                              (Date.now() - a.activeCall!.startedAt) / 1000,
                            ),
                          )}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {PRESENCE_LABEL[a.presence]}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {byTeam.length === 0 && (
            <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground">
                No agents in scope right now.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compliance ticker */}
      {snapshot.totals.dncRequestsToday > 0 && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/5 px-3 py-2 flex items-center gap-3">
          <ShieldAlert className="size-4 text-rose-400 shrink-0" />
          <p className="text-sm">
            <span className="font-bold text-rose-400">
              {snapshot.totals.dncRequestsToday}
            </span>{" "}
            DNC request{snapshot.totals.dncRequestsToday === 1 ? "" : "s"} logged
            today — suppress and re-scrub lists.
          </p>
        </div>
      )}
    </div>
  )
}

function FloorStat({
  label,
  value,
  color,
  icon,
  pulse,
  big,
}: {
  label: string
  value: string | number
  color: string
  icon: React.ReactNode
  pulse?: boolean
  big?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/40 p-4 sm:p-6 flex items-center gap-4",
        big && "border-primary/30 bg-gradient-to-br from-primary/10 to-background",
      )}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">
        <p
          className={cn(
            "text-4xl sm:text-6xl font-bold tabular-nums leading-none",
            color,
            pulse && "transition-transform",
          )}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </p>
        <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground mt-2">
          {label}
        </p>
      </div>
    </div>
  )
}
