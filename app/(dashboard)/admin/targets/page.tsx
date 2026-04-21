"use client"

import * as React from "react"
import Link from "next/link"
import {
  Target as TargetIcon,
  ChevronLeft,
  Building2,
  Users as UsersIcon,
  User as UserIcon,
  Save,
  Info,
  Copy,
  Shield,
  Calendar,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { dataService } from "@/lib/mock-data"
import {
  ALL_METRICS,
  DEFAULT_ORG_TARGETS,
  METRIC_LABEL,
  METRIC_UNIT,
  type TargetMetric,
  type TargetScope,
  cascadeOrgToTeams,
  cascadeTeamToAgents,
  currentMonthKey,
  formatTargetValue,
  parseMonthKey,
  resolveAgentTarget,
  resolveTeamTarget,
  upsertTarget,
  useTargets,
} from "@/lib/targets"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// -----------------------------------------------------------------------------

function buildMonthOptions(): { key: string; label: string }[] {
  const now = new Date()
  const opts: { key: string; label: string }[] = []
  for (let offset = -3; offset <= 6; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const key = `${y}-${m}`
    opts.push({ key, label: parseMonthKey(key).label })
  }
  return opts
}

// -----------------------------------------------------------------------------

export default function TargetsPage() {
  const { user } = useAuth()

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-md p-6 text-center">
          <Shield className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Admin Only</h2>
          <p className="text-sm text-muted-foreground">
            Targets Center is restricted to administrators. If you need a target adjusted, message your admin from the Inbox.
          </p>
        </Card>
      </div>
    )
  }

  const monthOptions = React.useMemo(buildMonthOptions, [])
  const [periodKey, setPeriodKey] = React.useState(currentMonthKey())
  const { targets } = useTargets()

  const teams = React.useMemo(() => dataService.getTeams(), [])
  const agents = React.useMemo(() => dataService.getAgents(), [])

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6">
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/admin" className="flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="size-3" />
          Admin Panel
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <TargetIcon className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Targets Center</h1>
            <p className="text-sm text-muted-foreground">
              Set monthly targets at three scopes. Agent overrides beat team targets; team targets beat org defaults.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Select value={periodKey} onValueChange={setPeriodKey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((o) => (
                <SelectItem key={o.key} value={o.key}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="size-3.5" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2">
            <UsersIcon className="size-3.5" />
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <UserIcon className="size-3.5" />
            Agents ({agents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <OrgPanel
            periodKey={periodKey}
            targets={targets}
            createdBy={user.id}
            teams={teams.map((t) => ({ id: t.id, name: t.name, memberCount: t.memberCount }))}
          />
        </TabsContent>

        <TabsContent value="teams">
          <TeamsPanel
            periodKey={periodKey}
            targets={targets}
            createdBy={user.id}
            teams={teams}
            agents={agents}
          />
        </TabsContent>

        <TabsContent value="agents">
          <AgentsPanel
            periodKey={periodKey}
            targets={targets}
            createdBy={user.id}
            agents={agents}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Organization Panel
// -----------------------------------------------------------------------------

function OrgPanel({
  periodKey,
  targets,
  createdBy,
  teams,
}: {
  periodKey: string
  targets: ReturnType<typeof useTargets>["targets"]
  createdBy: string
  teams: { id: string; name: string; memberCount: number }[]
}) {
  const [values, setValues] = React.useState<Record<TargetMetric, string>>(() => {
    const next = {} as Record<TargetMetric, string>
    ALL_METRICS.forEach((m) => {
      const existing = targets.find(
        (t) =>
          t.scope === "organization" &&
          t.scopeId === "organization" &&
          t.metric === m &&
          t.periodKey === periodKey,
      )
      next[m] = String(existing?.value ?? DEFAULT_ORG_TARGETS[m])
    })
    return next
  })

  // Re-hydrate when period or targets change
  React.useEffect(() => {
    const next = {} as Record<TargetMetric, string>
    ALL_METRICS.forEach((m) => {
      const existing = targets.find(
        (t) =>
          t.scope === "organization" &&
          t.scopeId === "organization" &&
          t.metric === m &&
          t.periodKey === periodKey,
      )
      next[m] = String(existing?.value ?? DEFAULT_ORG_TARGETS[m])
    })
    setValues(next)
  }, [periodKey, targets])

  const [cascadeOpen, setCascadeOpen] = React.useState<TargetMetric | null>(null)
  const [cascadeMode, setCascadeMode] = React.useState<"replicate" | "scale">("replicate")

  function saveAll() {
    ALL_METRICS.forEach((m) => {
      const val = Number(values[m])
      if (!Number.isFinite(val)) return
      upsertTarget({
        scope: "organization",
        scopeId: "organization",
        scopeName: "Entire Floor",
        period: "monthly",
        periodKey,
        metric: m,
        value: val,
        createdBy,
      })
    })
    toast.success("Organization targets saved", {
      description: `Applied to ${parseMonthKey(periodKey).label}.`,
    })
  }

  function handleCascade(metric: TargetMetric) {
    const val = Number(values[metric])
    if (!Number.isFinite(val)) return
    cascadeOrgToTeams({
      metric,
      periodKey,
      period: "monthly",
      teams,
      value: val,
      createdBy,
      distribute: cascadeMode,
    })
    toast.success(`Cascaded to ${teams.length} teams`, {
      description: `${METRIC_LABEL[metric]} ${cascadeMode === "scale" ? "scaled by members" : "replicated"}.`,
    })
    setCascadeOpen(null)
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Organization-wide targets</h3>
            <p className="text-xs text-muted-foreground">
              These are the floor-level defaults. Individual teams and agents can override any metric.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const next = {} as Record<TargetMetric, string>
              ALL_METRICS.forEach((m) => (next[m] = String(DEFAULT_ORG_TARGETS[m])))
              setValues(next)
            }}>
              Reset to defaults
            </Button>
            <Button size="sm" onClick={saveAll}>
              <Save className="mr-1.5 size-3.5" />
              Save all
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_METRICS.map((m) => (
            <div key={m} className="rounded-lg border border-border/70 bg-muted/10 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  {METRIC_LABEL[m]}
                </Label>
                <Badge variant="outline" className="text-[10px]">
                  {METRIC_UNIT[m]}
                </Badge>
              </div>
              <Input
                type="number"
                value={values[m]}
                onChange={(e) => setValues((v) => ({ ...v, [m]: e.target.value }))}
                className="h-9 tabular-nums"
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Formatted: {formatTargetValue(m, Number(values[m]) || 0)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-[11px]"
                  onClick={() => setCascadeOpen(m)}
                >
                  <Copy className="size-3" />
                  Cascade
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={cascadeOpen !== null} onOpenChange={(o) => !o && setCascadeOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cascade to all teams</DialogTitle>
            <DialogDescription>
              Push this target down to every team. You can always override individual teams after.
            </DialogDescription>
          </DialogHeader>
          {cascadeOpen && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                <div className="font-semibold">{METRIC_LABEL[cascadeOpen]}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Org value: {formatTargetValue(cascadeOpen, Number(values[cascadeOpen]) || 0)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">Distribution</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCascadeMode("replicate")}
                    className={`rounded-lg border p-3 text-left transition ${
                      cascadeMode === "replicate"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="text-sm font-semibold">Same per team</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Replicate the exact value for each team.
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCascadeMode("scale")}
                    disabled={METRIC_UNIT[cascadeOpen] === "percent"}
                    className={`rounded-lg border p-3 text-left transition ${
                      cascadeMode === "scale"
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/30"
                    } ${METRIC_UNIT[cascadeOpen] === "percent" ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <div className="text-sm font-semibold">Scale by members</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Multiply by team size (disabled for percent metrics).
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-xs">
                <div className="mb-1 flex items-center gap-1 font-semibold">
                  <Info className="size-3" />
                  Preview
                </div>
                <ul className="space-y-0.5 text-muted-foreground">
                  {teams.slice(0, 4).map((t) => {
                    const unit = METRIC_UNIT[cascadeOpen]
                    const val =
                      cascadeMode === "scale" && unit !== "percent"
                        ? Number(values[cascadeOpen]) * t.memberCount
                        : Number(values[cascadeOpen])
                    return (
                      <li key={t.id} className="flex justify-between">
                        <span>{t.name}</span>
                        <span className="font-mono">{formatTargetValue(cascadeOpen, val)}</span>
                      </li>
                    )
                  })}
                  {teams.length > 4 && (
                    <li className="pt-1 italic">+{teams.length - 4} more teams</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCascadeOpen(null)}>
              Cancel
            </Button>
            <Button onClick={() => cascadeOpen && handleCascade(cascadeOpen)}>
              Apply to {teams.length} teams
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Teams Panel
// -----------------------------------------------------------------------------

function TeamsPanel({
  periodKey,
  targets,
  createdBy,
  teams,
  agents,
}: {
  periodKey: string
  targets: ReturnType<typeof useTargets>["targets"]
  createdBy: string
  teams: { id: string; name: string; memberCount: number }[]
  agents: { id: string; name: string; teamId?: string }[]
}) {
  const [selectedTeamId, setSelectedTeamId] = React.useState(teams[0]?.id ?? "")
  const team = teams.find((t) => t.id === selectedTeamId)
  const teamAgents = agents.filter((a) => a.teamId === selectedTeamId)

  const [values, setValues] = React.useState<Record<TargetMetric, string>>(() => {
    const next = {} as Record<TargetMetric, string>
    ALL_METRICS.forEach((m) => {
      if (!team) return
      const res = resolveTeamTarget({
        teamId: team.id,
        metric: m,
        periodKey,
        memberCount: team.memberCount,
        targets,
      })
      next[m] = String(res.value)
    })
    return next
  })

  React.useEffect(() => {
    const next = {} as Record<TargetMetric, string>
    ALL_METRICS.forEach((m) => {
      if (!team) return
      const res = resolveTeamTarget({
        teamId: team.id,
        metric: m,
        periodKey,
        memberCount: team.memberCount,
        targets,
      })
      next[m] = String(res.value)
    })
    setValues(next)
  }, [selectedTeamId, periodKey, targets, team])

  if (!team) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        No teams found.
      </Card>
    )
  }

  function saveAll() {
    ALL_METRICS.forEach((m) => {
      const val = Number(values[m])
      if (!Number.isFinite(val)) return
      upsertTarget({
        scope: "team",
        scopeId: team!.id,
        scopeName: team!.name,
        period: "monthly",
        periodKey,
        metric: m,
        value: val,
        createdBy,
      })
    })
    toast.success(`Targets saved for ${team!.name}`, {
      description: `${parseMonthKey(periodKey).label}.`,
    })
  }

  function cascadeToAgents(metric: TargetMetric) {
    const val = Number(values[metric])
    if (!Number.isFinite(val) || teamAgents.length === 0) return
    // Per-agent value: divide team value by headcount for count/currency; keep percent as-is
    const unit = METRIC_UNIT[metric]
    const perAgent = unit === "percent" ? val : Math.round(val / teamAgents.length)
    cascadeTeamToAgents({
      metric,
      periodKey,
      period: "monthly",
      teamId: team!.id,
      teamName: team!.name,
      agents: teamAgents,
      value: perAgent,
      createdBy,
    })
    toast.success(`Cascaded to ${teamAgents.length} agents`, {
      description: `${METRIC_LABEL[metric]}: ${formatTargetValue(metric, perAgent)} per agent.`,
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
      <Card className="p-3">
        <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Select team
        </div>
        <div className="space-y-1">
          {teams.map((t) => {
            const hasOverride = targets.some(
              (x) => x.scope === "team" && x.scopeId === t.id && x.periodKey === periodKey,
            )
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  selectedTeamId === t.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.name}</span>
                  {hasOverride && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[9px] uppercase">
                      Custom
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{team.name}</h3>
            <p className="text-xs text-muted-foreground">
              Targets for {parseMonthKey(periodKey).label}. Agent overrides still beat this.
            </p>
          </div>
          <Button size="sm" onClick={saveAll}>
            <Save className="mr-1.5 size-3.5" />
            Save team
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_METRICS.map((m) => {
            const resolved = resolveTeamTarget({
              teamId: team.id,
              metric: m,
              periodKey,
              memberCount: team.memberCount,
              targets,
            })
            const isOverride = resolved.isOverride
            return (
              <div key={m} className="rounded-lg border border-border/70 bg-muted/10 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wide">
                    {METRIC_LABEL[m]}
                  </Label>
                  {isOverride ? (
                    <Badge className="h-5 bg-primary/10 px-1.5 text-[9px] uppercase text-primary">
                      Override
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] uppercase">
                      Inherited
                    </Badge>
                  )}
                </div>
                <Input
                  type="number"
                  value={values[m]}
                  onChange={(e) => setValues((v) => ({ ...v, [m]: e.target.value }))}
                  className="h-9 tabular-nums"
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {formatTargetValue(m, Number(values[m]) || 0)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-[11px]"
                    onClick={() => cascadeToAgents(m)}
                  >
                    <Copy className="size-3" />
                    To agents
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Agents Panel
// -----------------------------------------------------------------------------

function AgentsPanel({
  periodKey,
  targets,
  createdBy,
  agents,
}: {
  periodKey: string
  targets: ReturnType<typeof useTargets>["targets"]
  createdBy: string
  agents: { id: string; name: string; teamId?: string; teamName?: string }[]
}) {
  const [search, setSearch] = React.useState("")

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.teamName ?? "").toLowerCase().includes(search.toLowerCase()),
  )

  const [editorAgentId, setEditorAgentId] = React.useState<string | null>(null)
  const editorAgent = agents.find((a) => a.id === editorAgentId)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Agent overrides</h3>
          <p className="text-xs text-muted-foreground">
            Per-agent targets that trump team and org defaults.
          </p>
        </div>
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full max-w-xs"
        />
      </div>

      <div className="rounded-lg border border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Debt</TableHead>
              <TableHead className="text-right">Qual. Conv.</TableHead>
              <TableHead className="text-right">QC Score</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => {
              const units = resolveAgentTarget(
                { agentId: a.id, teamId: a.teamId, metric: "unitsClosed", periodKey },
                targets,
              )
              const debt = resolveAgentTarget(
                { agentId: a.id, teamId: a.teamId, metric: "debtEnrolled", periodKey },
                targets,
              )
              const qc = resolveAgentTarget(
                { agentId: a.id, teamId: a.teamId, metric: "qualifiedConversion", periodKey },
                targets,
              )
              const score = resolveAgentTarget(
                { agentId: a.id, teamId: a.teamId, metric: "qcScore", periodKey },
                targets,
              )
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.teamName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <SourceCell value={formatTargetValue("unitsClosed", units.value)} source={units.source} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <SourceCell value={formatTargetValue("debtEnrolled", debt.value)} source={debt.source} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <SourceCell value={formatTargetValue("qualifiedConversion", qc.value)} source={qc.source} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <SourceCell value={formatTargetValue("qcScore", score.value)} source={score.source} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditorAgentId(a.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No agents match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editorAgentId !== null} onOpenChange={(o) => !o && setEditorAgentId(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editorAgent?.name} — Agent Overrides</DialogTitle>
            <DialogDescription>
              {parseMonthKey(periodKey).label} · These values override team and org targets.
            </DialogDescription>
          </DialogHeader>
          {editorAgent && (
            <AgentEditor
              agent={editorAgent}
              periodKey={periodKey}
              createdBy={createdBy}
              targets={targets}
              onClose={() => setEditorAgentId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function SourceCell({
  value,
  source,
}: {
  value: string
  source: "agent" | "team" | "organization" | "default"
}) {
  const colors: Record<typeof source, string> = {
    agent: "text-primary",
    team: "text-chart-2",
    organization: "text-muted-foreground",
    default: "text-muted-foreground/70",
  }
  return (
    <div className="flex flex-col items-end">
      <span className={`font-semibold ${colors[source]}`}>{value}</span>
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
        {source === "agent"
          ? "Override"
          : source === "team"
            ? "Team"
            : source === "organization"
              ? "Org"
              : "Default"}
      </span>
    </div>
  )
}

function AgentEditor({
  agent,
  periodKey,
  createdBy,
  targets,
  onClose,
}: {
  agent: { id: string; name: string; teamId?: string }
  periodKey: string
  createdBy: string
  targets: ReturnType<typeof useTargets>["targets"]
  onClose: () => void
}) {
  const [values, setValues] = React.useState<Record<TargetMetric, string>>(() => {
    const next = {} as Record<TargetMetric, string>
    ALL_METRICS.forEach((m) => {
      const res = resolveAgentTarget(
        { agentId: agent.id, teamId: agent.teamId, metric: m, periodKey },
        targets,
      )
      next[m] = String(res.value)
    })
    return next
  })

  const [overrides, setOverrides] = React.useState<Record<TargetMetric, boolean>>(() => {
    const next = {} as Record<TargetMetric, boolean>
    ALL_METRICS.forEach((m) => {
      next[m] = targets.some(
        (t) =>
          t.scope === "agent" &&
          t.scopeId === agent.id &&
          t.metric === m &&
          t.periodKey === periodKey,
      )
    })
    return next
  })

  function save() {
    ALL_METRICS.forEach((m) => {
      if (!overrides[m]) return
      const val = Number(values[m])
      if (!Number.isFinite(val)) return
      upsertTarget({
        scope: "agent",
        scopeId: agent.id,
        scopeName: agent.name,
        period: "monthly",
        periodKey,
        metric: m,
        value: val,
        createdBy,
      })
    })
    toast.success(`Overrides saved for ${agent.name}`)
    onClose()
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-xs text-muted-foreground">
        Toggle the switch to override. Unchecked metrics inherit from team or org.
      </div>
      <div className="space-y-2">
        {ALL_METRICS.map((m) => (
          <div
            key={m}
            className="grid grid-cols-[auto,1fr,140px] items-center gap-3 rounded-lg border border-border/70 p-2.5"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={overrides[m]}
                onChange={(e) =>
                  setOverrides((v) => ({ ...v, [m]: e.target.checked }))
                }
                className="size-4 cursor-pointer"
              />
            </label>
            <div>
              <div className="text-sm font-medium">{METRIC_LABEL[m]}</div>
              <div className="text-[11px] text-muted-foreground">
                {formatTargetValue(m, Number(values[m]) || 0)}
              </div>
            </div>
            <Input
              type="number"
              value={values[m]}
              disabled={!overrides[m]}
              onChange={(e) => setValues((v) => ({ ...v, [m]: e.target.value }))}
              className="h-9 tabular-nums"
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save}>
          <Save className="mr-1.5 size-3.5" />
          Save overrides
        </Button>
      </DialogFooter>
    </div>
  )
}
