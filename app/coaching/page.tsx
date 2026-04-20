"use client"

import * as React from "react"
import { Clock, Target, TrendingUp, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CoachingSession {
  id: string
  agent: string
  coach: string
  scheduledFor: string
  status: "upcoming" | "completed" | "overdue"
  focus: string
  lastScore?: number
  actionItems: number
  actionItemsDone: number
}

const sessions: CoachingSession[] = [
  { id: "C-2041", agent: "Sarah Johnson", coach: "Michael Chen", scheduledFor: "Today 3:00 PM", status: "upcoming", focus: "Objection handling", lastScore: 87, actionItems: 3, actionItemsDone: 2 },
  { id: "C-2040", agent: "David Williams", coach: "Alex Thompson", scheduledFor: "Tomorrow 10:00 AM", status: "upcoming", focus: "Discovery questions", lastScore: 72, actionItems: 4, actionItemsDone: 1 },
  { id: "C-2039", agent: "Emily Brown", coach: "Michael Chen", scheduledFor: "Yesterday", status: "completed", focus: "Closing technique", lastScore: 91, actionItems: 2, actionItemsDone: 2 },
  { id: "C-2038", agent: "David Williams", coach: "Alex Thompson", scheduledFor: "3 days ago", status: "overdue", focus: "Call control", lastScore: 68, actionItems: 5, actionItemsDone: 0 },
]

const statusConfig: Record<CoachingSession["status"], { color: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  upcoming: { color: "text-sky-500 border-sky-500/40", label: "Upcoming", icon: Clock },
  completed: { color: "text-emerald-500 border-emerald-500/40", label: "Completed", icon: CheckCircle2 },
  overdue: { color: "text-rose-500 border-rose-500/40", label: "Overdue", icon: AlertCircle },
}

export default function CoachingPage() {
  const upcoming = sessions.filter((s) => s.status === "upcoming").length
  const overdue = sessions.filter((s) => s.status === "overdue").length
  const avgScore = Math.round(sessions.reduce((s, x) => s + (x.lastScore || 0), 0) / sessions.length)
  const completionRate = Math.round(
    (sessions.reduce((s, x) => s + x.actionItemsDone, 0) /
      Math.max(sessions.reduce((s, x) => s + x.actionItems, 0), 1)) *
      100
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Coaching
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            1:1 sessions, skill development, and action-item tracking.
          </p>
        </div>
        <Button style={{ backgroundColor: "#E8B746", color: "#0a0a0a" }}>
          + Schedule Session
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="size-3.5" /> Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: "Georgia, serif" }}>{upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="size-3.5" /> Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-rose-500" style={{ fontFamily: "Georgia, serif" }}>{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="size-3.5" /> Avg QA Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: "Georgia, serif", color: "#E8B746" }}>
              {avgScore}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-3.5" /> Action-Item Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: "Georgia, serif" }}>
              {completionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Session</th>
                  <th className="text-left px-4 py-3 font-semibold">Agent</th>
                  <th className="text-left px-4 py-3 font-semibold">Coach</th>
                  <th className="text-left px-4 py-3 font-semibold">Focus</th>
                  <th className="text-left px-4 py-3 font-semibold">When</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {sessions.map((s) => {
                  const cfg = statusConfig[s.status]
                  const Icon = cfg.icon
                  return (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                      <td className="px-4 py-3 font-medium">{s.agent}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.coach}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare className="size-3 text-muted-foreground" />
                          {s.focus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.scheduledFor}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cfg.color}>
                          <Icon className="size-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className={s.actionItemsDone === s.actionItems ? "text-emerald-500" : "text-muted-foreground"}>
                          {s.actionItemsDone}/{s.actionItems}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
