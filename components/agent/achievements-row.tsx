"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Award,
  Zap,
  Flame,
  Star,
  Target,
  TrendingUp,
  Phone,
  DollarSign,
  Clock,
  Moon,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Achievement = {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  earnedToday?: boolean
  earned: boolean
  progress?: { current: number; target: number }
}

type Props = {
  todayCloses: number
  todayCalls: number
  streakDays: number
  qcScore: number
  isFirstCloseToday: boolean
  closedAfterShiftToday: boolean // at least one close after assigned shift hours
  biggestDebtClosedThisMonth: number
}

export function AchievementsRow({
  todayCloses,
  todayCalls,
  streakDays,
  qcScore,
  isFirstCloseToday,
  closedAfterShiftToday,
  biggestDebtClosedThisMonth,
}: Props) {
  const achievements: Achievement[] = [
    {
      id: "first-close",
      name: "First Blood",
      description: "First close of the day",
      icon: Zap,
      color: "chart-3",
      earnedToday: isFirstCloseToday,
      earned: todayCloses >= 1,
    },
    {
      id: "hat-trick",
      name: "Hat Trick",
      description: "3 closes in a single day",
      icon: Target,
      color: "chart-4",
      earnedToday: todayCloses >= 3,
      earned: todayCloses >= 3,
      progress: todayCloses < 3 ? { current: todayCloses, target: 3 } : undefined,
    },
    {
      id: "five-alarm",
      name: "Five Alarm",
      description: "5 closes in a single day",
      icon: Flame,
      color: "chart-5",
      earnedToday: todayCloses >= 5,
      earned: todayCloses >= 5,
      progress: todayCloses < 5 ? { current: todayCloses, target: 5 } : undefined,
    },
    {
      id: "streak-5",
      name: "On Fire",
      description: "5-day closing streak",
      icon: Flame,
      color: "chart-5",
      earned: streakDays >= 5,
      progress: streakDays < 5 ? { current: streakDays, target: 5 } : undefined,
    },
    {
      id: "dialer",
      name: "Dialer",
      description: "100+ calls in a day",
      icon: Phone,
      color: "chart-2",
      earnedToday: todayCalls >= 100,
      earned: todayCalls >= 100,
      progress: todayCalls < 100 ? { current: todayCalls, target: 100 } : undefined,
    },
    {
      id: "quality",
      name: "Gold Standard",
      description: "QC score 95+",
      icon: Star,
      color: "chart-4",
      earned: qcScore >= 95,
      progress: qcScore < 95 ? { current: qcScore, target: 95 } : undefined,
    },
    {
      id: "late-bird",
      name: "Late Bird",
      description: "Closed a deal after shift hours",
      icon: Moon,
      color: "chart-2",
      earnedToday: closedAfterShiftToday,
      earned: closedAfterShiftToday,
    },
    {
      id: "big-ticket",
      name: "Whale Hunter",
      description: "Closed a $50K+ debt load",
      icon: DollarSign,
      color: "primary",
      earned: biggestDebtClosedThisMonth >= 50000,
      progress:
        biggestDebtClosedThisMonth < 50000
          ? {
              current: Math.round(biggestDebtClosedThisMonth / 1000),
              target: 50,
            }
          : undefined,
    },
    {
      id: "grind",
      name: "Grinder",
      description: "30-day closing streak",
      icon: TrendingUp,
      color: "primary",
      earned: streakDays >= 30,
      progress: streakDays < 30 ? { current: streakDays, target: 30 } : undefined,
    },
    {
      id: "clockwork",
      name: "Clockwork",
      description: "Avg handle time under 8 min",
      icon: Clock,
      color: "chart-2",
      earned: false,
    },
  ]

  const earnedToday = achievements.filter((a) => a.earnedToday).length
  const totalEarned = achievements.filter((a) => a.earned).length

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-4/20">
            <Award className="size-4 text-chart-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Achievements</h3>
            <p className="text-[11px] text-muted-foreground">
              {totalEarned} earned · {earnedToday} today
            </p>
          </div>
        </div>
      </div>

      <TooltipProvider>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {achievements.map((a) => {
            const Icon = a.earned ? a.icon : Lock
            return (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all",
                      a.earned
                        ? "border-border bg-muted/30 hover:scale-105"
                        : "border-dashed border-border/40 opacity-50 hover:opacity-80",
                      a.earnedToday &&
                        "border-chart-3/60 bg-chart-3/10 shadow-[0_0_0_3px_var(--color-chart-3)/20]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        !a.earned && "text-muted-foreground",
                        a.earned && a.color === "chart-3" && "text-chart-3",
                        a.earned && a.color === "chart-2" && "text-chart-2",
                        a.earned && a.color === "chart-4" && "text-chart-4",
                        a.earned && a.color === "chart-5" && "text-chart-5",
                        a.earned && a.color === "primary" && "text-primary",
                      )}
                    />
                    <div className="line-clamp-1 text-center text-[10px] font-semibold">
                      {a.name}
                    </div>
                    {a.earnedToday && (
                      <span className="absolute -right-1 -top-1 flex size-3">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-chart-3 opacity-75" />
                        <span className="relative inline-flex size-3 rounded-full bg-chart-3" />
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-center">
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.description}
                    </div>
                    {a.progress && (
                      <div className="mt-1 font-mono text-xs tabular-nums">
                        {a.progress.current} / {a.progress.target}
                      </div>
                    )}
                    {a.earnedToday && (
                      <div className="mt-1 text-xs font-semibold text-chart-3">
                        Earned today
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
    </Card>
  )
}
