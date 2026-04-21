"use client"

import * as React from "react"
import {
  Flame,
  Phone,
  Clock,
  DollarSign,
  MapPin,
  Thermometer,
  User as UserIcon,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  UserCheck,
  Filter,
  AlertTriangle,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { useTeamScope } from "@/lib/team-scope"
import { mockUsers } from "@/lib/mock-data"

// ============================================================================
// Deterministic "Hot Lead" generator - tied to RingCentral disposition + debt
// ============================================================================

type LeadTemperature = "blazing" | "hot" | "warm" | "cooling"
type LeadSource =
  | "inbound_call"
  | "transfer"
  | "callback_requested"
  | "web_form"
  | "digital_ad"

interface HotLead {
  id: string
  customerName: string
  customerPhone: string
  customerState: string
  debtEstimate: number
  numCreditors: number
  temperature: LeadTemperature
  score: number // 0-100
  source: LeadSource
  lastInteraction: string // ISO
  nextCallbackAt?: string // ISO
  notes: string
  assignedAgentId?: string
  assignedAgentName?: string
  teamId?: string
  teamName?: string
  callsAttempted: number
  talkTimeSec: number
  hasVerbalCommit: boolean
  languagePreference: "EN" | "ES"
  licensedStatesIssue?: boolean // flag if state isn't in our license list
}

const STATES_ALL = [
  "CA","TX","NY","FL","IL","AZ","GA","NC","OH","PA","WA","MI","MA","VA","NJ","CO","OR","NV","MN","WI",
]
const STATES_RESTRICTED = new Set(["KS", "WV", "ME", "CT", "VT"])

const LEAD_NAMES = [
  "Marcus Wheeler",
  "Jessica Talbot",
  "Kofi Mensah",
  "Luna Palmieri",
  "Eric Zhang",
  "Priya Reddy",
  "Trevor Wallace",
  "Aaliyah Spencer",
  "Gustavo Renteria",
  "Kendra Whitlock",
  "Dominic Stanton",
  "Salma Haddad",
  "Nathan Kirby",
  "Bianca Ortiz",
  "Harrison Leach",
  "Monika Dubois",
  "Zach Hollister",
  "Paloma Rivas",
  "Reggie Dawson",
  "Amara Osei",
  "Colin Hartley",
  "Imani Blackwell",
  "Wesley Tanaka",
  "Fatima Bello",
  "Grant Peralta",
  "Sienna Voss",
  "Dante Mosley",
  "Yolanda Kerr",
  "Asher Ruiz",
  "Vanessa Lund",
  "Hector Salinas",
  "Temperance Ford",
]

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
function pick<T>(list: T[], seed: number): T {
  return list[Math.floor(rnd(seed) * list.length) % list.length]
}
function formatPhone(seed: number): string {
  const area = 200 + Math.floor(rnd(seed) * 700)
  const prefix = 200 + Math.floor(rnd(seed + 1) * 700)
  const line = 1000 + Math.floor(rnd(seed + 2) * 9000)
  return `(${area}) ${prefix}-${line}`
}

const SOURCE_POOL: LeadSource[] = [
  "inbound_call",
  "transfer",
  "callback_requested",
  "web_form",
  "digital_ad",
  "inbound_call",
  "callback_requested",
]

const NOTES_POOL = [
  "Verbally committed to enroll, asked for bank details",
  "Wanted to discuss with spouse tonight - callback 7 PM",
  "Qualified $24K+, ready to move forward Monday",
  "Reviewing competing offer from Freedom Debt, needs pitch",
  "Received soft approval, waiting on paystub",
  "Had bad experience with prior company, rebuild trust",
  "Asked about legal protections - supervisor callback",
  "Payment day is 15th, wants enrollment aligned",
  "Very motivated - collector call this morning spooked them",
  "Second call, previously objected to monthly deposit",
  "First-call hot - expressed urgency, settlement offer pending",
  "Hardship verified, ready to upload docs",
]

function temperatureForScore(score: number): LeadTemperature {
  if (score >= 85) return "blazing"
  if (score >= 70) return "hot"
  if (score >= 55) return "warm"
  return "cooling"
}

function generateHotLeads(): HotLead[] {
  const agents = mockUsers.filter((u) => u.role === "agent")
  const leads: HotLead[] = []
  const count = 48

  for (let i = 0; i < count; i++) {
    const seed = hash(`hl-${i}`)
    const score = 40 + Math.floor(rnd(seed) * 60)
    const temp = temperatureForScore(score)
    const source = pick(SOURCE_POOL, seed + 1)
    const debtEstimate = 14000 + Math.floor(rnd(seed + 2) * 78000)
    const numCreditors = 2 + Math.floor(rnd(seed + 3) * 7)
    const state =
      rnd(seed + 4) > 0.95
        ? Array.from(STATES_RESTRICTED)[
            Math.floor(rnd(seed + 5) * STATES_RESTRICTED.size)
          ]
        : pick(STATES_ALL, seed + 6)
    const lastOffsetMin = Math.floor(rnd(seed + 7) * 2880) // up to 2 days ago
    const callbackOffsetMin =
      source === "callback_requested"
        ? Math.floor(rnd(seed + 8) * 720) // within next 12h
        : rnd(seed + 8) > 0.55
        ? Math.floor(rnd(seed + 9) * 480) // within 8h
        : undefined
    const callsAttempted = Math.floor(rnd(seed + 10) * 5)
    // Assign to an agent if hot/blazing or if source is transfer (they stick)
    const shouldAssign =
      temp === "blazing" || temp === "hot" || source === "transfer"
    const assignedAgent = shouldAssign
      ? agents[Math.floor(rnd(seed + 11) * agents.length)]
      : undefined
    leads.push({
      id: `HL-${(10000 + i).toString().padStart(5, "0")}`,
      customerName: pick(LEAD_NAMES, seed + 12),
      customerPhone: formatPhone(seed + 13),
      customerState: state,
      debtEstimate,
      numCreditors,
      temperature: temp,
      score,
      source,
      lastInteraction: new Date(
        Date.now() - lastOffsetMin * 60 * 1000,
      ).toISOString(),
      nextCallbackAt: callbackOffsetMin
        ? new Date(Date.now() + callbackOffsetMin * 60 * 1000).toISOString()
        : undefined,
      notes: pick(NOTES_POOL, seed + 14),
      assignedAgentId: assignedAgent?.id,
      assignedAgentName: assignedAgent?.name,
      teamId: assignedAgent?.teamId,
      teamName: assignedAgent?.teamName,
      callsAttempted,
      talkTimeSec: 60 + Math.floor(rnd(seed + 15) * 1600),
      hasVerbalCommit: score >= 78,
      languagePreference: rnd(seed + 16) > 0.82 ? "ES" : "EN",
      licensedStatesIssue: STATES_RESTRICTED.has(state),
    })
  }

  return leads
}

const TEMP_CFG: Record<
  LeadTemperature,
  { label: string; className: string; dot: string }
> = {
  blazing: {
    label: "Blazing",
    className: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    dot: "bg-rose-500",
  },
  hot: {
    label: "Hot",
    className: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    dot: "bg-orange-500",
  },
  warm: {
    label: "Warm",
    className: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    dot: "bg-amber-500",
  },
  cooling: {
    label: "Cooling",
    className: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    dot: "bg-sky-500",
  },
}

const SOURCE_LABEL: Record<LeadSource, string> = {
  inbound_call: "Inbound",
  transfer: "Transfer",
  callback_requested: "Callback",
  web_form: "Web Form",
  digital_ad: "Digital Ad",
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function timeUntil(iso: string): string {
  const mins = Math.floor((new Date(iso).getTime() - Date.now()) / 60000)
  if (mins < 0) return `${Math.abs(mins)}m overdue`
  if (mins < 60) return `in ${mins}m`
  const hours = Math.floor(mins / 60)
  return `in ${hours}h ${mins % 60}m`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function HotLeadsPage() {
  const { user } = useAuth()
  const scope = useTeamScope()
  const allLeads = React.useMemo(() => generateHotLeads(), [])

  const [tempFilter, setTempFilter] = React.useState<"all" | LeadTemperature>(
    "all",
  )
  const [sourceFilter, setSourceFilter] = React.useState<"all" | LeadSource>(
    "all",
  )
  const [search, setSearch] = React.useState("")
  const [assignmentFilter, setAssignmentFilter] = React.useState<
    "all" | "assigned" | "unassigned"
  >("all")

  // Scope filter
  const scopedLeads = React.useMemo(() => {
    if (scope.isOrgWide) return allLeads
    if (scope.isSelfOnly && user)
      return allLeads.filter((l) => l.assignedAgentId === user.id)
    // Team lead / supervisor: show leads assigned to their agents + all unassigned (fair game)
    const allowedAgents = new Set(scope.agentIds)
    return allLeads.filter(
      (l) => !l.assignedAgentId || allowedAgents.has(l.assignedAgentId),
    )
  }, [allLeads, scope, user])

  const filtered = React.useMemo(() => {
    return scopedLeads.filter((l) => {
      if (tempFilter !== "all" && l.temperature !== tempFilter) return false
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false
      if (assignmentFilter === "assigned" && !l.assignedAgentId) return false
      if (assignmentFilter === "unassigned" && l.assignedAgentId) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !l.customerName.toLowerCase().includes(q) &&
          !l.customerPhone.toLowerCase().includes(q) &&
          !l.id.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [scopedLeads, tempFilter, sourceFilter, assignmentFilter, search])

  const sortedByScore = React.useMemo(
    () => [...filtered].sort((a, b) => b.score - a.score),
    [filtered],
  )

  const blazingCount = scopedLeads.filter((l) => l.temperature === "blazing")
    .length
  const hotCount = scopedLeads.filter((l) => l.temperature === "hot").length
  const unassignedCount = scopedLeads.filter((l) => !l.assignedAgentId).length
  const totalDebt = scopedLeads.reduce((s, l) => s + l.debtEstimate, 0)
  const licensedIssues = scopedLeads.filter((l) => l.licensedStatesIssue).length
  const dueNow = scopedLeads.filter(
    (l) =>
      l.nextCallbackAt &&
      new Date(l.nextCallbackAt).getTime() - Date.now() < 30 * 60 * 1000 &&
      new Date(l.nextCallbackAt).getTime() - Date.now() > -15 * 60 * 1000,
  ).length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <Flame className="size-6 text-orange-500" />
            Hot Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            High-intent prospects ranked by score -{" "}
            <span className="text-primary font-medium">
              Scope: {scope.label}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="size-3.5 mr-1" />
            Scoring Rules
          </Button>
          <Button size="sm">
            <UserCheck className="size-3.5 mr-1" />
            Auto-Assign
          </Button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Blazing
                </p>
                <p
                  className="text-2xl font-bold tabular-nums text-rose-400"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {blazingCount}
                </p>
              </div>
              <Flame className="size-5 text-rose-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Hot
                </p>
                <p
                  className="text-2xl font-bold tabular-nums text-orange-400"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {hotCount}
                </p>
              </div>
              <Thermometer className="size-5 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Unassigned
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {unassignedCount}
                </p>
              </div>
              <UserIcon className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Total Debt
                </p>
                <p
                  className="text-2xl font-bold tabular-nums text-primary"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {formatCurrency(totalDebt).replace(/,\d{3}$/, "K")}
                </p>
              </div>
              <DollarSign className="size-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(licensedIssues > 0 && "border-amber-500/30 bg-amber-500/5")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Callback Due
                </p>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {dueNow}
                </p>
              </div>
              <Clock className="size-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance alert */}
      {licensedIssues > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {licensedIssues} lead{licensedIssues === 1 ? "" : "s"} in
                  restricted states
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These leads are in states where we are not licensed to enroll
                  (KS, WV, ME, CT, VT). Do not outbound; forward to compliance
                  for review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search name, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72"
            />
            <Select
              value={tempFilter}
              onValueChange={(v) => setTempFilter(v as typeof tempFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Temperatures</SelectItem>
                <SelectItem value="blazing">Blazing (85+)</SelectItem>
                <SelectItem value="hot">Hot (70-84)</SelectItem>
                <SelectItem value="warm">Warm (55-69)</SelectItem>
                <SelectItem value="cooling">Cooling (&lt;55)</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={(v) => setSourceFilter(v as typeof sourceFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="inbound_call">Inbound</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="callback_requested">Callback</SelectItem>
                <SelectItem value="web_form">Web Form</SelectItem>
                <SelectItem value="digital_ad">Digital Ad</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={assignmentFilter}
              onValueChange={(v) =>
                setAssignmentFilter(v as typeof assignmentFilter)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground tabular-nums">
              Showing <span className="font-semibold">{filtered.length}</span>{" "}
              of {scopedLeads.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {sortedByScore.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {sortedByScore.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Flame className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No leads match your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LeadCard({ lead }: { lead: HotLead }) {
  const tempCfg = TEMP_CFG[lead.temperature]
  return (
    <Card
      className={cn(
        "hover:border-primary/40 transition-colors cursor-pointer",
        lead.licensedStatesIssue && "border-amber-500/40",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn("size-2.5 rounded-full shrink-0", tempCfg.dot)}
            />
            <span className="font-semibold truncate">{lead.customerName}</span>
            {lead.languagePreference === "ES" && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                ES
              </Badge>
            )}
          </div>
          <Badge variant="outline" className={cn("text-[10px]", tempCfg.className)}>
            {lead.score}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="size-3" />
          <span className="font-mono">{lead.customerPhone}</span>
          <span className="text-border">-</span>
          <MapPin className="size-3" />
          <span
            className={
              lead.licensedStatesIssue ? "text-amber-400 font-semibold" : ""
            }
          >
            {lead.customerState}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        <p className="text-xs text-foreground/80 line-clamp-2 italic">
          &ldquo;{lead.notes}&rdquo;
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">Debt</p>
            <p className="font-mono font-semibold text-primary">
              {formatCurrency(lead.debtEstimate)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">
              Creditors
            </p>
            <p className="font-mono">{lead.numCreditors}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase">
              Attempts
            </p>
            <p className="font-mono">{lead.callsAttempted}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {lead.assignedAgentId ? (
              <>
                <Avatar className="size-5">
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px]">
                    {lead.assignedAgentName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{lead.assignedAgentName}</span>
              </>
            ) : (
              <span className="italic text-amber-400">Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
              {SOURCE_LABEL[lead.source]}
            </Badge>
            {lead.nextCallbackAt ? (
              <span className="font-mono">
                <Clock className="size-2.5 inline mr-0.5" />
                {timeUntil(lead.nextCallbackAt)}
              </span>
            ) : (
              <span className="font-mono">{timeAgo(lead.lastInteraction)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <Button size="sm" variant="default" className="flex-1 h-8 text-xs">
            <PhoneCall className="size-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <MessageSquare className="size-3" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
