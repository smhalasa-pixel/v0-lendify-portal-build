"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Trophy, ArrowUp, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

type RankEntry = {
  id: string
  name: string
  closes: number
  isMe: boolean
}

type Props = {
  teamLeaderboard: RankEntry[]
  myFloorRank: number
  floorSize: number
  gapToNextAbove: number // closes
}

export function RankCard({
  teamLeaderboard,
  myFloorRank,
  floorSize,
  gapToNextAbove,
}: Props) {
  // Show me + 2 above + 2 below
  const myIndex = teamLeaderboard.findIndex((e) => e.isMe)
  const windowStart = Math.max(0, Math.min(teamLeaderboard.length - 5, myIndex - 2))
  const visible = teamLeaderboard.slice(windowStart, windowStart + 5)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-4/20">
            <Trophy className="size-4 text-chart-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Team Ranking</h3>
            <p className="text-[11px] text-muted-foreground">
              Floor rank: #{myFloorRank} of {floorSize}
            </p>
          </div>
        </div>
        {gapToNextAbove > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-chart-3/40 bg-chart-3/10 px-2 py-1 text-[11px] font-semibold text-chart-3">
            <ArrowUp className="size-3" />
            {gapToNextAbove} to climb
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {visible.map((entry, idx) => {
          const rank = windowStart + idx + 1
          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
                entry.isMe
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-border/60 bg-muted/20",
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums",
                  rank === 1 && "bg-chart-4 text-background",
                  rank === 2 && "bg-chart-2 text-background",
                  rank === 3 && "bg-chart-5 text-background",
                  rank > 3 && "bg-muted text-muted-foreground",
                )}
              >
                {rank <= 3 ? <Medal className="size-3.5" /> : rank}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div
                  className={cn(
                    "truncate text-sm",
                    entry.isMe ? "font-bold" : "font-medium",
                  )}
                >
                  {entry.isMe ? "You" : entry.name}
                </div>
                <div className="font-mono text-sm font-bold tabular-nums">
                  {entry.closes}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
