"use client"

import * as React from "react"
import {
  Sunrise,
  Target,
  Trophy,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Megaphone,
  Flame,
  Users,
  DollarSign,
  ArrowRight,
  Calendar,
  Phone,
  Printer,
  CheckCircle2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { useTeamScope, getScopedAgents } from "@/lib/team-scope"
import { dataService, mockUsers } from "@/lib/mock-data"

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

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`
  return `$${val.toLocaleString()}`
}

export default function DailyHuddlePage() {
  const { user } = useAuth()
  const scope = useTeamScope()

  const today = new Date()
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" })
  const dateStr = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Scope agents + yesterday's results
  const agents = React.useMemo(() => {
    if (scope.isOrgWide) return mockUsers.filter((u) => u.role === "agent")
    return getScopedAgents(scope)
  }, [scope])

  // Yesterday's "winners" -- seeded deterministic
  const winners = React.useMemo(() => {
    return agents
      .map((a) => {
        const seed = hash(`huddle-${a.id}-${today.toDateString()}`)
        const units = Math.floor(rnd(seed) * 5)
        const debt = units * (12000 + Math.floor(rnd(seed + 1) * 25000))
        const ancillary = Math.floor(rnd(seed + 2) * 3)
        return {
          agentId: a.id,
          agentName: a.name,
          teamName: a.teamName ?? "Unassigned",
          units,
          debt,
          ancillary,
        }
      })
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 5)
  }, [agents, today])

  // Agents behind pace -- seeded
  const behindPace = React.useMemo(() => {
    return agents
      .map((a) => {
        const seed = hash(`pace-${a.id}-${today.toDateString()}`)
        const pacing = 30 + Math.floor(rnd(seed) * 70)
        return {
          agentId: a.id,
          agentName: a.name,
          teamName: a.teamName ?? "Unassigned",
          pacing,
          deficit: Math.max(0, 100 - pacing),
        }
      })
      .filter((a) => a.pacing < 75)
      .sort((a, b) => a.pacing - b.pacing)
      .slice(0, 6)
  }, [agents, today])

  // Today's target - computed from agents * default target
  const dailyTargetUnits = agents.length * 2 // 2 units/agent/day target
  const dailyTargetDebt = agents.length * 45_000
  const yesterdayUnits = winners.reduce((s, w) => s + w.units, 0) * 3 // extrapolated
  const yesterdayDebt = winners.reduce((s, w) => s + w.debt, 0) * 2

  // Theme of the day - rotates daily
  const themes = [
    {
      title: "Payment Structure Precision",
      body: "Lead with the monthly deposit that fits their budget. Anchor first, then justify with the debt reduction.",
    },
    {
      title: "Objection -> Question",
      body: "Every objection is a question in disguise. &quot;I need to think about it&quot; = &quot;I don't understand the value yet.&quot;",
    },
    {
      title: "Verbal Commit Before Docs",
      body: "Don't move to bank setup until you have a clear verbal commit. Confirm twice, request docs third.",
    },
    {
      title: "Urgency Without Pressure",
      body: "Their interest compounds daily. Paint the math: $1,000/mo in interest = $33/day they don't come back.",
    },
    {
      title: "Listen 70, Talk 30",
      body: "Your top closers talk 30% of the call. Ask open-ended questions and let them sell themselves.",
    },
  ]
  const themeIdx = today.getDate() % themes.length
  const theme = themes[themeIdx]

  // Announcements - pull latest
  const announcements = React.useMemo(() => {
    return dataService.getAnnouncements().slice(0, 3)
  }, [])

  // Focus list from coaching-style logic
  const floorFocus = React.useMemo(() => {
    // Show top blockers: conversion, hold-time, call volume
    return [
      {
        label: "Average Talk Time",
        value: "4:12",
        delta: -8,
        trend: "down" as const,
        desc: "Shorter calls = more throughput. Kill the small talk.",
      },
      {
        label: "Qualified Conversion",
        value: "22.4%",
        delta: +3.1,
        trend: "up" as const,
        desc: "Great week. Keep the qualification tight.",
      },
      {
        label: "First-Call Enrolls",
        value: "7",
        delta: +2,
        trend: "up" as const,
        desc: "Momentum is there. Push for a verbal commit on every hot call.",
      },
    ]
  }, [])

  // Callbacks due today
  const callbacksToday = 34

  const scopeLabel =
    scope.level === "org"
      ? "Floor-wide"
      : scope.level === "teams"
      ? `${scope.teamIds.length} teams`
      : scope.level === "team"
      ? scope.teamNames[0] ?? "Your team"
      : "Your view"

  return (
    <div className="flex flex-col gap-6 p-6 print:p-3 print:gap-3">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-b print:pb-3">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center print:hidden">
            <Sunrise className="size-6 text-primary" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Daily Huddle - {dayOfWeek}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {dateStr} - {scopeLabel} - {agents.length} agent
              {agents.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5 mr-1" />
            Print for Floor
          </Button>
          <Button size="sm">
            <CheckCircle2 className="size-3.5 mr-1" />
            Mark Huddle Done
          </Button>
        </div>
      </header>

      {/* Theme of the day */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Target className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                Today&apos;s Focus
              </p>
              <h2
                className="text-xl font-bold mt-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {theme.title}
              </h2>
              <p
                className="text-sm text-muted-foreground mt-2 max-w-2xl"
                dangerouslySetInnerHTML={{ __html: theme.body }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yesterday at a glance + today's target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="size-4" />
              Yesterday
            </CardTitle>
            <CardDescription>How we closed the day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Units
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {yesterdayUnits}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Debt
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5 text-primary"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {formatCurrency(yesterdayDebt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ancillary
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {winners.reduce((s, w) => s + w.ancillary, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="size-4" />
              Today&apos;s Target
            </CardTitle>
            <CardDescription>Here&apos;s what we need</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Units
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {dailyTargetUnits}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Debt
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5 text-primary"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {formatCurrency(dailyTargetDebt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Callbacks
                </p>
                <p
                  className="text-2xl font-bold tabular-nums mt-0.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {callbacksToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yesterday's winners */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="size-4 text-yellow-500" />
            Top Performers - Yesterday
          </CardTitle>
          <CardDescription>
            Let&apos;s give them a round of applause
          </CardDescription>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No closed units yesterday - let&apos;s turn that around today.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {winners.map((w, idx) => (
                <div
                  key={w.agentId}
                  className={cn(
                    "rounded-md border border-border/50 bg-card/60 p-3 flex flex-col items-center text-center",
                    idx === 0 && "border-yellow-500/40 bg-yellow-500/5",
                  )}
                >
                  <Avatar className="size-12 mb-2">
                    <AvatarFallback
                      className={cn(
                        "text-sm font-semibold",
                        idx === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {w.agentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {idx === 0 && (
                    <Badge className="bg-yellow-500 text-background mb-1 text-[9px]">
                      #1
                    </Badge>
                  )}
                  <p className="text-sm font-medium truncate w-full">
                    {w.agentName}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate w-full">
                    {w.teamName}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                    <span className="font-mono tabular-nums">
                      <span className="text-primary font-semibold">{w.units}</span>{" "}
                      units
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {formatCurrency(w.debt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI focus trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {floorFocus.map((f) => (
          <Card key={f.label}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {f.label}
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums mt-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {f.value}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono",
                    f.trend === "up"
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-rose-500/40 text-rose-400 bg-rose-500/10",
                  )}
                >
                  {f.trend === "up" ? (
                    <TrendingUp className="size-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="size-3 mr-0.5" />
                  )}
                  {f.delta > 0 && "+"}
                  {f.delta}
                  {typeof f.delta === "number" && Math.abs(f.delta) < 20 ? "%" : ""}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Behind pace + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!scope.isSelfOnly && behindPace.length > 0 && (
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                Needs Attention
              </CardTitle>
              <CardDescription>
                Agents trailing pace - pair them with a mentor or run a lightning 1:1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                {behindPace.map((a) => (
                  <div
                    key={a.agentId}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-amber-500/10 text-amber-400 text-[10px]">
                          {a.agentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {a.agentName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {a.teamName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Pace</span>
                          <span
                            className={cn(
                              "font-mono font-semibold",
                              a.pacing < 50
                                ? "text-rose-400"
                                : a.pacing < 70
                                ? "text-amber-400"
                                : "text-muted-foreground",
                            )}
                          >
                            {a.pacing}%
                          </span>
                        </div>
                        <Progress
                          value={a.pacing}
                          className={cn(
                            "h-1",
                            a.pacing < 50 && "[&>div]:bg-rose-500",
                            a.pacing >= 50 && a.pacing < 70 && "[&>div]:bg-amber-500",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="size-4 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>What the floor needs to know</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nothing posted. Add one to share with the team.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md border border-border/50 bg-card/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] shrink-0",
                          a.priority === "urgent" &&
                            "border-rose-500/40 text-rose-400 bg-rose-500/10",
                          a.priority === "high" &&
                            "border-orange-500/40 text-orange-400 bg-orange-500/10",
                          a.priority === "medium" &&
                            "border-amber-500/40 text-amber-400 bg-amber-500/10",
                          a.priority === "low" && "text-muted-foreground",
                        )}
                      >
                        {a.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick jump */}
      <Card className="print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">After Huddle - Jump In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickLink
              href="/calls"
              icon={<Phone className="size-4" />}
              label="Command Center"
              desc="Live floor"
            />
            <QuickLink
              href="/calls/hot-leads"
              icon={<Flame className="size-4" />}
              label="Hot Leads"
              desc="Top scores"
            />
            <QuickLink
              href="/coaching"
              icon={<Users className="size-4" />}
              label="Coaching"
              desc="1:1 sessions"
            />
            <QuickLink
              href="/leaderboards"
              icon={<DollarSign className="size-4" />}
              label="Leaderboards"
              desc="Rankings"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function QuickLink({
  href,
  icon,
  label,
  desc,
}: {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-md border border-border/50 bg-card/60 p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </a>
  )
}
