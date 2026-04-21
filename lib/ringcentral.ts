"use client"

/**
 * RingCentral Integration Layer
 *
 * Ring Central exposes a JWT-based OAuth flow + WebSocket presence stream.
 * Real wiring goes through:
 *   - `/restapi/v1.0/account/~/extension/~/presence` (polling fallback)
 *   - `/restapi/v1.0/account/~/telephony/sessions` (active calls)
 *   - Subscription API (SIP/WS push for live updates)
 *
 * Until the customer provides credentials we run a deterministic simulation
 * that mimics the shape of the real API so the UI is already production-grade.
 * Swap `fetchLiveSnapshot` for a real REST/WebSocket call and the components
 * keep working without changes.
 */

import * as React from "react"
import { mockUsers, mockTeams } from "@/lib/mock-data"

// ============================================================================
// Types that match the shape of the real RingCentral presence feed
// ============================================================================

export type RCPresence =
  | "available"
  | "on_call"
  | "ringing"
  | "wrap_up"
  | "hold"
  | "break"
  | "lunch"
  | "training"
  | "meeting"
  | "offline"

export type CallDirection = "inbound" | "outbound"

export type CallDisposition =
  | "connected"
  | "voicemail"
  | "no_answer"
  | "busy"
  | "wrong_party"
  | "dnc_request"
  | "callback"
  | "qualified"
  | "transferred"
  | "enrolled"
  | "not_interested"

export interface ActiveCall {
  callId: string
  agentId: string
  agentName: string
  teamId: string
  teamName: string
  direction: CallDirection
  customerName: string
  customerPhone: string
  customerState: string // US state - important for debt-settlement licensing
  startedAt: number // ms epoch
  durationSec: number
  onHold: boolean
  recorded: boolean
  queue: string
  isMuted: boolean
  sentiment?: "positive" | "neutral" | "negative"
  debtEstimate?: number
}

export interface AgentTelephonyState {
  agentId: string
  agentName: string
  avatar?: string
  teamId: string
  teamName: string
  leaderId?: string
  leaderName?: string
  presence: RCPresence
  presenceSince: number // ms epoch
  extension: string
  dnd: boolean
  activeCall?: ActiveCall
  // Today's rolling counters
  callsHandled: number
  callsOutbound: number
  callsInbound: number
  talkTimeSec: number
  holdTimeSec: number
  wrapTimeSec: number
  avgHandleTimeSec: number
  conversionsToday: number
  enrolledToday: number
  scriptAdherence: number // 0-100 - QA adherence from last evaluation
  lastDispositionAt?: number
  lastDisposition?: CallDisposition
}

export interface QueueSnapshot {
  queueId: string
  queueName: string
  callsWaiting: number
  longestWaitSec: number
  callsHandledToday: number
  callsAbandonedToday: number
  serviceLevelPct: number // % answered within SLA threshold (20s)
  averageSpeedOfAnswerSec: number
  agentsAvailable: number
  agentsOnCall: number
  agentsOnBreak: number
}

export interface FloorSnapshot {
  generatedAt: number
  agents: AgentTelephonyState[]
  queues: QueueSnapshot[]
  activeCalls: ActiveCall[]
  totals: {
    agentsOnCall: number
    agentsAvailable: number
    agentsOnBreak: number
    agentsOffline: number
    totalCallsToday: number
    enrolledToday: number
    callbacksScheduled: number
    dncRequestsToday: number
    avgHandleTimeSec: number
    serviceLevelPct: number
    longestCallSec: number
    longestWaitSec: number
    callsInQueue: number
  }
}

// ============================================================================
// Deterministic "live" simulation so agent cards pulse with real-looking data
// ============================================================================

const STATES = [
  "CA",
  "TX",
  "NY",
  "FL",
  "IL",
  "AZ",
  "GA",
  "NC",
  "OH",
  "PA",
  "WA",
  "MI",
  "MA",
  "VA",
  "NJ",
]
const QUEUES = [
  { id: "q-inbound", name: "Inbound Qualification" },
  { id: "q-transfers", name: "Transfer Desk" },
  { id: "q-callbacks", name: "Scheduled Callbacks" },
  { id: "q-hot-leads", name: "Hot Leads" },
]

const PRESENCE_CYCLE: RCPresence[] = [
  "available",
  "on_call",
  "on_call",
  "wrap_up",
  "available",
  "on_call",
  "hold",
  "available",
  "break",
  "on_call",
  "meeting",
  "on_call",
  "lunch",
  "available",
  "offline",
]

function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function seededFloat(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

function pick<T>(list: T[], seed: number): T {
  return list[Math.floor(seededFloat(seed) * list.length) % list.length]
}

function formatPhone(seed: number): string {
  const area = 200 + Math.floor(seededFloat(seed) * 700)
  const prefix = 200 + Math.floor(seededFloat(seed + 1) * 700)
  const line = 1000 + Math.floor(seededFloat(seed + 2) * 9000)
  return `(${area}) ${prefix}-${line}`
}

const CUSTOMER_POOL = [
  "Robert Ellis",
  "Maria Sanchez",
  "James Whitfield",
  "Patricia Cole",
  "Dwayne Morrison",
  "Ashley Bennett",
  "Carlos Jimenez",
  "Nicole Foster",
  "Brandon Lee",
  "Danielle Graves",
  "Kevin Ramirez",
  "Tanya Washington",
  "Steven Brooks",
  "Michelle Trent",
  "Derek Sullivan",
  "Angela Price",
  "Marcus Hale",
  "Jenna Powell",
  "Luis Herrera",
  "Chantelle Diaz",
  "Troy Ferguson",
  "Regina Cortez",
  "Ian Callahan",
  "Sabrina Montes",
]

/**
 * Build a deterministic snapshot that evolves every `tick` (usually every
 * second). This keeps timers ticking, presence rotating, and calls ageing in
 * a way that looks real without actually mutating a server.
 */
export function fetchLiveSnapshot(tick = 0): FloorSnapshot {
  const agents = mockUsers.filter((u) => u.role === "agent" && u.status === "active")
  const leads = mockUsers.filter((u) => u.role === "leadership")

  const agentStates: AgentTelephonyState[] = agents.map((agent, idx) => {
    const seed = hashString(agent.id)
    const cycleIdx = (idx + Math.floor(tick / 12)) % PRESENCE_CYCLE.length
    const presence = PRESENCE_CYCLE[cycleIdx]
    const onCall = presence === "on_call" || presence === "hold"
    const callStartOffset = 30 + Math.floor(seededFloat(seed + tick) * 540)
    const callStartedAt = Date.now() - callStartOffset * 1000

    const lead = leads.find((l) => l.teamId === agent.teamId)

    const callsHandled = 14 + Math.floor(seededFloat(seed + 1) * 38) + Math.floor(tick / 180)
    const talkTimeSec = callsHandled * (180 + Math.floor(seededFloat(seed + 2) * 240))
    const holdTimeSec = Math.floor(talkTimeSec * 0.06)
    const wrapTimeSec = Math.floor(talkTimeSec * 0.11)
    const avgHandleTimeSec = Math.floor((talkTimeSec + wrapTimeSec) / Math.max(callsHandled, 1))

    const state: AgentTelephonyState = {
      agentId: agent.id,
      agentName: agent.name,
      avatar: agent.avatar,
      teamId: agent.teamId ?? "unassigned",
      teamName: agent.teamName ?? "Unassigned",
      leaderId: lead?.id,
      leaderName: lead?.name,
      presence,
      presenceSince: Date.now() - Math.floor(seededFloat(seed + 3) * 600) * 1000,
      extension: `1${(100 + idx).toString().padStart(3, "0")}`,
      dnd: presence === "training" || presence === "meeting",
      callsHandled,
      callsOutbound: Math.floor(callsHandled * 0.72),
      callsInbound: callsHandled - Math.floor(callsHandled * 0.72),
      talkTimeSec,
      holdTimeSec,
      wrapTimeSec,
      avgHandleTimeSec,
      conversionsToday: Math.max(1, Math.floor(callsHandled * 0.18)),
      enrolledToday: Math.max(0, Math.floor(callsHandled * 0.09)),
      scriptAdherence: 68 + Math.floor(seededFloat(seed + 4) * 30),
      lastDispositionAt: Date.now() - Math.floor(seededFloat(seed + 5) * 900) * 1000,
      lastDisposition: pick<CallDisposition>(
        [
          "connected",
          "voicemail",
          "no_answer",
          "callback",
          "qualified",
          "transferred",
          "enrolled",
          "not_interested",
          "dnc_request",
          "wrong_party",
        ],
        seed + tick,
      ),
    }

    if (onCall) {
      const direction: CallDirection = seededFloat(seed + 6) > 0.35 ? "outbound" : "inbound"
      state.activeCall = {
        callId: `rc-${agent.id}-${Math.floor(tick / 60)}`,
        agentId: agent.id,
        agentName: agent.name,
        teamId: state.teamId,
        teamName: state.teamName,
        direction,
        customerName: pick(CUSTOMER_POOL, seed + tick),
        customerPhone: formatPhone(seed + tick),
        customerState: pick(STATES, seed + 7),
        startedAt: callStartedAt,
        durationSec: callStartOffset,
        onHold: presence === "hold",
        recorded: true,
        queue: direction === "inbound" ? pick(QUEUES, seed).name : "Outbound Dialer",
        isMuted: false,
        sentiment:
          seededFloat(seed + 8) > 0.7
            ? "positive"
            : seededFloat(seed + 8) > 0.35
            ? "neutral"
            : "negative",
        debtEstimate: 18000 + Math.floor(seededFloat(seed + 9) * 65000),
      }
    }

    return state
  })

  // Derive queue snapshots
  const queues: QueueSnapshot[] = QUEUES.map((q, qi) => {
    const seed = hashString(q.id + tick.toString())
    const waiting = Math.max(0, Math.floor(seededFloat(seed) * 9) - 2)
    return {
      queueId: q.id,
      queueName: q.name,
      callsWaiting: waiting,
      longestWaitSec: waiting > 0 ? 10 + Math.floor(seededFloat(seed + 1) * 180) : 0,
      callsHandledToday: 80 + qi * 30 + Math.floor(tick / 60),
      callsAbandonedToday: Math.floor(seededFloat(seed + 2) * 6),
      serviceLevelPct: 82 + Math.floor(seededFloat(seed + 3) * 16),
      averageSpeedOfAnswerSec: 6 + Math.floor(seededFloat(seed + 4) * 18),
      agentsAvailable: agentStates.filter(
        (a) => a.presence === "available" && a.teamId,
      ).length,
      agentsOnCall: agentStates.filter((a) => a.presence === "on_call").length,
      agentsOnBreak: agentStates.filter(
        (a) => a.presence === "break" || a.presence === "lunch",
      ).length,
    }
  })

  const activeCalls = agentStates
    .filter((a) => a.activeCall)
    .map((a) => a.activeCall!)

  const totalCalls = agentStates.reduce((s, a) => s + a.callsHandled, 0)
  const avgAHT =
    agentStates.length === 0
      ? 0
      : Math.round(
          agentStates.reduce((s, a) => s + a.avgHandleTimeSec, 0) /
            agentStates.length,
        )

  return {
    generatedAt: Date.now(),
    agents: agentStates,
    queues,
    activeCalls,
    totals: {
      agentsOnCall: agentStates.filter((a) => a.presence === "on_call" || a.presence === "hold")
        .length,
      agentsAvailable: agentStates.filter((a) => a.presence === "available").length,
      agentsOnBreak: agentStates.filter(
        (a) =>
          a.presence === "break" || a.presence === "lunch" || a.presence === "training",
      ).length,
      agentsOffline: agentStates.filter((a) => a.presence === "offline").length,
      totalCallsToday: totalCalls,
      enrolledToday: agentStates.reduce((s, a) => s + a.enrolledToday, 0),
      callbacksScheduled: activeCalls.filter(() => false).length + 12,
      dncRequestsToday: agentStates.filter((a) => a.lastDisposition === "dnc_request")
        .length,
      avgHandleTimeSec: avgAHT,
      serviceLevelPct: Math.round(
        queues.reduce((s, q) => s + q.serviceLevelPct, 0) / queues.length,
      ),
      longestCallSec: activeCalls.reduce(
        (max, c) => (c.durationSec > max ? c.durationSec : max),
        0,
      ),
      longestWaitSec: queues.reduce(
        (max, q) => (q.longestWaitSec > max ? q.longestWaitSec : max),
        0,
      ),
      callsInQueue: queues.reduce((s, q) => s + q.callsWaiting, 0),
    },
  }
}

// ============================================================================
// Hook: subscribe to a live-refreshing snapshot
// ============================================================================

export interface UseRingCentralOptions {
  /** Refresh interval in ms. 1000 = 1s "true live". */
  intervalMs?: number
  /** Pause/resume live polling */
  paused?: boolean
}

export function useRingCentral(options: UseRingCentralOptions = {}) {
  const { intervalMs = 1000, paused = false } = options
  const [tick, setTick] = React.useState(0)
  const [snapshot, setSnapshot] = React.useState<FloorSnapshot>(() =>
    fetchLiveSnapshot(0),
  )

  React.useEffect(() => {
    setSnapshot(fetchLiveSnapshot(tick))
  }, [tick])

  React.useEffect(() => {
    if (paused) return
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, paused])

  return { snapshot, tick, refresh: () => setTick((t) => t + 1) }
}

// ============================================================================
// Formatting helpers shared across call views
// ============================================================================

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export const PRESENCE_LABEL: Record<RCPresence, string> = {
  available: "Available",
  on_call: "On Call",
  ringing: "Ringing",
  wrap_up: "Wrap-up",
  hold: "On Hold",
  break: "Break",
  lunch: "Lunch",
  training: "Training",
  meeting: "Meeting",
  offline: "Offline",
}

export const PRESENCE_COLOR: Record<
  RCPresence,
  { dot: string; text: string; bg: string; border: string }
> = {
  available: {
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  on_call: {
    dot: "bg-blue-500",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  ringing: {
    dot: "bg-sky-400",
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  wrap_up: {
    dot: "bg-amber-500",
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  hold: {
    dot: "bg-orange-500",
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  break: {
    dot: "bg-yellow-500",
    text: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  lunch: {
    dot: "bg-yellow-600",
    text: "text-yellow-600",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  training: {
    dot: "bg-violet-500",
    text: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  meeting: {
    dot: "bg-fuchsia-500",
    text: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/30",
  },
  offline: {
    dot: "bg-gray-500",
    text: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
  },
}

export const DISPOSITION_LABEL: Record<CallDisposition, string> = {
  connected: "Connected",
  voicemail: "Voicemail",
  no_answer: "No Answer",
  busy: "Busy",
  wrong_party: "Wrong Party",
  dnc_request: "DNC Request",
  callback: "Callback Set",
  qualified: "Qualified",
  transferred: "Transferred",
  enrolled: "Enrolled",
  not_interested: "Not Interested",
}

// ============================================================================
// Connection state (mock config persisted to localStorage)
// ============================================================================

export interface RingCentralConfig {
  connected: boolean
  serverUrl: string
  accountId: string
  jwtTokenPreview: string // last 4 chars only
  syncedExtensions: number
  lastSyncAt: string | null
  syncEvery: "5s" | "15s" | "30s" | "1m"
  webhookUrl: string
  callRecording: boolean
  whisperBargeEnabled: boolean
}

const DEFAULT_RC_CONFIG: RingCentralConfig = {
  connected: false,
  serverUrl: "https://platform.ringcentral.com",
  accountId: "",
  jwtTokenPreview: "",
  syncedExtensions: 0,
  lastSyncAt: null,
  syncEvery: "5s",
  webhookUrl: "",
  callRecording: true,
  whisperBargeEnabled: true,
}

const RC_STORAGE_KEY = "forge-ringcentral-config"

export function loadRingCentralConfig(): RingCentralConfig {
  if (typeof window === "undefined") return DEFAULT_RC_CONFIG
  try {
    const raw = window.localStorage.getItem(RC_STORAGE_KEY)
    if (!raw) return DEFAULT_RC_CONFIG
    return { ...DEFAULT_RC_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_RC_CONFIG
  }
}

export function saveRingCentralConfig(cfg: RingCentralConfig): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(RC_STORAGE_KEY, JSON.stringify(cfg))
}

/**
 * Total extensions we could theoretically sync to RingCentral (one per agent
 * + team leads). Used by the settings page preview.
 */
export function getSyncableExtensionCount(): number {
  return mockUsers.filter(
    (u) => u.role === "agent" || u.role === "leadership",
  ).length
}

/** Breakdown of extensions by team for the settings page */
export function getExtensionBreakdown(): Array<{
  teamId: string
  teamName: string
  agents: number
  lead: string | undefined
}> {
  return mockTeams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    agents: mockUsers.filter((u) => u.teamId === team.id && u.role === "agent").length,
    lead: mockUsers.find((u) => u.teamId === team.id && u.role === "leadership")?.name,
  }))
}
