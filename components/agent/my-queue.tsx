"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PhoneCall,
  Clock,
  Flame,
  Voicemail,
  RotateCw,
  ArrowRight,
  Thermometer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type QueueItem = {
  id: string
  type: "hot-lead" | "callback" | "voicemail" | "follow-up"
  name: string
  phone: string
  subtitle: string
  priority: "hot" | "warm" | "normal"
  minutesWaiting?: number
  debtLoad?: number
}

type Props = {
  items: QueueItem[]
}

const typeMeta = {
  "hot-lead": { label: "Hot Lead", icon: Flame, color: "chart-5" },
  callback: { label: "Callback", icon: PhoneCall, color: "chart-3" },
  voicemail: { label: "Voicemail", icon: Voicemail, color: "chart-2" },
  "follow-up": { label: "Follow-up", icon: RotateCw, color: "chart-4" },
} as const

export function MyQueue({ items }: Props) {
  // sort by priority then waiting time
  const sorted = React.useMemo(() => {
    const order = { hot: 0, warm: 1, normal: 2 }
    return [...items].sort((a, b) => {
      if (order[a.priority] !== order[b.priority])
        return order[a.priority] - order[b.priority]
      return (b.minutesWaiting ?? 0) - (a.minutesWaiting ?? 0)
    })
  }, [items])

  const hotCount = items.filter((i) => i.priority === "hot").length

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-5/20">
            <Flame className="size-4 text-chart-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">My Call Queue</h3>
            <p className="text-[11px] text-muted-foreground">
              {items.length} waiting
              {hotCount > 0 && (
                <span className="ml-1 font-semibold text-chart-5">
                  · {hotCount} hot
                </span>
              )}
            </p>
          </div>
        </div>
        <Link href="/calls/hot-leads">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            All
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>

      <div className="mt-3 space-y-1.5">
        {sorted.slice(0, 6).map((item) => {
          const meta = typeMeta[item.type]
          const Icon = meta.icon
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
                item.priority === "hot"
                  ? "border-chart-5/40 bg-chart-5/5"
                  : "border-border/60 bg-muted/20",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  meta.color === "chart-5" && "bg-chart-5/20 text-chart-5",
                  meta.color === "chart-3" && "bg-chart-3/20 text-chart-3",
                  meta.color === "chart-2" && "bg-chart-2/20 text-chart-2",
                  meta.color === "chart-4" && "bg-chart-4/20 text-chart-4",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold">
                    {item.name}
                  </div>
                  {item.priority === "hot" && (
                    <Thermometer className="size-3 shrink-0 text-chart-5" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{meta.label}</span>
                  {item.minutesWaiting !== undefined && item.minutesWaiting > 0 && (
                    <>
                      <span>·</span>
                      <Clock className="size-3" />
                      <span className="tabular-nums">{item.minutesWaiting}m</span>
                    </>
                  )}
                  {item.debtLoad && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-foreground">
                        ${(item.debtLoad / 1000).toFixed(0)}K
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <PhoneCall className="size-3" />
                Call
              </Button>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Your queue is clear. Great work.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
