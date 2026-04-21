"use client"

import * as React from "react"
import {
  Ear,
  Headphones,
  MessageSquare,
  Pause,
  Phone,
  PhoneForwarded,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/ringcentral"
import type { ActiveCall } from "@/lib/ringcentral"

interface ActiveCallsTableProps {
  calls: ActiveCall[]
  canSupervise: boolean
  onSupervise?: (call: ActiveCall, action: "listen" | "whisper" | "barge") => void
}

export function ActiveCallsTable({
  calls,
  canSupervise,
  onSupervise,
}: ActiveCallsTableProps) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        No active calls right now.
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="text-[10px] uppercase tracking-wider">Agent</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Customer</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Phone</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Dir.</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Queue</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-right">Debt Est.</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-right">Duration</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider">Sent.</TableHead>
            {canSupervise && (
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Supervisor
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((c) => {
            const dur = Math.floor((Date.now() - c.startedAt) / 1000)
            const sentimentTone =
              c.sentiment === "positive"
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : c.sentiment === "negative"
                ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                : "text-muted-foreground border-border/50"
            return (
              <TableRow key={c.callId} className="hover:bg-muted/20">
                <TableCell className="font-medium text-sm py-2">
                  <div className="flex flex-col">
                    <span className="truncate">{c.agentName}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {c.teamName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm py-2 truncate max-w-[180px]">
                  <div className="flex flex-col">
                    <span className="truncate">{c.customerName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {c.customerState}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground py-2">
                  {c.customerPhone}
                </TableCell>
                <TableCell className="py-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] gap-1 px-1.5 py-0",
                      c.direction === "inbound"
                        ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                        : "text-violet-400 border-violet-500/30 bg-violet-500/10",
                    )}
                  >
                    {c.direction === "inbound" ? (
                      <Phone className="size-2.5" />
                    ) : (
                      <PhoneForwarded className="size-2.5" />
                    )}
                    {c.direction === "inbound" ? "In" : "Out"}
                  </Badge>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground py-2 truncate max-w-[140px]">
                  {c.queue}
                </TableCell>
                <TableCell className="text-right text-xs font-mono tabular-nums py-2">
                  {c.debtEstimate
                    ? `$${c.debtEstimate.toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell className="text-right py-2">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      c.onHold ? "text-orange-400" : "text-foreground",
                    )}
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {formatDuration(dur)}
                  </span>
                  {c.onHold && (
                    <div className="flex items-center justify-end gap-1 text-[10px] text-orange-400 mt-0.5">
                      <Pause className="size-2.5" />
                      on hold
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", sentimentTone)}
                  >
                    {c.sentiment ?? "neutral"}
                  </Badge>
                </TableCell>
                {canSupervise && (
                  <TableCell className="py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onSupervise?.(c, "listen")}
                        title="Listen"
                      >
                        <Headphones className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onSupervise?.(c, "whisper")}
                        title="Whisper to agent"
                      >
                        <Ear className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300"
                        onClick={() => onSupervise?.(c, "barge")}
                        title="Barge into call"
                      >
                        <MessageSquare className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
