"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  PenSquare,
  Search,
  ChevronRight,
  Users as UsersIcon,
  Shield,
  Send,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { mockUsers } from "@/lib/mock-data"
import {
  findOrCreateThread,
  getMessageableUsers,
  sendMessage,
  useMessaging,
} from "@/lib/messaging"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------------

const ROLE_LABEL: Record<string, string> = {
  agent: "Agent",
  leadership: "Team Lead",
  supervisor: "Supervisor",
  executive: "Executive",
  admin: "Admin",
  qa_senior: "QA Senior",
  qa_analyst: "QA Analyst",
  qa_trainer: "QA Trainer",
  rta: "RTA",
}

const ROLE_COLOR: Record<string, string> = {
  agent: "bg-chart-2/15 text-chart-2",
  leadership: "bg-primary/15 text-primary",
  supervisor: "bg-chart-4/15 text-chart-4",
  executive: "bg-chart-3/15 text-chart-3",
  admin: "bg-destructive/15 text-destructive",
  qa_senior: "bg-chart-5/15 text-chart-5",
  qa_analyst: "bg-chart-5/15 text-chart-5",
  qa_trainer: "bg-chart-5/15 text-chart-5",
  rta: "bg-warning/15 text-warning",
}

function timeAgo(iso: string): string {
  const diff = Date.now() - +new Date(iso)
  const min = 60_000
  const hr = 60 * min
  const day = 24 * hr
  if (diff < min) return "just now"
  if (diff < hr) return `${Math.round(diff / min)}m`
  if (diff < day) return `${Math.round(diff / hr)}h`
  return `${Math.round(diff / day)}d`
}

// -----------------------------------------------------------------------------

export default function InboxPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { threads } = useMessaging(user?.id)
  const [search, setSearch] = React.useState("")
  const [composeOpen, setComposeOpen] = React.useState(false)

  if (!user) return null

  const filtered = threads.filter((t) => {
    const other = t.participants.find((p) => p !== user.id)
    const otherUser = mockUsers.find((u) => u.id === other)
    const q = search.toLowerCase()
    return (
      !q ||
      otherUser?.name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.lastMessagePreview.toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-[1200px] p-4 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Mail className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              Direct messages with your team, leads, QA, and admins.
            </p>
          </div>
        </div>
        <Button onClick={() => setComposeOpen(true)}>
          <PenSquare className="mr-1.5 size-3.5" />
          New message
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, subject, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="divide-y divide-border/60 overflow-hidden">
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Mail className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <div className="mb-1 text-sm font-semibold">No conversations yet</div>
            <p className="mb-4 text-xs text-muted-foreground">
              Start a conversation with someone on your team or org.
            </p>
            <Button size="sm" onClick={() => setComposeOpen(true)}>
              <PenSquare className="mr-1.5 size-3.5" />
              Compose
            </Button>
          </div>
        )}
        {filtered.map((t) => {
          const otherId = t.participants.find((p) => p !== user.id)
          const otherUser = mockUsers.find((u) => u.id === otherId)
          if (!otherUser) return null
          const unread = t.unreadBy.includes(user.id)
          return (
            <Link
              key={t.id}
              href={`/inbox/${t.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition hover:bg-muted/30",
                unread && "bg-primary/[0.03]",
              )}
            >
              <Avatar className="size-10">
                <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt="" />
                <AvatarFallback>{otherUser.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      unread ? "font-semibold" : "font-medium",
                    )}
                  >
                    {otherUser.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 px-1.5 text-[9px] uppercase",
                      ROLE_COLOR[otherUser.role],
                    )}
                  >
                    {ROLE_LABEL[otherUser.role]}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {t.lastSenderId === user.id ? "You: " : ""}
                  {t.lastMessagePreview || "(no messages yet)"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {timeAgo(t.lastMessageAt)}
                </span>
                {unread && <div className="size-2 rounded-full bg-primary" />}
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </div>
            </Link>
          )
        })}
      </Card>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onThreadReady={(threadId) => router.push(`/inbox/${threadId}`)}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Compose Dialog
// -----------------------------------------------------------------------------

function ComposeDialog({
  open,
  onOpenChange,
  onThreadReady,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onThreadReady: (threadId: string) => void
}) {
  const { user } = useAuth()
  const [recipientId, setRecipientId] = React.useState<string | null>(null)
  const [body, setBody] = React.useState("")
  const [recipientSearch, setRecipientSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null)

  const allowed = React.useMemo(() => {
    if (!user) return []
    return getMessageableUsers(user, mockUsers)
  }, [user])

  const byRole = React.useMemo(() => {
    const out: Record<string, typeof allowed> = {}
    allowed.forEach((u) => {
      out[u.role] = out[u.role] || []
      out[u.role].push(u)
    })
    return out
  }, [allowed])

  const visibleRoles = Object.keys(byRole)

  const filteredRecipients = React.useMemo(() => {
    return allowed.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (!recipientSearch) return true
      return u.name.toLowerCase().includes(recipientSearch.toLowerCase())
    })
  }, [allowed, roleFilter, recipientSearch])

  function send() {
    if (!user || !recipientId || !body.trim()) return
    const thread = findOrCreateThread({
      senderId: user.id,
      recipientId,
    })
    sendMessage({
      threadId: thread.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      body: body.trim(),
    })
    setBody("")
    setRecipientId(null)
    onOpenChange(false)
    onThreadReady(thread.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <Shield className="size-3" />
            Only roles you&apos;re allowed to contact are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Recipient
            </Label>
            <div className="rounded-lg border border-border/70">
              <div className="flex items-center gap-2 border-b border-border/60 p-2">
                <Search className="size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="h-7 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-wrap gap-1 border-b border-border/60 p-2">
                <button
                  type="button"
                  onClick={() => setRoleFilter(null)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase transition",
                    roleFilter === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  All ({allowed.length})
                </button>
                {visibleRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase transition",
                      roleFilter === r
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {ROLE_LABEL[r] ?? r} ({byRole[r].length})
                  </button>
                ))}
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredRecipients.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    <UsersIcon className="mx-auto mb-1 size-5 opacity-50" />
                    No recipients match.
                  </div>
                )}
                {filteredRecipients.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setRecipientId(u.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-muted/40",
                      recipientId === u.id && "bg-primary/10",
                    )}
                  >
                    <Avatar className="size-7">
                      <AvatarImage src={u.avatar || "/placeholder.svg"} alt="" />
                      <AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{u.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        {u.teamName ?? (u.teamNames?.join(", ") ?? "")}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 px-1.5 text-[9px] uppercase",
                        ROLE_COLOR[u.role],
                      )}
                    >
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              Message
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={!recipientId || !body.trim()}>
            <Send className="mr-1.5 size-3.5" />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
