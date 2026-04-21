"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { dataService, mockUsers } from "@/lib/mock-data"
import { AgentHero } from "./agent-hero"
import { MoneyTicker } from "./money-ticker"
import { GoalRing } from "./goal-ring"
import { RankCard } from "./rank-card"
import { AchievementsRow } from "./achievements-row"
import { PaceTracker } from "./pace-tracker"
import { MyQueue } from "./my-queue"
import { MotivationCard } from "./motivation-card"
import { AnnouncementsList } from "@/components/dashboard/announcements-list"

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

export function AgentDashboard() {
  const { user } = useAuth()

  const data = React.useMemo(() => {
    if (!user) return null

    const allCommissions = dataService.getCommissions(user.id)
    const metrics = dataService.getDashboardMetrics(user.id)
    const leaderboard = dataService.getLeaderboard("mtd")
    const announcements = dataService.getAnnouncements()
    const pipeline = dataService.getPipeline(user.id)

    // Today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const mtdStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const commissionsToday = allCommissions.filter((c) => {
      const d = new Date(c.fundedDate)
      return d >= today
    })
    const commissionsYesterday = allCommissions.filter((c) => {
      const d = new Date(c.fundedDate)
      return d >= yesterday && d < today
    })
    const commissionsMtd = allCommissions.filter((c) => {
      const d = new Date(c.fundedDate)
      return d >= mtdStart
    })

    const todayEarned = commissionsToday.reduce(
      (s, c) => s + c.commissionAmount,
      0,
    )
    const mtdEarned = commissionsMtd.reduce(
      (s, c) => s + c.commissionAmount,
      0,
    )
    // Project: days elapsed → days in month
    const daysElapsed = today.getDate()
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate()
    const projectedPayout =
      daysElapsed > 0 ? (mtdEarned / daysElapsed) * daysInMonth : 0

    const biggestDebtThisMonth = commissionsMtd.reduce(
      (max, c) => Math.max(max, c.loanAmount),
      0,
    )

    // Personal best day (rough: max by date)
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

    // Team scope for ranking
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
    // Ensure I'm in there
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

    // Gap to next person above on floor
    const aboveMe = leaderboard.find(
      (e) => e.rank === Math.max(1, floorRank - 1),
    )
    const gapToNextAbove = aboveMe
      ? Math.max(0, aboveMe.unitsEnrolled - metrics.unitsEnrolled)
      : 0

    // Rank change: from previousRank
    const rankChange = myEntry?.previousRank
      ? myEntry.previousRank - myEntry.rank
      : 0

    // Streak: derive from consecutive days with closes (deterministic fallback)
    const streakDays = 2 + seeded(user.id, 9) // 2-10 days

    // Today/Yesterday closes
    const todayCloses = commissionsToday.length
    const yesterdayCloses = commissionsYesterday.length

    // Today calls (approximated from pipeline activity; in production comes from RingCentral)
    const todayCalls = 45 + seeded(user.id + "calls", 80) // 45-125

    // Hourly pace (synthetic but deterministic per-user)
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]
    const currentHour = new Date().getHours()
    const hourly = hours.map((h, i) => {
      const baseToday =
        h <= currentHour ? seeded(user.id + h + "t", 3) : 0
      const baseYesterday = seeded(user.id + h + "y", 3)
      // nudge so totals match
      return {
        hour: h,
        today: h === 12 ? 0 : baseToday, // lunch lull
        yesterday: h === 12 ? 0 : baseYesterday,
      }
    })
    // Normalize today total to match actual todayCloses
    const rawTodayTotal = hourly.reduce((s, b) => s + b.today, 0)
    if (rawTodayTotal > 0 && todayCloses > 0) {
      const scale = todayCloses / rawTodayTotal
      hourly.forEach((b) => (b.today = Math.round(b.today * scale)))
    } else if (rawTodayTotal === 0 && todayCloses > 0) {
      // distribute across past hours
      const pastHours = hourly.filter((b) => b.hour <= currentHour && b.hour !== 12)
      for (let i = 0; i < todayCloses && pastHours.length > 0; i++) {
        pastHours[i % pastHours.length].today += 1
      }
    }

    // Goal targets
    const monthlyTarget = metrics.monthlyTargetUnits || 20
    const weeklyTarget = Math.ceil(monthlyTarget / 4)
    const dailyTarget = Math.ceil(monthlyTarget / 22)

    // Weekly current: commissions this week
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
    const thisWeekCloses = allCommissions.filter((c) => {
      const d = new Date(c.fundedDate)
      return d >= weekStart
    }).length

    // Hot leads / call queue from pipeline (lead + application stages are highest intent)
    const hotPipeline = pipeline
      .filter((p) => p.status === "lead" || p.status === "application")
      .slice(0, 6)
    const queueItems = hotPipeline.map((p, i) => {
      const type: "hot-lead" | "callback" | "voicemail" | "follow-up" =
        i === 0
          ? "hot-lead"
          : i === 1
            ? "callback"
            : i === 2
              ? "voicemail"
              : "follow-up"
      const priority: "hot" | "warm" | "normal" =
        i < 2 ? "hot" : i < 4 ? "warm" : "normal"
      return {
        id: p.id,
        type,
        name: p.borrowerName,
        phone: "555-" + String(1000 + seeded(p.id, 8999)),
        subtitle: p.loanType,
        priority,
        minutesWaiting: seeded(p.id, 45) + 2,
        debtLoad: p.loanAmount,
      }
    })

    // Level from lifetime closes (approximated as commissions count)
    const totalClosesLifetime = allCommissions.length + 20 + seeded(user.id, 180)
    const levelInfo = computeLevel(totalClosesLifetime)

    // QC score
    const qcScore =
      typeof metrics.closingRate === "number" ? 82 + seeded(user.id + "qc", 16) : 85

    // First close today?
    const isFirstCloseToday = todayCloses === 1
    // Shift start (deterministic per day)
    const isShiftStart =
      new Date().getHours() < 9 || seeded(user.id + today.toDateString(), 10) > 4

    const firstName = user.name.split(" ")[0]
    const teamName = user.teamName || "Your Team"

    return {
      firstName,
      teamName,
      floorRank,
      floorSize,
      teamRank,
      teamSize,
      rankChange,
      streakDays,
      levelInfo,
      totalClosesLifetime,
      todayCloses,
      yesterdayCloses,
      todayEarned,
      mtdEarned,
      projectedPayout,
      personalBest,
      todayCalls,
      qcScore,
      isFirstCloseToday,
      isShiftStart,
      biggestDebtClosedThisMonth: biggestDebtThisMonth,
      teamEntries,
      gapToNextAbove,
      hourly,
      dailyTarget,
      weeklyTarget,
      monthlyTarget,
      thisWeekCloses,
      mtdCloses: metrics.unitsEnrolled,
      queueItems,
      announcements,
    }
  }, [user])

  if (!user || !data) return null

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-4 lg:p-5">
      {/* Hero */}
      <AgentHero
        firstName={data.firstName}
        teamName={data.teamName}
        floorRank={data.floorRank}
        teamRank={data.teamRank}
        teamSize={data.teamSize}
        rankChange={data.rankChange}
        streakDays={data.streakDays}
        levelName={data.levelInfo.levelName}
        levelNumber={data.levelInfo.levelNumber}
        levelProgress={data.levelInfo.levelProgress}
        nextLevelName={data.levelInfo.nextLevelName}
        totalClosesLifetime={data.totalClosesLifetime}
        todayCloses={data.todayCloses}
        yesterdayCloses={data.yesterdayCloses}
      />

      {/* Top row: Money + Goal + Rank */}
      <div className="grid gap-4 lg:grid-cols-3">
        <MoneyTicker
          todayEarned={data.todayEarned}
          mtdEarned={data.mtdEarned}
          projectedPayout={data.projectedPayout}
          personalBest={data.personalBest}
        />
        <GoalRing
          daily={{ current: data.todayCloses, target: data.dailyTarget }}
          weekly={{ current: data.thisWeekCloses, target: data.weeklyTarget }}
          monthly={{ current: data.mtdCloses, target: data.monthlyTarget }}
        />
        <RankCard
          teamLeaderboard={data.teamEntries}
          myFloorRank={data.floorRank}
          floorSize={data.floorSize}
          gapToNextAbove={data.gapToNextAbove}
        />
      </div>

      {/* Middle row: Pace + Queue */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaceTracker hourly={data.hourly} dailyTarget={data.dailyTarget} />
        </div>
        <MyQueue items={data.queueItems} />
      </div>

      {/* Bottom row: Achievements + Tip + Announcements */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AchievementsRow
            todayCloses={data.todayCloses}
            todayCalls={data.todayCalls}
            streakDays={data.streakDays}
            qcScore={data.qcScore}
            isFirstCloseToday={data.isFirstCloseToday}
            isShiftStart={data.isShiftStart}
            biggestDebtClosedThisMonth={data.biggestDebtClosedThisMonth}
          />
        </div>
        <MotivationCard />
      </div>

      {/* Announcements at the bottom (always useful) */}
      <AnnouncementsList
        announcements={data.announcements}
        userId={user.id}
        limit={3}
      />
    </div>
  )
}
