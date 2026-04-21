"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Sparkles, TrendingUp, Zap, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  firstName: string
  teamName: string
  floorRank: number
  teamRank: number
  teamSize: number
  rankChange: number
  streakDays: number
  levelName: string
  levelNumber: number
  levelProgress: number // 0-100
  nextLevelName: string
  totalClosesLifetime: number
  todayCloses: number
  yesterdayCloses: number
}

function useGreeting() {
  const [greeting, setGreeting] = React.useState("Welcome back")

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 5) setGreeting("Burning the midnight oil")
    else if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else if (hour < 21) setGreeting("Good evening")
    else setGreeting("Working late")
  }, [])

  return greeting
}

function useClock() {
  const [time, setTime] = React.useState("")

  React.useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

export function AgentHero({
  firstName,
  teamName,
  floorRank,
  teamRank,
  teamSize,
  rankChange,
  streakDays,
  levelName,
  levelNumber,
  levelProgress,
  nextLevelName,
  totalClosesLifetime,
  todayCloses,
  yesterdayCloses,
}: Props) {
  const greeting = useGreeting()
  const clock = useClock()

  const todayVsYesterday = todayCloses - yesterdayCloses
  const paceLabel =
    todayVsYesterday > 0
      ? `Ahead of yesterday by ${todayVsYesterday}`
      : todayVsYesterday === 0
        ? "Tied with yesterday's pace"
        : `Behind yesterday by ${Math.abs(todayVsYesterday)}`

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 lg:p-6">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -bottom-20 size-56 rounded-full bg-chart-3/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Greeting + pace */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex size-2 animate-pulse rounded-full bg-chart-3" />
            <span className="font-mono tabular-nums">{clock}</span>
            <span className="text-border">·</span>
            <span>{teamName}</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="size-3.5 text-chart-3" />
              <span>{paceLabel}</span>
            </p>
          </div>

          {/* Streak + Rank badges */}
          <div className="flex flex-wrap items-center gap-2">
            {streakDays > 0 && (
              <Badge
                variant="outline"
                className="gap-1.5 border-chart-5/40 bg-chart-5/10 text-chart-5"
              >
                <Flame className="size-3.5" />
                <span className="font-semibold">{streakDays}-day streak</span>
              </Badge>
            )}
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/40 bg-primary/10 text-primary"
            >
              <Crown className="size-3.5" />
              <span className="font-semibold">
                #{teamRank} of {teamSize} on team
              </span>
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-border/60">
              <Sparkles className="size-3.5" />
              <span>#{floorRank} on floor</span>
              {rankChange !== 0 && (
                <span
                  className={cn(
                    "ml-1 font-semibold",
                    rankChange > 0 ? "text-chart-3" : "text-destructive",
                  )}
                >
                  {rankChange > 0 ? "↑" : "↓"}
                  {Math.abs(rankChange)}
                </span>
              )}
            </Badge>
          </div>
        </div>

        {/* Right: Level card */}
        <div className="flex min-w-[280px] flex-col gap-3 rounded-lg border border-border/60 bg-background/40 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Level {levelNumber}
                  </div>
                  <div className="text-sm font-bold leading-tight">
                    {levelName}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Lifetime
              </div>
              <div className="font-mono text-lg font-bold tabular-nums">
                {totalClosesLifetime}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-1000"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{levelProgress.toFixed(0)}% to next</span>
              <span className="font-medium text-foreground/80">
                {nextLevelName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
