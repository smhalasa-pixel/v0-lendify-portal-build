"use client"

import * as React from "react"
import {
  Ear,
  Headphones,
  MessageSquare,
  MicOff,
  Pause,
  Phone,
  PhoneForwarded,
  ShieldAlert,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DISPOSITION_LABEL,
  PRESENCE_COLOR,
  PRESENCE_LABEL,
  formatDuration,
} from "@/lib/ringcentral"
import type { AgentTelephonyState } from "@/lib/ringcentral"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AgentCallCardProps {
  state: AgentTelephonyState
  canSupervise: boolean
  onListen?: () => void
  onWhisper?: () => void
  onBarge?: () => void
  dense?: boolean
}

export function AgentCallCard({
  state,
  canSupervise,
  onListen,
  onWhisper,
  onBarge,
  dense = false,
}: AgentCallCardProps) {
  const p = PRESENCE_COLOR[state.presence]
  const onCall = !!state.activeCall
  const timeOnCall = state.activeCall
    ? Math.floor((Date.now() - state.activeCall.startedAt) / 1000)
    : 0
  const initials = state.agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <div
      className={cn(
        "rounded-lg border bg-card/40 transition-all",
        p.border,
        onCall && "bg-card/70",
        dense ? "p-2" : "p-3",
      )}
    >
      {/* Header row: avatar + name + presence pill */}
      <div className="flex items-start gap-2">
        <div className="relative shrink-0">
          <Avatar className={cn(dense ? "size-8" : "size-9")}>
            <AvatarImage src={state.avatar} alt={state.agentName} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-background",
              p.dot,
              (onCall || state.presence === "available") && "animate-pulse",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold truncate", dense ? "text-xs" : "text-sm")}>
            {state.agentName}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            <span className="font-mono">{state.extension}</span>
            <span className="mx-1">·</span>
            {state.teamName}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider",
            p.bg,
            p.text,
            p.border,
          )}
        >
          {PRESENCE_LABEL[state.presence]}
        </Badge>
      </div>

      {/* Active call body */}
      {onCall && state.activeCall && (
        <div
          className={cn(
            "mt-2 rounded-md border border-blue-500/20 bg-blue-500/5",
            dense ? "p-2" : "p-2.5",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {state.activeCall.direction === "inbound" ? (
                <Phone className="size-3 text-blue-400 shrink-0" />
              ) : (
                <PhoneForwarded className="size-3 text-blue-400 shrink-0" />
              )}
              <span className="text-xs font-medium truncate">
                {state.activeCall.customerName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                {state.activeCall.customerState}
              </span>
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums shrink-0",
                state.activeCall.onHold ? "text-orange-400" : "text-blue-400",
              )}
              style={{ fontFamily: "Georgia, serif" }}
            >
              {formatDuration(timeOnCall)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono">{state.activeCall.customerPhone}</span>
            <span className="flex items-center gap-1">
              {state.activeCall.onHold && (
                <span className="flex items-center gap-0.5 text-orange-400">
                  <Pause className="size-2.5" />
                  hold
                </span>
              )}
              {state.activeCall.isMuted && (
                <MicOff className="size-2.5 text-muted-foreground" />
              )}
              <span className="truncate">{state.activeCall.queue}</span>
            </span>
          </div>

          {state.activeCall.debtEstimate && (
            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className="text-muted-foreground">Est. debt</span>
              <span className="font-mono font-semibold text-primary tabular-nums">
                ${state.activeCall.debtEstimate.toLocaleString()}
              </span>
            </div>
          )}

          {/* Supervisor controls */}
          {canSupervise && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 flex-1 text-[10px] gap-1 px-1.5"
                onClick={onListen}
              >
                <Headphones className="size-3" />
                Listen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 flex-1 text-[10px] gap-1 px-1.5"
                onClick={onWhisper}
              >
                <Ear className="size-3" />
                Whisper
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 flex-1 text-[10px] gap-1 px-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={onBarge}
              >
                <MessageSquare className="size-3" />
                Barge
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Not on call: show today's quick stats */}
      {!onCall && !dense && (
        <div className="mt-2 grid grid-cols-4 gap-1 text-center">
          <div className="rounded bg-muted/30 p-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Calls
            </p>
            <p className="text-xs font-semibold tabular-nums">
              {state.callsHandled}
            </p>
          </div>
          <div className="rounded bg-muted/30 p-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              AHT
            </p>
            <p className="text-xs font-semibold tabular-nums">
              {formatDuration(state.avgHandleTimeSec)}
            </p>
          </div>
          <div className="rounded bg-muted/30 p-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Enr
            </p>
            <p className="text-xs font-semibold tabular-nums text-primary">
              {state.enrolledToday}
            </p>
          </div>
          <div className="rounded bg-muted/30 p-1">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    Adh
                  </p>
                  <p
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      state.scriptAdherence >= 85
                        ? "text-emerald-400"
                        : state.scriptAdherence >= 70
                        ? "text-amber-400"
                        : "text-rose-400",
                    )}
                  >
                    {state.scriptAdherence}%
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">QA script adherence (last eval)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Last disposition pill if not on call */}
      {!onCall && state.lastDisposition && !dense && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Last outcome:
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0",
              state.lastDisposition === "enrolled" &&
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
              state.lastDisposition === "qualified" &&
                "bg-primary/10 text-primary border-primary/30",
              state.lastDisposition === "dnc_request" &&
                "bg-rose-500/10 text-rose-400 border-rose-500/30",
              state.lastDisposition === "wrong_party" &&
                "bg-amber-500/10 text-amber-400 border-amber-500/30",
            )}
          >
            {state.lastDisposition === "dnc_request" && (
              <ShieldAlert className="size-2.5 mr-0.5" />
            )}
            {DISPOSITION_LABEL[state.lastDisposition]}
          </Badge>
        </div>
      )}
    </div>
  )
}
