"use client"

import * as React from "react"
import Link from "next/link"
import {
  Users,
  Settings,
  FileText,
  Megaphone,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Shield,
  Target as TargetIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Mail,
  PenSquare,
  Gauge,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { dataService } from "@/lib/mock-data"
import {
  currentMonthKey,
  getAllTargets,
  parseMonthKey,
  useTargets,
} from "@/lib/targets"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// -----------------------------------------------------------------------------

const operationsModules = [
  {
    title: "Targets Center",
    description: "Set monthly org/team/agent targets with cascade rules",
    href: "/admin/targets",
    icon: TargetIcon,
    group: "operations",
  },
  {
    title: "User Management",
    description: "Manage users, roles, permissions, and team assignments",
    href: "/admin/users",
    icon: Users,
    group: "operations",
  },
  {
    title: "System Settings",
    description: "Platform configuration, layouts, and global defaults",
    href: "/admin/settings",
    icon: Settings,
    group: "operations",
  },
]

const financeModules = [
  {
    title: "Commission Rules",
    description: "Tier structures, multipliers, and payout plans",
    href: "/admin/commissions",
    icon: DollarSign,
    group: "finance",
  },
  {
    title: "Clawback Rules",
    description: "NSF windows, thresholds, and dispute policies",
    href: "/admin/clawbacks",
    icon: AlertTriangle,
    group: "finance",
  },
]

const contentModules = [
  {
    title: "Announcements",
    description: "Floor-wide, role-targeted, or team-specific posts",
    href: "/admin/announcements",
    icon: Megaphone,
    group: "content",
  },
  {
    title: "Knowledge Base",
    description: "Articles, policies, training, and compliance refs",
    href: "/admin/knowledge",
    icon: BookOpen,
    group: "content",
  },
  {
    title: "Script Manager",
    description: "Openers, rebuttals, and closing scripts",
    href: "/admin/scripts",
    icon: FileText,
    group: "content",
  },
]

// -----------------------------------------------------------------------------

export default function AdminPage() {
  const { user } = useAuth()

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="mx-auto mb-4 size-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              The Admin Panel is only accessible to administrators. Please contact your system administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Live reads
  const { targets } = useTargets()
  const monthKey = React.useMemo(() => currentMonthKey(), [])
  const monthLabel = parseMonthKey(monthKey).label

  const agents = React.useMemo(() => dataService.getAgents(), [])
  const teams = React.useMemo(() => dataService.getTeams(), [])

  // Targets coverage this month
  const orgTargetsThisMonth = targets.filter(
    (t) => t.scope === "organization" && t.periodKey === monthKey,
  )
  const teamIdsWithTargets = new Set(
    targets.filter((t) => t.scope === "team" && t.periodKey === monthKey).map((t) => t.scopeId),
  )
  const agentIdsWithOverrides = new Set(
    targets.filter((t) => t.scope === "agent" && t.periodKey === monthKey).map((t) => t.scopeId),
  )

  const orgReady = orgTargetsThisMonth.length > 0
  const teamsReady = teamIdsWithTargets.size
  const agentsOverridden = agentIdsWithOverrides.size

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Shield className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Command Center</h1>
            <p className="text-sm text-muted-foreground">
              Manage targets, users, finances, and content for the entire floor.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/inbox">
              <Mail className="mr-1.5 size-3.5" />
              Inbox
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/announcements">
              <PenSquare className="mr-1.5 size-3.5" />
              New announcement
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/targets">
              <TargetIcon className="mr-1.5 size-3.5" />
              Set targets
            </Link>
          </Button>
        </div>
      </div>

      {/* Targets readiness for the current month */}
      <Card className="overflow-hidden border-primary/30 bg-primary/[0.02]">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr,auto] md:items-center">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <TargetIcon className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {monthLabel} · Targets Readiness
              </span>
            </div>
            <h2 className="mb-3 text-lg font-semibold">
              {orgReady
                ? `Monthly targets are live for ${monthLabel}`
                : `No org targets set for ${monthLabel} yet`}
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <CoverageStat
                label="Org metrics"
                count={orgTargetsThisMonth.length}
                total={7}
                ready={orgReady}
              />
              <CoverageStat
                label="Teams with override"
                count={teamsReady}
                total={teams.length}
                ready={teamsReady > 0}
              />
              <CoverageStat
                label="Agent overrides"
                count={agentsOverridden}
                total={agents.length}
                ready={true}
                subtle
              />
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/targets">
              Open Targets Center
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* System overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStat
          label="Active agents"
          value={agents.filter((a) => a.status === "active").length}
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <OverviewStat
          label="Teams"
          value={teams.length}
          icon={Gauge}
          color="bg-chart-2/10 text-chart-2"
        />
        <OverviewStat
          label="Targets set (all scopes)"
          value={targets.filter((t) => t.periodKey === monthKey).length}
          icon={TargetIcon}
          color="bg-chart-3/10 text-chart-3"
        />
        <OverviewStat
          label="Pending approvals"
          value={3}
          icon={AlertTriangle}
          color="bg-warning/10 text-warning"
        />
      </div>

      {/* Grouped modules */}
      <ModuleSection title="Operations" modules={operationsModules} />
      <ModuleSection title="Finance" modules={financeModules} />
      <ModuleSection title="Content & Training" modules={contentModules} />
    </div>
  )
}

// -----------------------------------------------------------------------------

function CoverageStat({
  label,
  count,
  total,
  ready,
  subtle = false,
}: {
  label: string
  count: number
  total: number
  ready: boolean
  subtle?: boolean
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {subtle ? (
          <div className="size-1.5 rounded-full bg-muted-foreground/50" />
        ) : ready ? (
          <CheckCircle2 className="size-3.5 text-chart-3" />
        ) : (
          <XCircle className="size-3.5 text-destructive" />
        )}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tabular-nums">{count}</span>
        <span className="text-xs text-muted-foreground">of {total}</span>
      </div>
    </div>
  )
}

function OverviewStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ModuleSection({
  title,
  modules,
}: {
  title: string
  modules: typeof operationsModules
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((m) => {
          const Icon = m.icon
          return (
            <Link key={m.title} href={m.href}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm">
                <CardContent className="pt-6">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mb-1 font-semibold">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
