"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { useAuth } from "@/lib/auth-context"
import { dataService, mockUsers } from "@/lib/mock-data"
import { AgentHero } from "./agent-hero"
import { MoneyTicker } from "./money-ticker"
import { GoalRing } from "./goal-ring"
import { RankCard } from "./rank-card"
import { AchievementsRow } from "./achievements-row"
import { PaceTracker } from "./pace-tracker"
import { KpiTiles } from "./kpi-tiles"
import { ActivitySnapshot } from "./activity-snapshot"
import { MotivationCard } from "./motivation-card"
import { AnnouncementsList } from "@/components/dashboard/announcements-list"
import {
  PeriodSelector,
  computePeriodRange,
  type PeriodKey,
  type AgentPeriod,
} from "./period-selector"
import {
  currentMonthKey,
  resolveAgentTarget,
  useTargets,
} from "@/lib/targets"

// Level curve based on lifetime closes
const LEVEL_CURVE = [
  { level: 1, name: "Rookie", closes: 0 },
  { level: 2, name: "Prospect", closes: 10 },
  { level: 3, name: "Closer", closes: 25 },
  { level: 4, name: "Shark", closes: 50 },
  { level: 5, name: "Veteran", closes: 100 },
  { level: 6, name: "Elite", closes: 200 },
  { level: 7, name: "Legend", closes: 400 },
  { level: 8, name: "Hall of Fame", closes: 750 },
]

function computeLevel(totalCloses: number) {
  let current = LEVEL_CURVE[0]
  let next = LEVEL_CURVE[1]
  for (let i = 0; i < LEVEL_CURVE.length; i++) {
    if (totalCloses >= LEVEL_CURVE[i].closes) {
      current = LEVEL_CURVE[i]
      next = LEVEL_CURVE[i + 1] ?? LEVEL_CURVE[i]
    }
  }
  const span = next.closes - current.closes
  const into = totalCloses - current.closes
  const progress = span > 0 ? (into / span) * 100 : 100
  return {
    levelNumber: current.level,
    levelName: current.name,
    nextLevelName: next.name,
    levelProgress: Math.min(100, progress),
  }
}

// Deterministic pseudo-random for stable numbers per-user
function seeded(seed: string, max: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h) % max
}

function scoreToGrade(score: number): string {
  if (score >= 95) return "A+"
  if (score >= 90) return "A"
  if (score >= 87) return "A-"
  if (score >= 83) return "B+"
  if (score >= 80) return "B"
  if (score >= 77) return "B-"
  if (score >= 73) return "C+"
  if (score >= 70) return "C"
  if (score >= 67) return "C-"
  if (score >= 60) return "D"
  return "F"
}

export function AgentDashboard() {
  const { user } = useAuth()
  const { targets } = useTargets()

  // Resolved admin-set targets for this agent, this month
  const monthKey = React.useMemo(() => currentMonthKey(), [])
  const resolvedUnitsTarget = React.useMemo(
    () =>
      user
        ? resolveAgentTarget(
            {
              agentId: user.id,
              teamId: user.teamId,
              metric: "unitsClosed",
              periodKey: monthKey,
            },
            targets,
          )
        : null,
    [user, monthKey, targets],
  )
  const resolvedDebtTarget = React.useMemo(
    () =>
      user
        ? resolveAgentTarget(
            {
              agentId: user.id,
              teamId: user.teamId,
              metric: "debtEnrolled",
              periodKey: monthKey,
            },
            targets,
          )
        : null,
    [user, monthKey, targets],
  )
  // Period selector state
  const [periodKey, setPeriodKey] = React.useState<PeriodKey>("mtd")
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>(
    undefined,
  )

  const period: AgentPeriod = React.useMemo(
    () => computePeriodRange(periodKey, customRange),
    [periodKey, customRange],
  )

  const handlePeriodChange = React.useCallback(
    (key: PeriodKey, custom?: DateRange) => {
      if (key === "custom" && custom) {
        setCustomRange(custom)
      }
      setPeriodKey(key)
    },
    [],
  )

  const isLive = periodKey === "today"

  // Live/today data — always needed for hero, pace, achievements
  const liveData = React.useMemo(() => {
    if (!user) return null

    const allCommissions = dataService.getCommissions(user.id)
    const metrics = dataService.getDashboardMetrics(user.id)
    const leaderboard = dataService.getLeaderboard("mtd")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const commissionsToday = allCommissions.filter(
      (c) => new Date(c.fundedDate) >= today,
    )
    const commissionsYesterday = allCommissions.filter((c) => {
      const d = new Date(c.fundedDate)
      return d >= yesterday && d < today
    })

    // Personal best day
    const byDay = new Map<string, number>()
    for (const c of allCommissions) {
      const key = new Date(c.fundedDate).toDateString()
      byDay.set(key, (byDay.get(key) ?? 0) + c.commissionAmount)
    }
    const personalBest = Array.from(byDay.values()).reduce(
      (m, v) => Math.max(m, v),
      0,
    )

    // Leaderboard position
    const myEntry = leaderboard.find((e) => e.agentId === user.id)
    const floorRank = myEntry?.rank ?? leaderboard.length + 1
    const floorSize = leaderboard.length

    const teamMembers = mockUsers.filter(
      (u) => u.role === "agent" && u.teamId && u.teamId === user.teamId,
    )
    const teamEntries = leaderboard
      .filter((e) => teamMembers.some((m) => m.id === e.agentId))
      .map((e) => ({
        id: e.agentId,
        name: e.agentName,
        closes: e.unitsEnrolled,
        isMe: e.agentId === user.id,
      }))
    if (!teamEntries.some((e) => e.isMe)) {
      teamEntries.push({
        id: user.id,
        name: user.name,
        closes: metrics.unitsEnrolled,
        isMe: true,
      })
      teamEntries.sort((a, b) => b.closes - a.closes)
    }
    const myTeamIndex = teamEntries.findIndex((e) => e.isMe)
    const teamRank = myTeamIndex + 1
    const teamSize = teamEntries.length

    const aboveMe = leaderboard.find(
      (e) => e.rank === Math.max(1, floorRank - 1),
    )
    const gapToNextAbove = aboveMe
      ? Math.max(0, aboveMe.unitsEnrolled - metrics.unitsEnrolled)
      : 0
    const rankChange = myEntry?.previousRank
      ? myEntry.previousRank - myEntry.rank
      : 0

    const streakDays = 2 + seeded(user.id, 9)

    const todayCloses = commissionsToday.length
    const yesterdayCloses = commissionsYesterday.length

    // Hourly pace (deterministic, live widget)
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
    const currentHour = new Date().getHours()
    const hourly = hours.map((h) => {
      const baseToday = h <= currentHour ? seeded(user.id + h + "t", 3) : 0
      const baseYesterday = seeded(user.id + h + "y", 3)
      return {
        hour: h,
        today: h === 12 ? 0 : baseToday,
        yesterday: h === 12 ? 0 : baseYesterday,
      }
    })
    const rawTodayTotal = hourly.reduce((s, b) => s + b.today, 0)
    if (rawTodayTotal > 0 && todayCloses > 0) {
      const scale = todayCloses / rawTodayTotal
      hourly.forEach((b) => (b.today = Math.round(b.today * scale)))
    } else if (rawTodayTotal === 0 && todayCloses > 0) {
      const pastHours = hourly.filter(
        (b) => b.hour <= currentHour && b.hour !== 12,
      )
      for (let i = 0; i < todayCloses && pastHours.length > 0; i++) {
        pastHours[i % pastHours.length].today += 1
      }
    }

    const totalClosesLifetime =
      allCommissions.length + 20 + seeded(user.id, 180)
    const levelInfo = computeLevel(totalClosesLifetime)

    // Late Bird
    const closedAfterShiftToday = commissionsToday.some((c) => {
      const d = new Date(c.fundedDate)
      return d.getHours() >= 17
    })
    const isFirstCloseToday = todayCloses === 1

    const biggestDebtThisMonth = (() => {
      const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return allCommissions
        .filter((c) => new Date(c.fundedDate) >= mtdStart)
        .reduce((max, c) => Math.max(max, c.loanAmount), 0)
    })()

    return {
      allCommissions,
      metrics,
      leaderboard,
      todayCloses,
      yesterdayCloses,
      personalBest,
      floorRank,
      floorSize,
      teamRank,
      teamSize,
      rankChange,
      streakDays,
      levelInfo,
      totalClosesLifetime,
      hourly,
      closedAfterShiftToday,
      isFirstCloseToday,
      biggestDebtThisMonth,
      teamEntries,
      gapToNextAbove,
      currentHour,
    }
  }, [user])

  // Period-scoped data — recomputed whenever the period changes
  const periodData = React.useMemo(() => {
    if (!user || !liveData) return null

    const { allCommissions, metrics } = liveData
    const { from, to } = period

    const inRange = (d: Date) => d >= from && d <= to
    const commissionsInPeriod = allCommissions.filter((c) =>
      inRange(new Date(c.fundedDate)),
    )

    const mtdStart = new Date()
    mtdStart.setHours(0, 0, 0, 0)
    mtdStart.setDate(1)
    const mtdCommissions = allCommissions.filter(
      (c) => new Date(c.fundedDate) >= mtdStart,
    )
    const mtdEarned = mtdCommissions.reduce(
      (s, c) => s + c.commissionAmount,
      0,
    )

    const periodEarned = commissionsInPeriod.reduce(
      (s, c) => s + c.commissionAmount,
      0,
    )
    const periodCloses = commissionsInPeriod.length
    const periodDebtEnrolled = commissionsInPeriod.reduce(
      (s, c) => s + c.loanAmount,
      0,
    )
    const periodAvgDeal =
      periodCloses > 0 ? periodDebtEnrolled / periodCloses : 0

    // Days in period for projections & averages
    const dayMs = 24 * 60 * 60 * 1000
    const daysInPeriodRaw = Math.max(
      1,
      Math.round((to.getTime() - from.getTime()) / dayMs),
    )

    // Projected payout: for live MTD use the daily run-rate × days in month
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysElapsedMtd = today.getDate()
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()
    const projectedPayout =
      periodKey === "mtd" && daysElapsedMtd > 0
        ? (mtdEarned / daysElapsedMtd) * daysInMonth
        : periodKey === "today"
          ? periodEarned
          : periodEarned / daysInPeriodRaw // avg per day in historical periods

    // Best single day in the period
    const byDayPeriod = new Map<string, number>()
    for (const c of commissionsInPeriod) {
      const key = new Date(c.fundedDate).toDateString()
      byDayPeriod.set(
        key,
        (byDayPeriod.get(key) ?? 0) + c.commissionAmount,
      )
    }
    const bestDayInPeriod = Array.from(byDayPeriod.values()).reduce(
      (m, v) => Math.max(m, v),
      0,
    )

    // Goal progress — read from admin-set targets (cascade: agent override > team > org > default)
    const monthlyTarget =
      resolvedUnitsTarget?.value || metrics.monthlyTargetUnits || 15
    const weeklyTarget = Math.ceil(monthlyTarget / 4)
    const dailyTarget = Math.max(1, Math.ceil(monthlyTarget / 22))

    const weekStart = new Date(today)
    const day = today.getDay()
    const diff = day === 0 ? 6 : day - 1
    weekStart.setDate(today.getDate() - diff)
    const thisWeekCloses = allCommissions.filter(
      (c) => new Date(c.fundedDate) >= weekStart,
    ).length

    // Activity — live values for Today, scaled for historical ranges
    const baseDials = 45 + seeded(user.id + "dials", 80)
    const baseConnectRate = 0.25 + seeded(user.id + "cr", 20) / 100
    const avgHandleSeconds = 360 + seeded(user.id + "aht", 240)

    const elapsedDayFrac = Math.max(0.3, liveData.currentHour / 9)

    let displayDials: number
    let comparisonDials: number
    if (periodKey === "today") {
      displayDials = Math.round(baseDials * elapsedDayFrac)
      comparisonDials = 40 + seeded(user.id + "ydials", 80)
    } else {
      // Historical: total dials scaled by workdays in range
      const weekdays = countWeekdays(from, to)
      displayDials = Math.round(baseDials * weekdays)
      // Average per day so card can say "Avg X/day"
      comparisonDials = Math.round(displayDials / Math.max(1, weekdays))
    }
    const connectRate = baseConnectRate
    const displayConnects = Math.round(displayDials * connectRate)
    const talkTimeMinutes = Math.round(
      displayConnects * (4 + seeded(user.id + "tt", 5)),
    )

    // Pipeline / callbacks (live only; historical shows current snapshot regardless)
    const pipeline = dataService.getPipeline(user.id)
    const activePipeline = pipeline.filter(
      (p) => p.status === "lead" || p.status === "application" || p.status === "submitted",
    )
    const pipelineValue = activePipeline.reduce((s, p) => s + p.loanAmount, 0)
    const callbacksScheduled = 3 + seeded(user.id + "cb", 8)
    const followUpsDue = 2 + seeded(user.id + "fu", 6)

    // QC
    const qcScore = 80 + seeded(user.id + "qc" + periodKey, 16)
    const qcChange = (seeded(user.id + "qcd" + periodKey, 10) - 5) * 0.5
    const qcEvaluations =
      periodKey === "today"
        ? Math.min(1, 3 + seeded(user.id + "qce", 10))
        : 3 + seeded(user.id + "qce" + periodKey, 10)

    // KPI change rates (synthesized per period so they feel alive)
    const unitsEnrolledChange =
      periodKey === "today"
        ? seeded(user.id + "uec-t", 20) - 10
        : metrics.unitsEnrolledChange
    const debtChange =
      periodKey === "today"
        ? seeded(user.id + "dec-t", 20) - 10
        : metrics.debtLoadEnrolledChange
    const qConvChange =
      periodKey === "today"
        ? (seeded(user.id + "qcc-t", 30) - 15) / 3
        : metrics.qualifiedConversionRateChange

    // Qualified conversion ratio — scale the MTD ratio to the period
    const qualifiedRatio =
      periodKey === "today"
        ? metrics.qualifiedConversionRate
        : metrics.qualifiedConversionRate
    const assignedScale = clamp(
      daysInPeriodRaw /
        Math.max(
          1,
          daysElapsedMtd,
        ),
      0.2,
      3,
    )
    const qualifiedAssigned = Math.max(
      periodCloses,
      Math.round(metrics.qualifiedAssigned * assignedScale),
    )
    const qualifiedClosed = Math.min(
      qualifiedAssigned,
      Math.round((qualifiedRatio / 100) * qualifiedAssigned),
    )

    // Target for the period (prorated)
    const daysInMonthTarget = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()
    const weekdaysInPeriod = countWeekdays(from, to)
    const avgWeekdaysMonth = Math.round(daysInMonthTarget * (5 / 7))
    const periodUnitsTarget =
      periodKey === "mtd"
        ? monthlyTarget
        : periodKey === "today"
          ? dailyTarget
          : periodKey === "wtd"
            ? weeklyTarget
            : Math.max(
                1,
                Math.round(
                  (monthlyTarget / Math.max(1, avgWeekdaysMonth)) *
                    weekdaysInPeriod,
                ),
              )

    // Debt target — from admin targets when available; otherwise derive from avg deal size
    const avgDealSize = metrics.avgLoanSize || 45_000
    const monthlyDebtTarget = resolvedDebtTarget?.value || monthlyTarget * avgDealSize
    const periodDebtTarget =
      periodKey === "mtd"
        ? monthlyDebtTarget
        : (monthlyDebtTarget / Math.max(1, monthlyTarget)) * periodUnitsTarget

    return {
      periodCloses,
      periodEarned,
      periodDebtEnrolled,
      periodAvgDeal,
      mtdEarned,
      projectedPayout,
      bestDayInPeriod,
      displayDials,
      comparisonDials,
      displayConnects,
      talkTimeMinutes,
      avgHandleSeconds,
      activePipelineCount: activePipeline.length,
      pipelineValue,
      callbacksScheduled,
      followUpsDue,
      qcScore,
      qcChange,
      qcEvaluations,
      dailyTarget,
      weeklyTarget,
      monthlyTarget,
      thisWeekCloses,
      mtdCloses: mtdCommissions.length,
      unitsEnrolledChange,
      debtChange,
      qConvChange,
      qualifiedConversionRate: qualifiedRatio,
      qualifiedClosed,
      qualifiedAssigned,
      periodUnitsTarget,
      periodDebtTarget,
    }
  }, [user, liveData, period, periodKey, resolvedUnitsTarget, resolvedDebtTarget])

  if (!user || !liveData || !periodData) return null

  const firstName = user.name.split(" ")[0]
  const teamName = user.teamName || "Your Team"
  const announcements = dataService.getAnnouncements()

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 lg:p-5">
      {/* Hero — always live */}
      <AgentHero
        firstName={firstName}
        teamName={teamName}
        floorRank={liveData.floorRank}
        teamRank={liveData.teamRank}
        teamSize={liveData.teamSize}
        rankChange={liveData.rankChange}
        streakDays={liveData.streakDays}
        levelName={liveData.levelInfo.levelName}
        levelNumber={liveData.levelInfo.levelNumber}
        levelProgress={liveData.levelInfo.levelProgress}
        nextLevelName={liveData.levelInfo.nextLevelName}
        totalClosesLifetime={liveData.totalClosesLifetime}
        todayCloses={liveData.todayCloses}
        yesterdayCloses={liveData.yesterdayCloses}
      />

      {/* Period selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Performance view
          </div>
          <div className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums">
            {period.label}
          </div>
          {!isLive && (
            <div className="hidden items-center rounded-full border border-chart-4/40 bg-chart-4/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-chart-4 sm:flex">
              Historical
            </div>
          )}
        </div>
        <PeriodSelector
          period={period}
          customRange={customRange}
          onChange={handlePeriodChange}
        />
      </div>

      {/* Primary KPIs — respect period */}
      <KpiTiles
        unitsClosed={{
          mtd: periodData.periodCloses,
          change: periodData.unitsEnrolledChange,
          target: periodData.periodUnitsTarget,
          today: liveData.todayCloses,
        }}
        debtEnrolled={{
          mtd: periodData.periodDebtEnrolled,
          change: periodData.debtChange,
          target: periodData.periodDebtTarget,
          avgPerDeal: periodData.periodAvgDeal,
        }}
        qualifiedConversion={{
          rate: periodData.qualifiedConversionRate,
          change: periodData.qConvChange,
          closed: periodData.qualifiedClosed,
          assigned: periodData.qualifiedAssigned,
        }}
        qcScore={{
          score: periodData.qcScore,
          change: periodData.qcChange,
          evaluations: periodData.qcEvaluations,
          grade: scoreToGrade(periodData.qcScore),
        }}
        periodLabel={period.label}
        periodShortLabel={period.shortLabel}
        isLive={isLive}
      />

      {/* Top row: Money + Goal + Rank */}
      <div className="grid gap-4 lg:grid-cols-3">
        <MoneyTicker
          todayEarned={periodData.periodEarned}
          mtdEarned={periodData.mtdEarned}
          projectedPayout={periodData.projectedPayout}
          personalBest={periodData.bestDayInPeriod || liveData.personalBest}
          periodLabel={period.shortLabel}
          isLive={isLive}
        />
        <GoalRing
          daily={{
            current: liveData.todayCloses,
            target: periodData.dailyTarget,
          }}
          weekly={{
            current: periodData.thisWeekCloses,
            target: periodData.weeklyTarget,
          }}
          monthly={{
            current: periodData.mtdCloses,
            target: periodData.monthlyTarget,
          }}
        />
        <RankCard
          teamLeaderboard={liveData.teamEntries}
          myFloorRank={liveData.floorRank}
          floorSize={liveData.floorSize}
          gapToNextAbove={liveData.gapToNextAbove}
        />
      </div>

      {/* Middle row: Pace + Activity snapshot */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaceTracker
            hourly={liveData.hourly}
            dailyTarget={periodData.dailyTarget}
          />
        </div>
        <ActivitySnapshot
          todayDials={periodData.displayDials}
          yesterdayDials={periodData.comparisonDials}
          todayConnects={periodData.displayConnects}
          talkTimeMinutes={periodData.talkTimeMinutes}
          avgHandleSeconds={periodData.avgHandleSeconds}
          pipelineCount={periodData.activePipelineCount}
          pipelineValue={periodData.pipelineValue}
          callbacksScheduled={periodData.callbacksScheduled}
          followUpsDue={periodData.followUpsDue}
          periodLabel={period.shortLabel}
          isLive={isLive}
        />
      </div>

      {/* Bottom row: Achievements + Tip */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AchievementsRow
            todayCloses={liveData.todayCloses}
            todayCalls={periodData.displayDials}
            streakDays={liveData.streakDays}
            qcScore={periodData.qcScore}
            isFirstCloseToday={liveData.isFirstCloseToday}
            closedAfterShiftToday={liveData.closedAfterShiftToday}
            biggestDebtClosedThisMonth={liveData.biggestDebtThisMonth}
          />
        </div>
        <MotivationCard />
      </div>

      {/* Announcements */}
      <AnnouncementsList
        announcements={announcements}
        userId={user.id}
        limit={3}
      />
    </div>
  )
}

// Helpers
function countWeekdays(from: Date, to: Date) {
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  let count = 0
  while (cursor <= end) {
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return Math.max(1, count)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
