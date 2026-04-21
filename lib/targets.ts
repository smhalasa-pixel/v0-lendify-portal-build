"use client"

/**
 * Targets system
 *
 * A single source of truth for performance targets across the platform.
 * Admins set targets at three scopes:
 *   - organization  (applies to every agent unless overridden)
 *   - team          (applies to every agent on that team unless overridden)
 *   - agent         (per-agent override)
 *
 * Resolution: agent override > team target > org target > hard default.
 *
 * Targets are keyed by (scope, scopeId, metric, periodKey).
 * Example periodKeys: "2026-04" (monthly), "2026-Q2" (quarter), "2026" (year).
 */

import * as React from "react"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type TargetScope = "organization" | "team" | "agent"
export type TargetPeriod = "monthly" | "quarterly" | "annual"

export type TargetMetric =
  | "unitsClosed"
  | "debtEnrolled"
  | "qualifiedConversion"
  | "qcScore"
  | "dials"
  | "talkTimeMinutes"
  | "revenue"

export interface Target {
  id: string
  scope: TargetScope
  scopeId: string // "organization" | teamId | userId
  scopeName: string
  period: TargetPeriod
  periodKey: string
  metric: TargetMetric
  value: number
  createdAt: string
  updatedAt?: string
  createdBy?: string
  notes?: string
}

export interface TargetResolution {
  value: number
  source: TargetScope | "default"
  sourceName: string
  isOverride: boolean
}

// -----------------------------------------------------------------------------
// Metric metadata
// -----------------------------------------------------------------------------

export const METRIC_LABEL: Record<TargetMetric, string> = {
  unitsClosed: "Units Closed",
  debtEnrolled: "Debt Enrolled",
  qualifiedConversion: "Qualified Conversion",
  qcScore: "QC Score",
  dials: "Dials",
  talkTimeMinutes: "Talk Time",
  revenue: "Revenue",
}

export const METRIC_UNIT: Record<TargetMetric, "count" | "currency" | "percent" | "minutes"> = {
  unitsClosed: "count",
  debtEnrolled: "currency",
  qualifiedConversion: "percent",
  qcScore: "percent",
  dials: "count",
  talkTimeMinutes: "minutes",
  revenue: "currency",
}

export const DEFAULT_ORG_TARGETS: Record<TargetMetric, number> = {
  unitsClosed: 15,
  debtEnrolled: 3_000_000,
  qualifiedConversion: 22,
  qcScore: 85,
  dials: 1400,
  talkTimeMinutes: 2200,
  revenue: 180_000,
}

export const ALL_METRICS: TargetMetric[] = [
  "unitsClosed",
  "debtEnrolled",
  "qualifiedConversion",
  "qcScore",
  "dials",
  "talkTimeMinutes",
  "revenue",
]

// -----------------------------------------------------------------------------
// Period helpers
// -----------------------------------------------------------------------------

export function currentMonthKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function currentQuarterKey(d: Date = new Date()): string {
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${d.getFullYear()}-Q${q}`
}

export function currentYearKey(d: Date = new Date()): string {
  return String(d.getFullYear())
}

export function parseMonthKey(key: string): { label: string; startDate: Date; endDate: Date } {
  const [y, m] = key.split("-").map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 0, 23, 59, 59, 999)
  const label = start.toLocaleString("en-US", { month: "long", year: "numeric" })
  return { label, startDate: start, endDate: end }
}

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

const STORAGE_KEY = "lendify:targets:v1"

type TargetsStore = {
  targets: Target[]
}

function readStore(): TargetsStore {
  if (typeof window === "undefined") return { targets: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { targets: [] }
    const parsed = JSON.parse(raw) as TargetsStore
    return parsed && Array.isArray(parsed.targets) ? parsed : { targets: [] }
  } catch {
    return { targets: [] }
  }
}

function writeStore(store: TargetsStore) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent("lendify:targets:changed"))
  } catch {
    // noop
  }
}

// -----------------------------------------------------------------------------
// CRUD
// -----------------------------------------------------------------------------

export function getAllTargets(): Target[] {
  return readStore().targets
}

export function upsertTarget(input: Omit<Target, "id" | "createdAt"> & { id?: string }): Target {
  const store = readStore()
  const now = new Date().toISOString()
  const existing = store.targets.find(
    (t) =>
      (input.id && t.id === input.id) ||
      (t.scope === input.scope &&
        t.scopeId === input.scopeId &&
        t.metric === input.metric &&
        t.periodKey === input.periodKey),
  )
  if (existing) {
    existing.value = input.value
    existing.scopeName = input.scopeName
    existing.notes = input.notes
    existing.updatedAt = now
    existing.createdBy = input.createdBy ?? existing.createdBy
    writeStore(store)
    return existing
  }
  const next: Target = {
    id: input.id ?? `tgt-${Math.random().toString(36).slice(2, 10)}`,
    scope: input.scope,
    scopeId: input.scopeId,
    scopeName: input.scopeName,
    period: input.period,
    periodKey: input.periodKey,
    metric: input.metric,
    value: input.value,
    notes: input.notes,
    createdAt: now,
    createdBy: input.createdBy,
  }
  store.targets.push(next)
  writeStore(store)
  return next
}

export function deleteTarget(id: string) {
  const store = readStore()
  store.targets = store.targets.filter((t) => t.id !== id)
  writeStore(store)
}

export function clearAllTargets() {
  writeStore({ targets: [] })
}

// -----------------------------------------------------------------------------
// Resolution
// -----------------------------------------------------------------------------

/**
 * Resolve a target for a specific agent.
 * Cascade: agent override > team > org > hard default.
 */
export function resolveAgentTarget(
  args: {
    agentId: string
    teamId?: string
    metric: TargetMetric
    periodKey: string
  },
  targets: Target[] = getAllTargets(),
): TargetResolution {
  const { agentId, teamId, metric, periodKey } = args

  const agentT = targets.find(
    (t) =>
      t.scope === "agent" &&
      t.scopeId === agentId &&
      t.metric === metric &&
      t.periodKey === periodKey,
  )
  if (agentT)
    return {
      value: agentT.value,
      source: "agent",
      sourceName: agentT.scopeName,
      isOverride: true,
    }

  if (teamId) {
    const teamT = targets.find(
      (t) =>
        t.scope === "team" &&
        t.scopeId === teamId &&
        t.metric === metric &&
        t.periodKey === periodKey,
    )
    if (teamT)
      return {
        value: teamT.value,
        source: "team",
        sourceName: teamT.scopeName,
        isOverride: false,
      }
  }

  const orgT = targets.find(
    (t) =>
      t.scope === "organization" &&
      t.scopeId === "organization" &&
      t.metric === metric &&
      t.periodKey === periodKey,
  )
  if (orgT)
    return {
      value: orgT.value,
      source: "organization",
      sourceName: orgT.scopeName,
      isOverride: false,
    }

  return {
    value: DEFAULT_ORG_TARGETS[metric],
    source: "default",
    sourceName: "Platform default",
    isOverride: false,
  }
}

/**
 * Resolve a team-level target. If team has no direct target, bubbles to org then default.
 * The returned value is the *per-team target*, not the sum of agents.
 */
export function resolveTeamTarget(args: {
  teamId: string
  metric: TargetMetric
  periodKey: string
  memberCount: number
  targets?: Target[]
}): TargetResolution {
  const { teamId, metric, periodKey, memberCount, targets = getAllTargets() } = args

  const teamT = targets.find(
    (t) =>
      t.scope === "team" &&
      t.scopeId === teamId &&
      t.metric === metric &&
      t.periodKey === periodKey,
  )
  if (teamT)
    return {
      value: teamT.value,
      source: "team",
      sourceName: teamT.scopeName,
      isOverride: true,
    }

  // Fallback: org target × members (for count/currency metrics) or straight org value (for percent/score)
  const orgT = targets.find(
    (t) =>
      t.scope === "organization" &&
      t.scopeId === "organization" &&
      t.metric === metric &&
      t.periodKey === periodKey,
  )
  const base = orgT?.value ?? DEFAULT_ORG_TARGETS[metric]
  const unit = METRIC_UNIT[metric]
  const value = unit === "percent" ? base : base * memberCount
  return {
    value,
    source: orgT ? "organization" : "default",
    sourceName: orgT ? orgT.scopeName : "Platform default",
    isOverride: false,
  }
}

// -----------------------------------------------------------------------------
// Cascade
// -----------------------------------------------------------------------------

/** Apply an org-level target down to every team (creating/updating team targets). */
export function cascadeOrgToTeams(args: {
  metric: TargetMetric
  periodKey: string
  period: TargetPeriod
  teams: { id: string; name: string; memberCount: number }[]
  value: number // this is the per-team value (override auto-distribution)
  createdBy?: string
  distribute?: "replicate" | "scale" // replicate = same value per team; scale = value × members
}) {
  const { metric, periodKey, period, teams, value, createdBy, distribute = "replicate" } = args
  const unit = METRIC_UNIT[metric]
  teams.forEach((t) => {
    const teamValue =
      distribute === "scale" && unit !== "percent" ? value * t.memberCount : value
    upsertTarget({
      scope: "team",
      scopeId: t.id,
      scopeName: t.name,
      period,
      periodKey,
      metric,
      value: teamValue,
      createdBy,
    })
  })
}

/** Apply a team-level target down to every agent on that team. */
export function cascadeTeamToAgents(args: {
  metric: TargetMetric
  periodKey: string
  period: TargetPeriod
  teamId: string
  teamName: string
  agents: { id: string; name: string }[]
  value: number // per-agent value
  createdBy?: string
}) {
  const { metric, periodKey, period, agents, value, createdBy } = args
  agents.forEach((a) => {
    upsertTarget({
      scope: "agent",
      scopeId: a.id,
      scopeName: a.name,
      period,
      periodKey,
      metric,
      value,
      createdBy,
    })
  })
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useTargets() {
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener("lendify:targets:changed", handler)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handler()
    })
    return () => {
      window.removeEventListener("lendify:targets:changed", handler)
    }
  }, [])

  // Re-read on every render when version changes
  const targets = React.useMemo(() => getAllTargets(), [version])

  return {
    targets,
    upsert: upsertTarget,
    remove: deleteTarget,
    clearAll: clearAllTargets,
    cascadeOrgToTeams,
    cascadeTeamToAgents,
  }
}

export function useResolvedAgentTarget(args: {
  agentId: string
  teamId?: string
  metric: TargetMetric
  periodKey: string
}): TargetResolution {
  const { targets } = useTargets()
  return React.useMemo(
    () =>
      resolveAgentTarget(
        { agentId: args.agentId, teamId: args.teamId, metric: args.metric, periodKey: args.periodKey },
        targets,
      ),
    [args.agentId, args.teamId, args.metric, args.periodKey, targets],
  )
}

// -----------------------------------------------------------------------------
// Formatting
// -----------------------------------------------------------------------------

export function formatTargetValue(metric: TargetMetric, value: number): string {
  const unit = METRIC_UNIT[metric]
  if (unit === "currency") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }
  if (unit === "percent") return `${value.toFixed(1)}%`
  if (unit === "minutes") return `${value.toLocaleString()} min`
  return value.toLocaleString()
}
