"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Copy,
  Key,
  RefreshCw,
  ShieldCheck,
  Webhook,
  WifiOff,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import {
  getExtensionBreakdown,
  getSyncableExtensionCount,
  loadRingCentralConfig,
  saveRingCentralConfig,
} from "@/lib/ringcentral"
import type { RingCentralConfig } from "@/lib/ringcentral"

/**
 * RingCentral Integration Settings
 *
 * Admins & supervisors configure the RC connection here:
 *   - OAuth/JWT credentials (server-side redirect in production)
 *   - Account ID / server URL
 *   - Extension → agent mapping (one row per team)
 *   - Sync cadence
 *   - Supervisor audio (listen/whisper/barge) toggles
 *
 * In production the JWT token is exchanged server-side and stored in a
 * database + encrypted-at-rest; this page only shows a 4-char preview.
 */
export default function RingCentralSettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin" || user?.role === "supervisor"
  const breakdown = React.useMemo(() => getExtensionBreakdown(), [])
  const totalSyncable = React.useMemo(() => getSyncableExtensionCount(), [])

  const [config, setConfig] = React.useState<RingCentralConfig>(() =>
    loadRingCentralConfig(),
  )
  const [jwtInput, setJwtInput] = React.useState("")
  const [isConnecting, setIsConnecting] = React.useState(false)

  const update = <K extends keyof RingCentralConfig>(
    key: K,
    value: RingCentralConfig[K],
  ) => {
    const next = { ...config, [key]: value }
    setConfig(next)
    saveRingCentralConfig(next)
  }

  const handleConnect = () => {
    if (!jwtInput.trim() || !config.accountId.trim()) {
      toast.error("Enter both Account ID and JWT token to connect")
      return
    }
    setIsConnecting(true)
    setTimeout(() => {
      const preview = jwtInput.slice(-4)
      const next: RingCentralConfig = {
        ...config,
        connected: true,
        jwtTokenPreview: preview,
        syncedExtensions: totalSyncable,
        lastSyncAt: new Date().toISOString(),
      }
      setConfig(next)
      saveRingCentralConfig(next)
      setJwtInput("")
      setIsConnecting(false)
      toast.success("Connected to RingCentral", {
        description: `${totalSyncable} extensions synced`,
      })
    }, 900)
  }

  const handleDisconnect = () => {
    const next: RingCentralConfig = {
      ...config,
      connected: false,
      jwtTokenPreview: "",
      syncedExtensions: 0,
      lastSyncAt: null,
    }
    setConfig(next)
    saveRingCentralConfig(next)
    toast.info("Disconnected from RingCentral")
  }

  const handleResync = () => {
    const next: RingCentralConfig = {
      ...config,
      syncedExtensions: totalSyncable,
      lastSyncAt: new Date().toISOString(),
    }
    setConfig(next)
    saveRingCentralConfig(next)
    toast.success("Extensions resynced")
  }

  const handleCopyWebhook = () => {
    const url =
      config.webhookUrl ||
      `${typeof window !== "undefined" ? window.location.origin : ""}/api/ringcentral/webhook`
    navigator.clipboard.writeText(url)
    toast.success("Webhook URL copied")
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-10 text-center">
            <ShieldCheck className="size-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold mb-1">Access Restricted</h2>
            <p className="text-sm text-muted-foreground">
              Only admins and supervisors can manage the RingCentral integration.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/calls">
              <ArrowLeft className="size-4 mr-1" />
              Back to Calls
            </Link>
          </Button>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            RingCentral Integration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your RingCentral account to stream live presence, calls, and
            queue metrics into the Calls Command Center.
          </p>
        </div>
        {config.connected ? (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            Connected
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-300 gap-1"
          >
            <WifiOff className="size-3" />
            Disconnected
          </Badge>
        )}
      </header>

      {!config.connected && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Zap className="size-4 text-amber-400" />
          <AlertDescription className="text-sm">
            Not connected. The Calls dashboard is currently running in{" "}
            <strong>Simulation Mode</strong> with realistic mock data so you can
            validate layouts and workflows before going live.
          </AlertDescription>
        </Alert>
      )}

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-base flex items-center gap-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <Key className="size-4 text-primary" />
            Credentials
          </CardTitle>
          <CardDescription>
            Use a RingCentral <strong>JWT</strong> flow from a Service App. The
            token is exchanged server-side and never rendered back to the
            browser — only a 4-character preview is displayed below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rc-server">Server URL</Label>
              <Select
                value={config.serverUrl}
                onValueChange={(v) => update("serverUrl", v)}
              >
                <SelectTrigger id="rc-server">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="https://platform.ringcentral.com">
                    Production (platform.ringcentral.com)
                  </SelectItem>
                  <SelectItem value="https://platform.devtest.ringcentral.com">
                    Sandbox (devtest)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-account">Account ID</Label>
              <Input
                id="rc-account"
                placeholder="e.g. 8054440018"
                value={config.accountId}
                onChange={(e) => update("accountId", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rc-jwt">
              JWT Token
              {config.jwtTokenPreview && (
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  ···{config.jwtTokenPreview}
                </span>
              )}
            </Label>
            <Input
              id="rc-jwt"
              placeholder={config.connected ? "Enter a new token to rotate" : "eyJra2lkIjo…"}
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              type="password"
            />
            <p className="text-[11px] text-muted-foreground">
              Generate a JWT from RingCentral Developer Console → your Service
              App → Credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!config.connected ? (
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <RefreshCw className="size-4 mr-2 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Zap className="size-4 mr-2" />
                    Connect RingCentral
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button onClick={handleResync} variant="outline">
                  <RefreshCw className="size-4 mr-2" />
                  Resync extensions
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="text-rose-400 hover:text-rose-300"
                >
                  Disconnect
                </Button>
              </>
            )}
            {config.lastSyncAt && (
              <span className="text-xs text-muted-foreground">
                Last sync: {new Date(config.lastSyncAt).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync & Behavior */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-base"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sync &amp; Behavior
          </CardTitle>
          <CardDescription>
            How often we poll RingCentral and which supervisor actions are
            allowed on live calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rc-sync-every">Polling cadence</Label>
              <Select
                value={config.syncEvery}
                onValueChange={(v) =>
                  update("syncEvery", v as RingCentralConfig["syncEvery"])
                }
              >
                <SelectTrigger id="rc-sync-every">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5s">5 seconds (recommended)</SelectItem>
                  <SelectItem value="15s">15 seconds</SelectItem>
                  <SelectItem value="30s">30 seconds</SelectItem>
                  <SelectItem value="1m">1 minute</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Live WebSocket subscription is preferred; polling is a fallback.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-webhook">Webhook URL (WebSocket subscription)</Label>
              <div className="flex gap-2">
                <Input
                  id="rc-webhook"
                  value={
                    config.webhookUrl ||
                    (typeof window !== "undefined"
                      ? `${window.location.origin}/api/ringcentral/webhook`
                      : "")
                  }
                  onChange={(e) => update("webhookUrl", e.target.value)}
                  readOnly={!config.webhookUrl}
                />
                <Button
                  onClick={handleCopyWebhook}
                  variant="outline"
                  size="icon"
                  title="Copy webhook URL"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Label className="text-sm">Call recording</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Require all outbound and inbound calls to be recorded for QA.
                </p>
              </div>
              <Switch
                checked={config.callRecording}
                onCheckedChange={(v) => update("callRecording", v)}
              />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Label className="text-sm">
                  Supervisor Listen / Whisper / Barge
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Let team-leads and supervisors join live calls. Requires
                  RingCentral Contact Center add-on.
                </p>
              </div>
              <Switch
                checked={config.whisperBargeEnabled}
                onCheckedChange={(v) => update("whisperBargeEnabled", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extension mapping */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                className="text-base flex items-center gap-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                <Webhook className="size-4 text-primary" />
                Extension Mapping
              </CardTitle>
              <CardDescription>
                {totalSyncable} extensions will sync across {breakdown.length}{" "}
                teams.
              </CardDescription>
            </div>
            <Badge variant="outline">
              {config.connected ? (
                <>
                  <Check className="size-3 mr-1 text-emerald-400" />
                  Synced
                </>
              ) : (
                "Preview"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Team
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Team Lead
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">
                  Agents
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((t) => (
                <TableRow key={t.teamId}>
                  <TableCell className="font-medium">{t.teamName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {t.lead ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t.agents}
                  </TableCell>
                  <TableCell className="text-right">
                    {config.connected ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      >
                        <Check className="size-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
