"use client"

import * as React from "react"
import Link from "next/link"
import { Mail } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { useMessaging } from "@/lib/messaging"
import { Button } from "@/components/ui/button"

export function InboxButton() {
  const { user } = useAuth()
  const { unreadCount } = useMessaging(user?.id)

  if (!user) return null

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-9"
      aria-label={`Inbox${unreadCount > 0 ? ` (${unreadCount} unread threads)` : ""}`}
    >
      <Link href="/inbox">
        <Mail className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
