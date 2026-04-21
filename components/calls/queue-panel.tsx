"use client"

import * as React from "react"
import { PhoneCall, Users, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/ringcentral"
import type { QueueSnapshot } from "@/lib/ringcentral"

interface QueuePanelProps {
  queues: QueueSnapshot[]
}

export function QueuePanel({ queues }: QueuePanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
            <PhoneCall className="size-4 text-primary" />
            Queue Health
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {queues.length} queues
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {queues.map((q) => {
          const slTone =
            q.serviceLevelPct >= 85
              ? "text-emerald-400"
              : q.serviceLevelPct >= 75
              ? "text-amber-400"
              : "text-rose-400"
          return (
            <div
              key={q.queueId}
              className="rounded-lg border border-border/50 bg-card/40 p-3 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{q.queueName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                    {q.callsHandledToday} handled · {q.callsAbandonedToday} abandoned
                  </p>
                </div>
                {q.callsWaiting > 0 ? (
                  <Badge
                    className={cn(
                      "shrink-0 tabular-nums",
                      q.callsWaiting > 3
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30",
                    )}
                  >
                    {q.callsWaiting} waiting
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="shrink-0 text-emerald-400 border-emerald-500/30"
                  >
                    Clear
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-muted/30 p-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    SL
                  </p>
                  <p className={cn("text-sm font-semibold tabular-nums", slTone)}>
                    {q.serviceLevelPct}%
                  </p>
                </div>
                <div className="rounded bg-muted/30 p-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    ASA
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {q.averageSpeedOfAnswerSec}s
                  </p>
                </div>
                <div className="rounded bg-muted/30 p-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Longest
                  </p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatDuration(q.longestWaitSec)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {q.agentsAvailable} avail
                </span>
                <span className="flex items-center gap-1">
                  <PhoneCall className="size-3" />
                  {q.agentsOnCall} on call
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {q.agentsOnBreak} away
                </span>
              </div>

              <Progress
                value={q.serviceLevelPct}
                className={cn(
                  "h-1 mt-2",
                  q.serviceLevelPct >= 85 && "[&>div]:bg-emerald-500",
                  q.serviceLevelPct >= 75 &&
                    q.serviceLevelPct < 85 &&
                    "[&>div]:bg-amber-500",
                  q.serviceLevelPct < 75 && "[&>div]:bg-rose-500",
                )}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
