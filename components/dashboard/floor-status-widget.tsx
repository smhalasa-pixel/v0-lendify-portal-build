"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  Coffee,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PowerOff,
  Radio,
  Timer,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useTeamScope } from "@/lib/team-scope"
import {
  useRingCentral,
  formatDuration,
  type AgentTelephonyState,
} from "@/lib/ringcentral"

export function FloorStatusWidget() {
  const scope = useTeamScope()
  // Refresh every 5s on the dashboard so it's live but not hammering
  const { snapshot } = useRingCentral({ intervalMs: 5000 })

  // Scope down to the agents this user can see
  const agents = React.useMemo<AgentTelephonyState[]>(() => {
    if (scope.isOrgWide) return snapshot.agents
    if (scope.isSelfOnly) {
      return snapshot.agents.filter((a) =>
        scope.agentIds.includes(a.agentId),
      )
    }
    const allowed = new Set(scope.teamIds)
    return snapshot.agents.filter((a) => allowed.has(a.teamId))
  }, [snapshot.agents, scope])

  const scopedAgentIds = React.useMemo(
    () => new Set(agents.map((a) => a.agentId)),
    [agents],
  )

  const activeCalls = React.useMemo(
    () => snapshot.activeCalls.filter((c) => scopedAgentIds.has(c.agentId)),
    [snapshot.activeCalls, scopedAgentIds],
  )

  const totals = React.useMemo(() => {
    const onCall = agents.filter(
      (a) => a.presence === "on_call" || a.presence === "hold",
    ).length
    const available = agents.filter((a) => a.presence === "available").length
    const afterWork = agents.filter((a) => a.presence === "wrap_up").length
    const onBreak = agents.filter(
      (a) =>
        a.presence === "break" ||
        a.presence === "lunch" ||
        a.presence === "training" ||
        a.presence === "meeting",
    ).length
    const offline = agents.filter((a) => a.presence === "offline").length

    const callsToday = agents.reduce((s, a) => s + a.callsHandled, 0)
    const enrolledToday = agents.reduce((s, a) => s + a.enrolledToday, 0)
    const ahtAvg =
      agents.length === 0
        ? 0
        : Math.round(
            agents.reduce((s, a) => s + a.avgHandleTimeSec, 0) / agents.length,
          )

    // Conversion: enrolled / callsToday (defensive guard)
    const convRate = callsToday > 0 ? (enrolledToday / callsToday) * 100 : 0

    return {
      onCall,
      available,
      afterWork,
      onBreak,
      offline,
      callsToday,
      ahtAvg,
      convRate,
    }
  }, [agents])

  const total = agents.length || 1
  const utilization = Math.round((totals.onCall / total) * 100)

  const longestCall = React.useMemo(
    () =>
      activeCalls.length === 0
        ? null
        : activeCalls.reduce(
            (best, c) => (c.durationSec > best.durationSec ? c : best),
            activeCalls[0],
          ),
    [activeCalls],
  )

  // Attention flags
  const now = Date.now()
  const longIdle = agents.filter(
    (a) => a.presence === "available" && now - a.presenceSince > 5 * 60 * 1000,
  ).length
  const longACW = agents.filter(
    (a) => a.presence === "wrap_up" && now - a.presenceSince > 3 * 60 * 1000,
  ).length

  return (
    <Card className="border-border/40 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <Radio className="size-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <CardTitle className="text-base truncate">
                Live Floor Status
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-wider border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shrink-0"
              >
                Live
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs truncate">
              {scope.isOrgWide
                ? "Entire floor · refreshes every 5s"
                : `${scope.label} · refreshes every 5s`}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <Link href="/calls" className="flex items-center gap-1">
              Open
              <ArrowUpRight className="size-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status breakdown bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              Floor utilization
            </span>
            <span className="text-xs font-mono font-medium text-foreground">
              {utilization}%
            </span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(totals.onCall / total) * 100}%` }}
              title={`${totals.onCall} on call`}
            />
            <div
              className="bg-sky-500 transition-all"
              style={{ width: `${(totals.available / total) * 100}%` }}
              title={`${totals.available} available`}
            />
            <div
              className="bg-amber-500 transition-all"
              style={{ width: `${(totals.afterWork / total) * 100}%` }}
              title={`${totals.afterWork} ACW`}
            />
            <div
              className="bg-orange-500 transition-all"
              style={{ width: `${(totals.onBreak / total) * 100}%` }}
              title={`${totals.onBreak} break`}
            />
            <div
              className="bg-muted-foreground/30 transition-all"
              style={{ width: `${(totals.offline / total) * 100}%` }}
              title={`${totals.offline} offline`}
            />
          </div>
        </div>

        {/* Status tiles */}
        <div className="grid grid-cols-5 gap-2">
          <StatusTile
            icon={<PhoneCall className="size-3.5" />}
            label="On Call"
            value={totals.onCall}
            color="emerald"
          />
          <StatusTile
            icon={<Phone className="size-3.5" />}
            label="Avail."
            value={totals.available}
            color="sky"
          />
          <StatusTile
            icon={<PhoneForwarded className="size-3.5" />}
            label="ACW"
            value={totals.afterWork}
            color="amber"
          />
          <StatusTile
            icon={<Coffee className="size-3.5" />}
            label="Break"
            value={totals.onBreak}
            color="orange"
          />
          <StatusTile
            icon={<PowerOff className="size-3.5" />}
            label="Offline"
            value={totals.offline}
            color="slate"
          />
        </div>

        {/* Today's KPIs */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
          <KpiMini
            label="Calls Today"
            value={totals.callsToday.toLocaleString()}
          />
          <KpiMini
            label="Avg Handle"
            value={
              totals.ahtAvg >= 60
                ? `${Math.round(totals.ahtAvg / 60)}m`
                : `${totals.ahtAvg}s`
            }
          />
          <KpiMini
            label="Conv. Rate"
            value={`${totals.convRate.toFixed(1)}%`}
          />
        </div>

        {/* Attention signals */}
        {(longIdle > 0 ||
          longACW > 0 ||
          (longestCall && longestCall.durationSec > 900)) && (
          <div className="flex flex-wrap gap-1.5">
            {longIdle > 0 && (
              <AttentionBadge
                icon={<Timer className="size-3" />}
                label={`${longIdle} idle > 5m`}
                variant="warn"
              />
            )}
            {longACW > 0 && (
              <AttentionBadge
                icon={<Activity className="size-3" />}
                label={`${longACW} ACW > 3m`}
                variant="warn"
              />
            )}
            {longestCall && longestCall.durationSec > 900 && (
              <AttentionBadge
                icon={<AlertTriangle className="size-3" />}
                label={`Long call: ${formatDuration(longestCall.durationSec)}`}
                variant="danger"
              />
            )}
          </div>
        )}

        {/* Longest active call deeplink */}
        {longestCall && (
          <Link
            href="/calls"
            className="block rounded-md border border-border/40 bg-muted/20 px-2.5 py-2 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Longest live call
                  </span>
                </div>
                <div className="text-xs font-medium text-foreground truncate mt-0.5">
                  {longestCall.agentName}
                  <span className="text-muted-foreground font-normal">
                    {" · "}
                    {longestCall.customerState}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-semibold text-emerald-400">
                  {formatDuration(longestCall.durationSec)}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {longestCall.direction}
                  {longestCall.onHold && " · hold"}
                </div>
              </div>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function StatusTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: "emerald" | "sky" | "amber" | "orange" | "slate"
}) {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/5 border-sky-500/20",
    amber: "text-amber-400 bg-amber-500/5 border-amber-500/20",
    orange: "text-orange-400 bg-orange-500/5 border-orange-500/20",
    slate: "text-muted-foreground bg-muted/20 border-border/40",
  }
  return (
    <div
      className={cn(
        "rounded-md border px-1.5 py-2 flex flex-col items-center gap-0.5",
        colorClasses[color],
      )}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-base font-mono font-semibold leading-none">
          {value}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-wider opacity-70">
        {label}
      </span>
    </div>
  )
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}

function AttentionBadge({
  icon,
  label,
  variant,
}: {
  icon: React.ReactNode
  label: string
  variant: "warn" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border",
        variant === "warn"
          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
          : "text-rose-400 bg-rose-500/10 border-rose-500/30",
      )}
    >
      {icon}
      {label}
    </span>
  )
}
