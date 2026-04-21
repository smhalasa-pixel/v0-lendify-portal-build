"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  MessageSquare,
  GraduationCap,
  ClipboardCheck,
  Target as TargetIcon,
  AlertTriangle,
  ListTodo,
  Megaphone,
  DollarSign,
  Clock,
  ArrowUp,
  Check,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import {
  markAllRead,
  markNotificationRead,
  seedNotificationsForUser,
  useNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/notifications"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------------

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  message: MessageSquare,
  coaching_scheduled: GraduationCap,
  qa_eval_published: ClipboardCheck,
  target_updated: TargetIcon,
  clawback_risk: AlertTriangle,
  task_assigned: ListTodo,
  announcement: Megaphone,
  commission_paid: DollarSign,
  rta_alert: Clock,
  escalation: ArrowUp,
}

const COLOR_MAP: Record<NotificationType, string> = {
  message: "bg-chart-2/15 text-chart-2",
  coaching_scheduled: "bg-primary/15 text-primary",
  qa_eval_published: "bg-chart-4/15 text-chart-4",
  target_updated: "bg-primary/15 text-primary",
  clawback_risk: "bg-destructive/15 text-destructive",
  task_assigned: "bg-chart-2/15 text-chart-2",
  announcement: "bg-chart-3/15 text-chart-3",
  commission_paid: "bg-chart-3/15 text-chart-3",
  rta_alert: "bg-warning/15 text-warning",
  escalation: "bg-destructive/15 text-destructive",
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

export function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount } = useNotifications(user?.id)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      seedNotificationsForUser({
        userId: user.id,
        userRole: user.role,
        userName: user.name,
      })
    }
  }, [user])

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-[11px]"
              onClick={() => markAllRead(user.id)}
            >
              <Check className="size-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 size-8 opacity-40" />
              <div>Nothing here yet.</div>
            </div>
          )}
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} onClose={() => setOpen(false)} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const Icon = ICON_MAP[notification.type]
  const colorClass = COLOR_MAP[notification.type]
  const unread = !notification.readAt

  const handleClick = () => {
    if (unread) markNotificationRead(notification.id)
    onClose()
  }

  const content = (
    <div
      className={cn(
        "flex gap-3 border-b border-border/40 px-4 py-3 transition hover:bg-muted/40",
        unread && "bg-primary/[0.03]",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          colorClass,
        )}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[13px] font-semibold leading-tight">
            {notification.title}
          </div>
          <div className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(notification.createdAt)}
          </div>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.body}
        </p>
      </div>
      {unread && (
        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={handleClick}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {content}
    </button>
  )
}
