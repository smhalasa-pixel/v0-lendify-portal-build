"use client"

import * as React from "react"
import { ShieldAlert, ShieldCheck, FileWarning, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DISPOSITION_LABEL, formatDuration } from "@/lib/ringcentral"
import type { AgentTelephonyState } from "@/lib/ringcentral"

/**
 * Compliance & DNC Watch panel.
 *
 * Debt-settlement sales is heavily regulated (TCPA, FTC Telemarketing Sales
 * Rule, state-level licensing). This surfaces:
 *  - DNC requests today (must suppress future contact)
 *  - Wrong-party / third-party disclosures
 *  - Low script adherence agents (compliance risk)
 *  - Restricted-state calls in progress (states we're not licensed in)
 */
const RESTRICTED_STATES = new Set(["VT", "WV", "ND"]) // example of non-licensed states

interface ComplianceWatchProps {
  agents: AgentTelephonyState[]
}

export function ComplianceWatch({ agents }: ComplianceWatchProps) {
  const dncToday = agents.filter((a) => a.lastDisposition === "dnc_request")
  const wrongParty = agents.filter((a) => a.lastDisposition === "wrong_party")
  const lowAdherence = agents
    .filter((a) => a.scriptAdherence < 72)
    .sort((a, b) => a.scriptAdherence - b.scriptAdherence)
    .slice(0, 4)
  const restrictedActive = agents.filter(
    (a) => a.activeCall && RESTRICTED_STATES.has(a.activeCall.customerState),
  )

  const totalFlags =
    dncToday.length +
    wrongParty.length +
    lowAdherence.length +
    restrictedActive.length

  return (
    <Card
      className={cn(
        "border",
        totalFlags > 0 ? "border-amber-500/30" : "border-emerald-500/30",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-base flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {totalFlags > 0 ? (
              <ShieldAlert className="size-4 text-amber-400" />
            ) : (
              <ShieldCheck className="size-4 text-emerald-400" />
            )}
            Compliance Watch
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              totalFlags > 0
                ? "text-amber-400 border-amber-500/30"
                : "text-emerald-400 border-emerald-500/30",
            )}
          >
            {totalFlags} flag{totalFlags === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Restricted state live calls - highest priority */}
        {restrictedActive.length > 0 && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Ban className="size-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                Unlicensed State · Live Call
              </span>
            </div>
            <div className="space-y-1">
              {restrictedActive.map((a) => (
                <div
                  key={a.agentId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate">
                    {a.agentName}{" "}
                    <span className="text-muted-foreground">
                      → {a.activeCall!.customerState}
                    </span>
                  </span>
                  <span className="font-mono text-rose-400 shrink-0">
                    {formatDuration(
                      Math.floor((Date.now() - a.activeCall!.startedAt) / 1000),
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Three-up stat grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border/50 bg-card/40 p-2.5 text-center">
            <Ban className="size-3.5 mx-auto text-rose-400 mb-1" />
            <p
              className="text-xl font-bold tabular-nums"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {dncToday.length}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
              DNC Today
            </p>
          </div>
          <div className="rounded-md border border-border/50 bg-card/40 p-2.5 text-center">
            <FileWarning className="size-3.5 mx-auto text-amber-400 mb-1" />
            <p
              className="text-xl font-bold tabular-nums"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {wrongParty.length}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
              Wrong Party
            </p>
          </div>
          <div className="rounded-md border border-border/50 bg-card/40 p-2.5 text-center">
            <ShieldAlert className="size-3.5 mx-auto text-orange-400 mb-1" />
            <p
              className="text-xl font-bold tabular-nums"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {lowAdherence.length}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
              Low Adherence
            </p>
          </div>
        </div>

        {/* Low adherence list */}
        {lowAdherence.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Script adherence below threshold
            </p>
            {lowAdherence.map((a) => (
              <div
                key={a.agentId}
                className="flex items-center justify-between text-xs rounded bg-muted/30 px-2 py-1.5"
              >
                <span className="truncate">
                  {a.agentName}
                  <span className="text-muted-foreground ml-1">
                    · {a.teamName}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-mono font-semibold shrink-0",
                    a.scriptAdherence >= 65 ? "text-amber-400" : "text-rose-400",
                  )}
                >
                  {a.scriptAdherence}%
                </span>
              </div>
            ))}
          </div>
        )}

        {totalFlags === 0 && (
          <div className="text-center py-2 text-xs text-muted-foreground">
            All clear - no compliance flags today.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
