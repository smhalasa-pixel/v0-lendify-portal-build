"use client"

import * as React from "react"
import {
  PhoneCall,
  FileSignature,
  TrendingUp,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Calendar,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type DealStage = "qualifying" | "quoted" | "negotiation" | "closing" | "won" | "lost"

interface Deal {
  id: string
  clientName: string
  agent: string
  value: number
  stage: DealStage
  probability: number
  lastActivity: string
  product: string
}

const mockDeals: Deal[] = [
  { id: "D-7142", clientName: "Morgan Retail Group", agent: "Sarah Johnson", value: 48500, stage: "qualifying", probability: 15, lastActivity: "2h ago", product: "Equipment Lease" },
  { id: "D-7143", clientName: "Delta Construction LLC", agent: "David Williams", value: 125000, stage: "qualifying", probability: 20, lastActivity: "4h ago", product: "Working Capital" },
  { id: "D-7144", clientName: "Summit Cafes", agent: "Emily Brown", value: 32000, stage: "qualifying", probability: 25, lastActivity: "1h ago", product: "Line of Credit" },
  { id: "D-7120", clientName: "North Star Logistics", agent: "Sarah Johnson", value: 89000, stage: "quoted", probability: 40, lastActivity: "yesterday", product: "Equipment Lease" },
  { id: "D-7121", clientName: "Harbor Medical Supply", agent: "Michael Chen", value: 215000, stage: "quoted", probability: 45, lastActivity: "3h ago", product: "Term Loan" },
  { id: "D-7098", clientName: "Peak Performance Gym", agent: "David Williams", value: 56000, stage: "negotiation", probability: 65, lastActivity: "30m ago", product: "Working Capital" },
  { id: "D-7099", clientName: "Riverfront Hospitality", agent: "Sarah Johnson", value: 178000, stage: "negotiation", probability: 70, lastActivity: "1h ago", product: "Term Loan" },
  { id: "D-7077", clientName: "Vanguard Auto Parts", agent: "Emily Brown", value: 94000, stage: "closing", probability: 85, lastActivity: "15m ago", product: "Equipment Lease" },
  { id: "D-7078", clientName: "Cascade Printing Co", agent: "Michael Chen", value: 42000, stage: "closing", probability: 90, lastActivity: "45m ago", product: "Line of Credit" },
  { id: "D-7055", clientName: "Summit Industrial", agent: "David Williams", value: 310000, stage: "won", probability: 100, lastActivity: "today", product: "Term Loan" },
  { id: "D-7056", clientName: "Keystone Trucking", agent: "Sarah Johnson", value: 67000, stage: "won", probability: 100, lastActivity: "today", product: "Working Capital" },
  { id: "D-7030", clientName: "Legacy Retail", agent: "Michael Chen", value: 22000, stage: "lost", probability: 0, lastActivity: "2 days ago", product: "Line of Credit" },
]

const STAGES: Array<{ id: DealStage; label: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = [
  { id: "qualifying", label: "Qualifying", icon: PhoneCall, accent: "bg-zinc-500" },
  { id: "quoted", label: "Quoted", icon: FileSignature, accent: "bg-sky-500" },
  { id: "negotiation", label: "Negotiation", icon: TrendingUp, accent: "bg-violet-500" },
  { id: "closing", label: "Closing", icon: CheckCircle2, accent: "bg-amber-500" },
  { id: "won", label: "Won", icon: CheckCircle2, accent: "bg-emerald-500" },
  { id: "lost", label: "Lost", icon: XCircle, accent: "bg-rose-500" },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-md border border-border/50 bg-card/60 p-3 hover:border-border transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-foreground line-clamp-1">{deal.clientName}</p>
        <span className="text-[10px] font-mono text-muted-foreground shrink-0">{deal.id}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">{deal.product}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-foreground font-semibold tabular-nums">
          <DollarSign className="size-3 text-[#E8B746]" />
          {formatCurrency(deal.value).replace("$", "")}
        </div>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono">
          {deal.probability}%
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="size-2.5" />
          {deal.agent.split(" ")[0]}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-2.5" />
          {deal.lastActivity}
        </span>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const totalPipelineValue = React.useMemo(
    () => mockDeals.filter((d) => d.stage !== "lost" && d.stage !== "won").reduce((s, d) => s + d.value, 0),
    []
  )
  const weightedValue = React.useMemo(
    () =>
      mockDeals
        .filter((d) => d.stage !== "lost" && d.stage !== "won")
        .reduce((s, d) => s + (d.value * d.probability) / 100, 0),
    []
  )
  const wonValue = React.useMemo(
    () => mockDeals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0),
    []
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live deal flow across all stages — drag to advance (coming soon).
          </p>
        </div>
        <Button style={{ backgroundColor: "#E8B746", color: "#0a0a0a" }}>
          + New Deal
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "Georgia, serif" }}>
              {formatCurrency(totalPipelineValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockDeals.filter((d) => d.stage !== "lost" && d.stage !== "won").length} active deals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Weighted Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "Georgia, serif", color: "#E8B746" }}>
              {formatCurrency(weightedValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">probability-adjusted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Closed (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-emerald-500" style={{ fontFamily: "Georgia, serif" }}>
              {formatCurrency(wonValue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mockDeals.filter((d) => d.stage === "won").length} deals won
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = mockDeals.filter((d) => d.stage === stage.id)
          const stageValue = stageDeals.reduce((s, d) => s + d.value, 0)
          const Icon = stage.icon
          return (
            <div key={stage.id} className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stage.accent}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">({stageDeals.length})</span>
                </div>
                <Icon className="size-3.5 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground px-1 tabular-nums">
                {formatCurrency(stageValue)}
              </p>
              <div className="flex flex-col gap-2 min-h-[200px]">
                {stageDeals.length === 0 ? (
                  <div className="flex items-center justify-center h-24 border border-dashed border-border/40 rounded-md">
                    <p className="text-[11px] text-muted-foreground">Empty</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
