"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Target, CheckCircle2, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  daily: { current: number; target: number }
  weekly: { current: number; target: number }
  monthly: { current: number; target: number }
}

function Ring({
  progress,
  size = 180,
  stroke = 14,
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
          className={cn(
            "fill-none stroke-current transition-all duration-1000 ease-out",
            colorClass,
          )}
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
  const monthlyPct =
    monthly.target > 0 ? (monthly.current / monthly.target) * 100 : 0
  const remaining = Math.max(0, monthly.target - monthly.current)
  const goalHit = monthly.current >= monthly.target

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
            <Target className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Monthly Goal</h3>
            <p className="text-[11px] text-muted-foreground">
              {goalHit ? "Goal crushed" : `${remaining} to go`}
            </p>
          </div>
        </div>
        {goalHit && (
          <div className="rounded-full border border-chart-3/40 bg-chart-3/10 px-2 py-1 text-[11px] font-semibold text-chart-3">
            <div className="flex items-center gap-1">
              <Flame className="size-3" />
              On fire
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Ring
          progress={monthlyPct}
          colorClass={goalHit ? "text-chart-3" : "text-primary"}
        >
          <div className="font-mono text-4xl font-bold tabular-nums leading-none">
            {monthly.current}
          </div>
          <div className="mt-1 text-[11px] font-medium text-muted-foreground">
            of {monthly.target} target
          </div>
          <div
            className={cn(
              "mt-1 font-mono text-xs font-bold tabular-nums",
              goalHit ? "text-chart-3" : "text-primary",
            )}
          >
            {Math.round(monthlyPct)}%
          </div>
        </Ring>

        {goalHit ? (
          <div className="flex items-center gap-1 text-xs font-semibold text-chart-3">
            <CheckCircle2 className="size-3.5" />
            Monthly target secured
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{remaining}</span>{" "}
            more to hit your target
          </div>
        )}
      </div>

      {/* Today/Weekly strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/50 pt-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wide">Today</span>
            <span className="font-mono tabular-nums">
              {daily.current}/{daily.target}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                daily.current >= daily.target ? "bg-chart-3" : "bg-chart-2",
              )}
              style={{
                width: `${Math.min(
                  100,
                  (daily.current / Math.max(1, daily.target)) * 100,
                )}%`,
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {daily.current >= daily.target
              ? "Daily target hit"
              : `${Math.max(0, daily.target - daily.current)} to go`}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wide">
              This week
            </span>
            <span className="font-mono tabular-nums">
              {weekly.current}/{weekly.target}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                weekly.current >= weekly.target ? "bg-chart-3" : "bg-chart-4",
              )}
              style={{
                width: `${Math.min(
                  100,
                  (weekly.current / Math.max(1, weekly.target)) * 100,
                )}%`,
              }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {weekly.current >= weekly.target
              ? "Weekly target hit"
              : `${Math.max(0, weekly.target - weekly.current)} to go`}
          </div>
        </div>
      </div>
    </Card>
  )
}
