"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Send } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { mockUsers } from "@/lib/mock-data"
import {
  canMessage,
  getMessagesForThread,
  getThread,
  markThreadRead,
  sendMessage,
  useMessaging,
} from "@/lib/messaging"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sameDay = d >= today
  return sameDay
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
}

// -----------------------------------------------------------------------------

export default function ThreadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams<{ threadId: string }>()
  const threadId = params?.threadId
  const { version } = useMessaging(user?.id)
  const [body, setBody] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const thread = React.useMemo(
    () => (threadId ? getThread(threadId) : undefined),
    [threadId, version],
  )
  const messages = React.useMemo(
    () => (threadId ? getMessagesForThread(threadId) : []),
    [threadId, version],
  )

  const otherId = thread?.participants.find((p) => p !== user?.id)
  const otherUser = mockUsers.find((u) => u.id === otherId)

  // Guard: user must be a participant
  const allowed = thread && user ? thread.participants.includes(user.id) : false

  React.useEffect(() => {
    if (threadId && user && allowed) {
      markThreadRead(threadId, user.id)
    }
  }, [threadId, user, allowed, version])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length])

  if (!user) return null

  if (!thread || !allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card className="p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">Conversation unavailable</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            This thread doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild variant="outline">
            <Link href="/inbox">Back to Inbox</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const canReply = user && otherUser ? canMessage(user, otherUser) : false

  function onSend() {
    if (!body.trim() || !user || !threadId) return
    sendMessage({
      threadId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      body: body.trim(),
    })
    setBody("")
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col p-4 lg:p-6">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <button
          onClick={() => router.push("/inbox")}
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="size-3" />
          Inbox
        </button>
      </div>

      <Card className="mb-3 flex items-center gap-3 p-3">
        <Avatar className="size-10">
          <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} alt="" />
          <AvatarFallback>{otherUser?.name.slice(0, 2) ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">
              {otherUser?.name ?? "Unknown user"}
            </h2>
            {otherUser && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase">
                {ROLE_LABEL[otherUser.role]}
              </Badge>
            )}
          </div>
          {otherUser?.teamName && (
            <p className="truncate text-xs text-muted-foreground">
              {otherUser.teamName}
            </p>
          )}
        </div>
      </Card>

      <Card
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Send the first message to start this thread.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.id
          return (
            <div
              key={m.id}
              className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}
            >
              {!mine && (
                <Avatar className="size-7">
                  <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} alt="" />
                  <AvatarFallback>{otherUser?.name.slice(0, 2) ?? "?"}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2",
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                <div
                  className={cn(
                    "mt-1 text-[10px]",
                    mine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {formatDateTime(m.sentAt)}
                </div>
              </div>
            </div>
          )
        })}
      </Card>

      <Card className="mt-3 p-2">
        {canReply ? (
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              onSend()
            }}
          >
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  onSend()
                }
              }}
              placeholder="Type a message... (Ctrl/Cmd+Enter to send)"
              rows={2}
              className="min-h-[44px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0"
            />
            <Button type="submit" size="sm" disabled={!body.trim()}>
              <Send className="mr-1.5 size-3.5" />
              Send
            </Button>
          </form>
        ) : (
          <div className="p-2 text-center text-xs text-muted-foreground">
            You can&apos;t reply to this contact.
          </div>
        )}
      </Card>
    </div>
  )
}
