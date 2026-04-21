"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Download,
  LayoutGrid,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  Rows3,
  Settings,
  Users,
  WifiOff,
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { useTeamScope } from "@/lib/team-scope"
import {
  loadRingCentralConfig,
  useRingCentral,
  PRESENCE_LABEL,
} from "@/lib/ringcentral"
import type { ActiveCall, RCPresence } from "@/lib/ringcentral"

import { FloorKPIs } from "@/components/calls/floor-kpis"
import { QueuePanel } from "@/components/calls/queue-panel"
import { AgentCallCard } from "@/components/calls/agent-call-card"
import { ActiveCallsTable } from "@/components/calls/active-calls-table"
import { ComplianceWatch } from "@/components/calls/compliance-watch"
import { TeamRollup } from "@/components/calls/team-rollup"

const SUPERVISOR_ROLES = new Set([
  "leadership",
  "supervisor",
  "executive",
  "admin",
])

const PRESENCE_FILTERS: Array<{ value: "all" | RCPresence; label: string }> = [
  { value: "all", label: "All Presence" },
  { value: "on_call", label: "On Call" },
  { value: "hold", label: "On Hold" },
  { value: "available", label: "Available" },
  { value: "wrap_up", label: "Wrap-up" },
  { value: "break", label: "Break" },
  { value: "lunch", label: "Lunch" },
  { value: "meeting", label: "Meeting" },
  { value: "training", label: "Training" },
  { value: "offline", label: "Offline" },
]

export default function CallsPage() {
  const { user } = useAuth()
  const scope = useTeamScope()
  const canSupervise = user ? SUPERVISOR_ROLES.has(user.role) : false

  // RingCentral connection config (from localStorage)
  const [rcConfig, setRcConfig] = React.useState(loadRingCentralConfig())
  React.useEffect(() => {
    const sync = () => setRcConfig(loadRingCentralConfig())
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  // Live polling controls
  const [paused, setPaused] = React.useState(false)
  const [intervalMs, setIntervalMs] = React.useState(1000)
  const { snapshot, refresh } = useRingCentral({ intervalMs, paused })

  // UI state
  const [view, setView] = React.useState<"grid" | "table">("grid")
  const [presenceFilter, setPresenceFilter] = React.useState<"all" | RCPresence>("all")
  const [search, setSearch] = React.useState("")
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<"live" | "rollup" | "queues" | "compliance">(
    "live",
  )

  // Pulse highlight when the snapshot refreshes
  const [pulse, setPulse] = React.useState(false)
  React.useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 350)
    return () => clearTimeout(t)
  }, [snapshot.generatedAt])

  // Filter agents by scope FIRST, then by UI filters
  const scopedAgents = React.useMemo(() => {
    if (scope.isOrgWide) return snapshot.agents
    if (scope.isSelfOnly)
      return snapshot.agents.filter((a) => a.agentId === user?.id)
    return snapshot.agents.filter((a) => scope.teamIds.includes(a.teamId))
  }, [snapshot.agents, scope, user?.id])

  const availableTeams = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const a of scopedAgents) map.set(a.teamId, a.teamName)
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [scopedAgents])

  // Reset team filter if it falls out of scope
  React.useEffect(() => {
    if (
      selectedTeamId !== "all" &&
      !availableTeams.some((t) => t.id === selectedTeamId)
    ) {
      setSelectedTeamId("all")
    }
  }, [availableTeams, selectedTeamId])

  const filteredAgents = React.useMemo(() => {
    return scopedAgents.filter((a) => {
      if (selectedTeamId !== "all" && a.teamId !== selectedTeamId) return false
      if (presenceFilter !== "all" && a.presence !== presenceFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !a.agentName.toLowerCase().includes(q) &&
          !a.teamName.toLowerCase().includes(q) &&
          !a.extension.includes(q)
        )
          return false
      }
      return true
    })
  }, [scopedAgents, selectedTeamId, presenceFilter, search])

  // Active calls in scope
  const scopedActiveCalls = React.useMemo(
    () =>
      snapshot.activeCalls.filter((c) =>
        filteredAgents.some((a) => a.agentId === c.agentId),
      ),
    [snapshot.activeCalls, filteredAgents],
  )

  // Queues — all are shared but highlight those with scoped agents
  const queues = snapshot.queues

  const handleSupervise = (
    call: ActiveCall,
    action: "listen" | "whisper" | "barge",
  ) => {
    if (!rcConfig.whisperBargeEnabled) {
      toast.warning(
        "Supervisor audio is disabled in RingCentral settings. Enable it to listen, whisper or barge.",
      )
      return
    }
    toast.success(
      `${action[0].toUpperCase() + action.slice(1)} request sent`,
      {
        description: `${call.agentName} · ${call.customerName}`,
      },
    )
  }

  const handleExport = () => {
    const rows = [
      ["Agent", "Team", "Extension", "Presence", "Customer", "Phone", "Duration (s)", "Queue"],
      ...scopedActiveCalls.map((c) => [
        c.agentName,
        c.teamName,
        snapshot.agents.find((a) => a.agentId === c.agentId)?.extension ?? "",
        "on_call",
        c.customerName,
        c.customerPhone,
        Math.floor((Date.now() - c.startedAt) / 1000).toString(),
        c.queue,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `forge-calls-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Top banner: live feed + RC connection */}
      <div
        className={cn(
          "rounded-lg border px-4 py-3 transition-colors",
          rcConfig.connected
            ? paused
              ? "border-border bg-muted/30"
              : "border-emerald-500/30 bg-emerald-500/5"
            : "border-amber-500/30 bg-amber-500/5",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {rcConfig.connected ? (
              paused ? (
                <>
                  <span className="size-3 rounded-full bg-muted-foreground" />
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                    Paused
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-xs">
                    Live · RingCentral
                  </span>
                </>
              )
            ) : (
              <>
                <WifiOff className="size-4 text-amber-400" />
                <span className="font-semibold text-amber-400 uppercase tracking-wider text-xs">
                  Simulation Mode
                </span>
              </>
            )}

            <span className="text-xs text-muted-foreground truncate">
              {rcConfig.connected
                ? `${rcConfig.syncedExtensions} extensions synced · ${snapshot.agents.length} agents visible`
                : "Connect RingCentral to stream real presence and call events"}
            </span>

            <Badge variant="outline" className="ml-auto sm:ml-0 shrink-0">
              <Users className="size-3 mr-1" />
              {scope.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={intervalMs.toString()}
              onValueChange={(v) => setIntervalMs(Number(v))}
              disabled={paused}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1s (live)</SelectItem>
                <SelectItem value="2000">2s</SelectItem>
                <SelectItem value="5000">5s</SelectItem>
                <SelectItem value="10000">10s</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant={paused ? "default" : "outline"}
              onClick={() => setPaused((p) => !p)}
              className="h-8"
            >
              {paused ? (
                <>
                  <Play className="size-3.5 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="size-3.5 mr-1" />
                  Pause
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              className="h-8 w-8 p-0"
              title="Refresh"
            >
              <RefreshCw className="size-3.5" />
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8"
              title="Floor TV Mode"
            >
              <Link href="/calls/floor">
                <Maximize2 className="size-3.5 mr-1" />
                Floor
              </Link>
            </Button>
            {canSupervise && (
              <Button asChild size="sm" variant="outline" className="h-8">
                <Link href="/calls/ringcentral">
                  <Settings className="size-3.5 mr-1" />
                  RingCentral
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Calls
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telesales floor monitor — agent presence, live calls, and
            queue health from RingCentral.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Unlicensed-state warning banner */}
      {snapshot.agents.some(
        (a) =>
          a.activeCall &&
          ["VT", "WV", "ND"].includes(a.activeCall.customerState),
      ) && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-400 shrink-0" />
          <p className="text-xs">
            <span className="font-semibold text-rose-400">
              Compliance alert:
            </span>{" "}
            one or more active calls are routed to an unlicensed state. See the
            Compliance Watch tab.
          </p>
        </div>
      )}

      {/* Floor KPIs */}
      <FloorKPIs snapshot={snapshot} pulsing={pulse && !paused} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="live">Live Floor</TabsTrigger>
          {!scope.isSelfOnly && (
            <TabsTrigger value="rollup">Team Rollup</TabsTrigger>
          )}
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* LIVE FLOOR */}
        <TabsContent value="live" className="space-y-4 mt-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search agent, team, extension…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full sm:w-[240px]"
            />
            {availableTeams.length > 1 && (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="h-9 w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All my teams ({availableTeams.length})
                  </SelectItem>
                  {availableTeams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={presenceFilter}
              onValueChange={(v) => setPresenceFilter(v as typeof presenceFilter)}
            >
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESENCE_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-1 rounded-md border border-border/50 p-0.5">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setView("table")}
              >
                <Rows3 className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Results meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filteredAgents.length} of {scopedAgents.length} agents
              {selectedTeamId !== "all" && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-foreground font-medium">
                    {availableTeams.find((t) => t.id === selectedTeamId)?.name}
                  </span>
                </>
              )}
              {presenceFilter !== "all" && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-foreground font-medium">
                    {PRESENCE_LABEL[presenceFilter]}
                  </span>
                </>
              )}
            </span>
            <span>
              {scopedActiveCalls.length} active call
              {scopedActiveCalls.length === 1 ? "" : "s"}
            </span>
          </div>

          {view === "grid" ? (
            filteredAgents.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No agents match the current filters.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAgents.map((a) => (
                  <AgentCallCard
                    key={a.agentId}
                    state={a}
                    canSupervise={canSupervise}
                    onListen={() =>
                      a.activeCall && handleSupervise(a.activeCall, "listen")
                    }
                    onWhisper={() =>
                      a.activeCall && handleSupervise(a.activeCall, "whisper")
                    }
                    onBarge={() =>
                      a.activeCall && handleSupervise(a.activeCall, "barge")
                    }
                  />
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-base"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Active calls
                </CardTitle>
                <CardDescription>
                  Every live conversation in your scope, with supervisor controls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveCallsTable
                  calls={scopedActiveCalls}
                  canSupervise={canSupervise}
                  onSupervise={handleSupervise}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TEAM ROLLUP */}
        {!scope.isSelfOnly && (
          <TabsContent value="rollup" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <TeamRollup agents={scopedAgents} />
              <Card>
                <CardHeader>
                  <CardTitle
                    className="text-base"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Active calls across my teams
                  </CardTitle>
                  <CardDescription>
                    {scopedActiveCalls.length} active call
                    {scopedActiveCalls.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActiveCallsTable
                    calls={scopedActiveCalls}
                    canSupervise={canSupervise}
                    onSupervise={handleSupervise}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* QUEUES */}
        <TabsContent value="queues" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <QueuePanel queues={queues} />
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-base"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Hot Leads
                </CardTitle>
                <CardDescription>
                  Callers flagged high-intent by routing logic. Prioritize these
                  first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scopedActiveCalls
                    .filter((c) => (c.debtEstimate ?? 0) > 45000)
                    .slice(0, 8)
                    .map((c) => (
                      <div
                        key={c.callId}
                        className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {c.customerName}
                            <span className="text-muted-foreground ml-2 text-[10px] font-mono">
                              {c.customerState}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            with {c.agentName} · {c.queue}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-primary tabular-nums">
                            ${c.debtEstimate?.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            est. debt load
                          </p>
                        </div>
                      </div>
                    ))}
                  {scopedActiveCalls.filter(
                    (c) => (c.debtEstimate ?? 0) > 45000,
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No high-intent calls active right now.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ComplianceWatch agents={scopedAgents} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle
                  className="text-base"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Today&apos;s DNC Requests
                </CardTitle>
                <CardDescription>
                  Must be suppressed across all dialers immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scopedAgents
                    .filter((a) => a.lastDisposition === "dnc_request")
                    .map((a) => (
                      <div
                        key={a.agentId}
                        className="flex items-center justify-between rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium">{a.agentName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {a.teamName}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-400 border-rose-500/30"
                        >
                          DNC
                        </Badge>
                      </div>
                    ))}
                  {scopedAgents.filter(
                    (a) => a.lastDisposition === "dnc_request",
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No DNC requests in scope today.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
