"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Target, Lock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Tier = {
  name: string
  closesRequired: number
  bonusPercent: number
  color: string
}

type Props = {
  daily: { current: number; target: number }
  weekly: { current: number; target: number }
  monthly: { current: number; target: number }
}

const TIERS: Tier[] = [
  { name: "Bronze", closesRequired: 8, bonusPercent: 0, color: "chart-5" },
  { name: "Silver", closesRequired: 15, bonusPercent: 5, color: "chart-2" },
  { name: "Gold", closesRequired: 25, bonusPercent: 10, color: "chart-4" },
  { name: "Platinum", closesRequired: 40, bonusPercent: 20, color: "primary" },
]

function Ring({
  progress,
  size = 160,
  stroke = 12,
  children,
  colorClass = "text-primary",
}: {
  progress: number
  size?: number
  stroke?: number
  children: React.ReactNode
  colorClass?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, progress))
  const offset = circumference - (pct / 100) * circumference

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-muted"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none stroke-current transition-all duration-1000 ease-out", colorClass)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export function GoalRing({ daily, weekly, monthly }: Props) {
  const monthlyPct = monthly.target > 0 ? (monthly.current / monthly.target) * 100 : 0

  // Figure out current tier + next tier
  const currentTier = [...TIERS]
    .reverse()
    .find((t) => monthly.current >= t.closesRequired)
  const nextTier = TIERS.find((t) => monthly.current < t.closesRequired)
  const tierProgress = nextTier
    ? ((monthly.current - (currentTier?.closesRequired ?? 0)) /
        (nextTier.closesRequired - (currentTier?.closesRequired ?? 0))) *
      100
    : 100
  const closesToNextTier = nextTier ? nextTier.closesRequired - monthly.current : 0

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
            <Target className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Monthly Goal</h3>
            <p className="text-[11px] text-muted-foreground">Unlock bonus tiers</p>
          </div>
        </div>
        {currentTier && (
          <div
            className={cn(
              "rounded-full border px-2 py-1 text-[11px] font-semibold",
              currentTier.color === "chart-5" && "border-chart-5/40 bg-chart-5/10 text-chart-5",
              currentTier.color === "chart-2" && "border-chart-2/40 bg-chart-2/10 text-chart-2",
              currentTier.color === "chart-4" && "border-chart-4/40 bg-chart-4/10 text-chart-4",
              currentTier.color === "primary" && "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            {currentTier.name}
            {currentTier.bonusPercent > 0 && ` +${currentTier.bonusPercent}%`}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <Ring progress={monthlyPct} colorClass="text-primary">
          <div className="font-mono text-3xl font-bold tabular-nums">
            {monthly.current}
          </div>
          <div className="text-[11px] text-muted-foreground">
            of {monthly.target} target
          </div>
        </Ring>
        {nextTier ? (
          <div className="text-center text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {closesToNextTier} more
            </span>{" "}
            to unlock{" "}
            <span
              className={cn(
                "font-semibold",
                nextTier.color === "chart-5" && "text-chart-5",
                nextTier.color === "chart-2" && "text-chart-2",
                nextTier.color === "chart-4" && "text-chart-4",
                nextTier.color === "primary" && "text-primary",
              )}
            >
              {nextTier.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-3.5" />
            Platinum tier locked in
          </div>
        )}
      </div>

      {/* Tier ladder */}
      <div className="mt-4 space-y-1.5">
        {TIERS.map((tier) => {
          const unlocked = monthly.current >= tier.closesRequired
          return (
            <div
              key={tier.name}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-xs",
                unlocked ? "bg-muted/50" : "opacity-50",
              )}
            >
              <div className="flex items-center gap-2">
                {unlocked ? (
                  <CheckCircle2
                    className={cn(
                      "size-3.5",
                      tier.color === "chart-5" && "text-chart-5",
                      tier.color === "chart-2" && "text-chart-2",
                      tier.color === "chart-4" && "text-chart-4",
                      tier.color === "primary" && "text-primary",
                    )}
                  />
                ) : (
                  <Lock className="size-3.5 text-muted-foreground" />
                )}
                <span className={cn("font-semibold", !unlocked && "text-muted-foreground")}>
                  {tier.name}
                </span>
              </div>
              <div className="font-mono text-muted-foreground tabular-nums">
                {tier.closesRequired} closes
                {tier.bonusPercent > 0 && (
                  <span className="ml-2 font-semibold text-foreground">
                    +{tier.bonusPercent}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Daily/Weekly strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wide">Today</span>
            <span className="font-mono tabular-nums">
              {daily.current}/{daily.target}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-3 transition-all"
              style={{
                width: `${Math.min(100, (daily.current / Math.max(1, daily.target)) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wide">This week</span>
            <span className="font-mono tabular-nums">
              {weekly.current}/{weekly.target}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-chart-2 transition-all"
              style={{
                width: `${Math.min(100, (weekly.current / Math.max(1, weekly.target)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
