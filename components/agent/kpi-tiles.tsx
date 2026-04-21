"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Trophy,
  DollarSign,
  Percent,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

type TileProps = {
  label: string
  value: string | number
  sub?: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  progress?: number
  progressLabel?: string
}

function Trend({ change }: { change?: number }) {
  if (change === undefined) return null
  const positive = change > 0
  const negative = change < 0
  const flat = change === 0
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
        positive && "bg-chart-3/15 text-chart-3",
        negative && "bg-destructive/15 text-destructive",
        flat && "bg-muted text-muted-foreground",
      )}
    >
      {positive ? (
        <ArrowUp className="size-2.5" />
      ) : negative ? (
        <ArrowDown className="size-2.5" />
      ) : (
        <Minus className="size-2.5" />
      )}
      {Math.abs(change).toFixed(1)}%
    </div>
  )
}

function Tile({
  label,
  value,
  sub,
  change,
  icon: Icon,
  iconColor,
  accent = "primary",
  progress,
  progressLabel,
}: TileProps) {
  return (
    <Card className="relative overflow-hidden p-4">
      {/* Accent bar on the left */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          accent === "primary" && "bg-primary",
          accent === "chart-2" && "bg-chart-2",
          accent === "chart-3" && "bg-chart-3",
          accent === "chart-4" && "bg-chart-4",
          accent === "chart-5" && "bg-chart-5",
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              iconColor,
            )}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          </div>
        </div>
        <Trend change={change} />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <div className="font-mono text-2xl font-bold tabular-nums leading-none">
          {value}
        </div>
      </div>

      {sub && (
        <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
      )}

      {typeof progress === "number" && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                accent === "primary" && "bg-primary",
                accent === "chart-2" && "bg-chart-2",
                accent === "chart-3" && "bg-chart-3",
                accent === "chart-4" && "bg-chart-4",
                accent === "chart-5" && "bg-chart-5",
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {progressLabel && (
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{progressLabel}</span>
              <span className="font-mono tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

type Props = {
  unitsClosed: {
    mtd: number
    change: number
    target: number
    today: number
  }
  debtEnrolled: {
    mtd: number
    change: number
    target: number
    avgPerDeal: number
  }
  qualifiedConversion: {
    rate: number
    change: number
    closed: number
    assigned: number
  }
  qcScore: {
    score: number
    change: number
    evaluations: number
    grade: string
  }
}

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

export function KpiTiles({
  unitsClosed,
  debtEnrolled,
  qualifiedConversion,
  qcScore,
}: Props) {
  const unitsPct =
    unitsClosed.target > 0
      ? (unitsClosed.mtd / unitsClosed.target) * 100
      : 0
  const debtPct =
    debtEnrolled.target > 0
      ? (debtEnrolled.mtd / debtEnrolled.target) * 100
      : 0

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile
        label="Units Closed"
        value={unitsClosed.mtd}
        sub={`${unitsClosed.today} today · target ${unitsClosed.target}`}
        change={unitsClosed.change}
        icon={Trophy}
        iconColor="bg-primary/15 text-primary"
        accent="primary"
        progress={unitsPct}
        progressLabel="Monthly target"
      />
      <Tile
        label="Debt Enrolled"
        value={formatMoney(debtEnrolled.mtd)}
        sub={`Avg ${formatMoney(debtEnrolled.avgPerDeal)} per deal`}
        change={debtEnrolled.change}
        icon={DollarSign}
        iconColor="bg-chart-3/15 text-chart-3"
        accent="chart-3"
        progress={debtPct}
        progressLabel="Monthly target"
      />
      <Tile
        label="Qualified Conv."
        value={`${qualifiedConversion.rate.toFixed(1)}%`}
        sub={`${qualifiedConversion.closed} of ${qualifiedConversion.assigned} qualified`}
        change={qualifiedConversion.change}
        icon={Percent}
        iconColor="bg-chart-2/15 text-chart-2"
        accent="chart-2"
        progress={qualifiedConversion.rate}
        progressLabel="Conversion rate"
      />
      <Tile
        label="QC Score"
        value={qcScore.score.toFixed(1)}
        sub={`Grade ${qcScore.grade} · ${qcScore.evaluations} evals`}
        change={qcScore.change}
        icon={ShieldCheck}
        iconColor="bg-chart-4/15 text-chart-4"
        accent="chart-4"
        progress={qcScore.score}
        progressLabel="Quality score"
      />
    </div>
  )
}
