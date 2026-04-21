"use client"

import * as React from "react"
import {
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  User as UserIcon,
  Users,
  Calendar as CalendarIcon,
  Flame,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { useTeamScope, getScopedAgents } from "@/lib/team-scope"
import { dataService, mockUsers } from "@/lib/mock-data"

type SessionStatus = "upcoming" | "completed" | "overdue"

interface CoachingSession {
  id: string
  agentId: string
  agentName: string
  teamId: string
  teamName: string
  coachId: string
  coachName: string
  scheduledFor: string
  status: SessionStatus
  focus: string
  lastQaScore?: number
  actionItems: number
  actionItemsDone: number
  notes?: string
}

// Deterministic PRNG so page is stable between renders
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function rnd(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

const FOCUS_AREAS = [
  "Opening script adherence",
  "Discovery questions",
  "Objection handling: cost",
  "Objection handling: trust",
  "Closing technique",
  "Call control & pacing",
  "Compliance disclosures",
  "Urgency & tie-downs",
  "Debt stack analysis",
  "Payment structure explanation",
]

function buildMockSessions(): CoachingSession[] {
  const agents = mockUsers.filter((u) => u.role === "agent")
  const leaders = mockUsers.filter((u) => u.role === "leadership")
  const now = Date.now()
  const sessions: CoachingSession[] = []

  agents.forEach((agent, i) => {
    const lead = leaders.find((l) => l.teamId === agent.teamId) ?? leaders[0]
    const seed = hash(agent.id)
    const sessionCount = 1 + Math.floor(rnd(seed) * 3) // 1-3 sessions per agent

    for (let s = 0; s < sessionCount; s++) {
      const offsetHours = Math.floor(rnd(seed + s) * 480) - 96 // -96h to +384h
      const when = new Date(now + offsetHours * 3600 * 1000)
      const status: SessionStatus =
        offsetHours > 0
          ? "upcoming"
          : offsetHours < -72
          ? rnd(seed + s + 1) > 0.65
            ? "overdue"
            : "completed"
          : "completed"
      const actionItems = 2 + Math.floor(rnd(seed + s + 2) * 4)
      const actionItemsDone =
        status === "completed"
          ? actionItems
          : status === "upcoming"
          ? 0
          : Math.floor(rnd(seed + s + 3) * actionItems)

      sessions.push({
        id: `CS-${(3000 + i * 10 + s).toString().padStart(5, "0")}`,
        agentId: agent.id,
        agentName: agent.name,
        teamId: agent.teamId ?? "unassigned",
        teamName: agent.teamName ?? "Unassigned",
        coachId: lead?.id ?? "coach-default",
        coachName: lead?.name ?? "Unassigned",
        scheduledFor: when.toISOString(),
        status,
        focus: FOCUS_AREAS[(i + s) % FOCUS_AREAS.length],
        lastQaScore: 58 + Math.floor(rnd(seed + s + 4) * 38),
        actionItems,
        actionItemsDone,
        notes:
          status === "completed"
            ? "Agent demonstrated good recovery after objection. Needs more work on transitioning to the close."
            : undefined,
      })
    }
  })

  return sessions.sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
  )
}

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime()
  const now = Date.now()
  const diffMin = Math.round((d - now) / 60000)
  const absMin = Math.abs(diffMin)
  if (absMin < 60) return diffMin >= 0 ? `in ${absMin}m` : `${absMin}m ago`
  const h = Math.round(absMin / 60)
  if (h < 24) return diffMin >= 0 ? `in ${h}h` : `${h}h ago`
  const days = Math.round(h / 24)
  return diffMin >= 0 ? `in ${days}d` : `${days}d ago`
}

const STATUS_CFG: Record<
  SessionStatus,
  { color: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  upcoming: {
    color: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    label: "Upcoming",
    icon: Clock,
  },
  completed: {
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    label: "Completed",
    icon: CheckCircle2,
  },
  overdue: {
    color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    label: "Overdue",
    icon: AlertCircle,
  },
}

export default function CoachingPage() {
  const { user } = useAuth()
  const scope = useTeamScope()

  const allSessions = React.useMemo(() => buildMockSessions(), [])

  // Filter sessions by scope
  const scopedSessions = React.useMemo(() => {
    if (scope.isOrgWide) return allSessions
    if (scope.isSelfOnly && user)
      return allSessions.filter(
        (s) => s.agentId === user.id || s.coachId === user.id,
      )
    return allSessions.filter((s) => scope.teamIds.includes(s.teamId))
  }, [allSessions, scope, user])

  // Scoped agents (who could have coaching)
  const scopedAgents = React.useMemo(() => {
    if (scope.isOrgWide) return mockUsers.filter((u) => u.role === "agent")
    return getScopedAgents(scope)
  }, [scope])

  const upcoming = scopedSessions.filter((s) => s.status === "upcoming").length
  const overdue = scopedSessions.filter((s) => s.status === "overdue").length
  const completed = scopedSessions.filter((s) => s.status === "completed")
  const avgQa =
    completed.length === 0
      ? 0
      : Math.round(
          completed.reduce((s, x) => s + (x.lastQaScore || 0), 0) /
            completed.length,
        )
  const completionRate =
    scopedSessions.length === 0
      ? 0
      : Math.round(
          (scopedSessions.reduce((s, x) => s + x.actionItemsDone, 0) /
            Math.max(
              scopedSessions.reduce((s, x) => s + x.actionItems, 0),
              1,
            )) *
            100,
        )

  // Agents who need coaching the most - low QA, no recent session
  const agentsNeedingCoaching = React.useMemo(() => {
    const result: Array<{
      agentId: string
      agentName: string
      teamName: string
      avgScore: number
      lastSession?: CoachingSession
      daysSinceLast: number
    }> = []
    scopedAgents.forEach((a) => {
      const agentSessions = scopedSessions.filter((s) => s.agentId === a.id)
      const completedSess = agentSessions.filter((s) => s.status === "completed")
      const avg =
        completedSess.length === 0
          ? 0
          : Math.round(
              completedSess.reduce((s, x) => s + (x.lastQaScore || 0), 0) /
                completedSess.length,
            )
      const last = completedSess.sort(
        (x, y) =>
          new Date(y.scheduledFor).getTime() - new Date(x.scheduledFor).getTime(),
      )[0]
      const daysSince = last
        ? Math.floor(
            (Date.now() - new Date(last.scheduledFor).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 999
      result.push({
        agentId: a.id,
        agentName: a.name,
        teamName: a.teamName ?? "Unassigned",
        avgScore: avg,
        lastSession: last,
        daysSinceLast: daysSince,
      })
    })
    return result
      .filter((r) => r.avgScore < 80 || r.daysSinceLast > 14)
      .sort((a, b) => {
        // Lowest score first, then oldest session first
        if (a.avgScore !== b.avgScore) return a.avgScore - b.avgScore
        return b.daysSinceLast - a.daysSinceLast
      })
      .slice(0, 6)
  }, [scopedAgents, scopedSessions])

  const [createOpen, setCreateOpen] = React.useState(false)

  const scopeLabel =
    scope.level === "org"
      ? "All teams"
      : scope.level === "teams"
      ? `Your ${scope.teamIds.length} teams`
      : scope.level === "team"
      ? scope.teamNames[0] ?? "Your team"
      : "Your sessions"

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Coaching
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            1:1 sessions, skill development, and action-item tracking.{" "}
            <span className="text-primary font-medium">Scope: {scopeLabel}</span>
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Coaching Session</DialogTitle>
              <DialogDescription>
                Book a 1:1 with an agent on your team. The agent will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {scopedAgents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} - {a.teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Focus Area</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="What are you coaching on?" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUS_AREAS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Agenda / Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="Key talking points, recent calls to review, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCreateOpen(false)}>Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="size-3.5" /> Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {upcoming}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="size-3.5" /> Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold tabular-nums text-rose-400"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {overdue}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="size-3.5" /> Avg QA Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold tabular-nums text-primary"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {avgQa}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-3.5" /> Action-Item Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {completionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents flagged for coaching */}
      {!scope.isSelfOnly && agentsNeedingCoaching.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-amber-400" />
              <CardTitle className="text-base">Coaching Focus List</CardTitle>
            </div>
            <CardDescription>
              Agents with low QA scores or no recent 1:1 - prioritize these this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {agentsNeedingCoaching.map((a) => (
                <div
                  key={a.agentId}
                  className="flex items-center gap-3 rounded-md border border-border/50 bg-card/60 p-3"
                >
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {a.agentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.agentName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {a.teamName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono",
                        a.avgScore > 0 && a.avgScore < 70
                          ? "border-rose-500/40 text-rose-400"
                          : a.avgScore > 0 && a.avgScore < 80
                          ? "border-amber-500/40 text-amber-400"
                          : "border-muted/40 text-muted-foreground",
                      )}
                    >
                      QA {a.avgScore || "--"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">
                      {a.daysSinceLast === 999
                        ? "Never"
                        : `${a.daysSinceLast}d ago`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sessions</CardTitle>
          <CardDescription>
            {scopedSessions.length} {scopedSessions.length === 1 ? "session" : "sessions"} in your view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({scopedSessions.length})</TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcoming})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({overdue})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completed.length})
              </TabsTrigger>
            </TabsList>
            {(["all", "upcoming", "overdue", "completed"] as const).map(
              (tab) => {
                const filtered =
                  tab === "all"
                    ? scopedSessions
                    : scopedSessions.filter((s) => s.status === tab)
                return (
                  <TabsContent key={tab} value={tab} className="mt-4">
                    <SessionTable sessions={filtered} />
                  </TabsContent>
                )
              },
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function SessionTable({ sessions }: { sessions: CoachingSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="size-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No sessions in this view</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border/50">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Agent</th>
            <th className="text-left px-4 py-3 font-semibold">Team</th>
            <th className="text-left px-4 py-3 font-semibold">Coach</th>
            <th className="text-left px-4 py-3 font-semibold">Focus</th>
            <th className="text-left px-4 py-3 font-semibold">When</th>
            <th className="text-left px-4 py-3 font-semibold">QA</th>
            <th className="text-left px-4 py-3 font-semibold">Status</th>
            <th className="text-left px-4 py-3 font-semibold">Action Items</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {sessions.map((s) => {
            const cfg = STATUS_CFG[s.status]
            const Icon = cfg.icon
            return (
              <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {s.agentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{s.agentName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {s.teamName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.coachName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="size-3 text-muted-foreground" />
                    {s.focus}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {formatRelative(s.scheduledFor)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {s.lastQaScore ? (
                    <span
                      className={cn(
                        "font-mono text-xs font-semibold",
                        s.lastQaScore >= 85
                          ? "text-emerald-400"
                          : s.lastQaScore >= 70
                          ? "text-amber-400"
                          : "text-rose-400",
                      )}
                    >
                      {s.lastQaScore}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cfg.color}>
                    <Icon className="size-3 mr-1" />
                    {cfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span
                    className={
                      s.actionItemsDone === s.actionItems && s.actionItems > 0
                        ? "text-emerald-400 font-mono text-xs"
                        : "text-muted-foreground font-mono text-xs"
                    }
                  >
                    {s.actionItemsDone}/{s.actionItems}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
