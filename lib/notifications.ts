"use client"

import * as React from "react"

// -----------------------------------------------------------------------------

export type NotificationType =
  | "message"
  | "coaching_scheduled"
  | "qa_eval_published"
  | "target_updated"
  | "clawback_risk"
  | "task_assigned"
  | "announcement"
  | "commission_paid"
  | "rta_alert"
  | "escalation"

export interface Notification {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  body: string
  actionUrl?: string
  createdAt: string
  readAt?: string
  actorId?: string
  actorName?: string
}

// -----------------------------------------------------------------------------

const STORAGE_KEY = "lendify:notifications:v1"

type Store = { notifications: Notification[] }

function read(): Store {
  if (typeof window === "undefined") return { notifications: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { notifications: [] }
    const parsed = JSON.parse(raw) as Store
    return parsed && Array.isArray(parsed.notifications) ? parsed : { notifications: [] }
  } catch {
    return { notifications: [] }
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent("lendify:notifications:changed"))
  } catch {
    // noop
  }
}

// -----------------------------------------------------------------------------

export function getNotifications(userId: string): Notification[] {
  return read()
    .notifications.filter((n) => n.recipientId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export function pushNotification(
  input: Omit<Notification, "id" | "createdAt">,
): Notification {
  const store = read()
  const next: Notification = {
    id: `ntf-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    ...input,
  }
  store.notifications.push(next)
  write(store)
  return next
}

export function markNotificationRead(id: string) {
  const store = read()
  const n = store.notifications.find((x) => x.id === id)
  if (n && !n.readAt) {
    n.readAt = new Date().toISOString()
    write(store)
  }
}

export function markAllRead(userId: string) {
  const store = read()
  const now = new Date().toISOString()
  let changed = false
  store.notifications.forEach((n) => {
    if (n.recipientId === userId && !n.readAt) {
      n.readAt = now
      changed = true
    }
  })
  if (changed) write(store)
}

export function clearAllNotifications(userId: string) {
  const store = read()
  store.notifications = store.notifications.filter((n) => n.recipientId !== userId)
  write(store)
}

// -----------------------------------------------------------------------------
// Seed — generate realistic notifications per role on first run
// -----------------------------------------------------------------------------

const SEED_FLAG_KEY = "lendify:notifications:seeded:v1"

export function seedNotificationsForUser(args: {
  userId: string
  userRole: string
  userName: string
}) {
  if (typeof window === "undefined") return
  const seededRaw = window.localStorage.getItem(SEED_FLAG_KEY)
  const seeded: Record<string, boolean> = seededRaw ? JSON.parse(seededRaw) : {}
  if (seeded[args.userId]) return

  const now = Date.now()
  const min = 60 * 1000
  const hr = 60 * min
  const day = 24 * hr

  const notes: Omit<Notification, "id">[] = []

  if (args.userRole === "agent") {
    notes.push(
      {
        recipientId: args.userId,
        type: "coaching_scheduled",
        title: "Coaching session scheduled",
        body: "Your team lead booked a 30-minute 1:1 for Friday at 10:00 AM.",
        actionUrl: "/calendar",
        createdAt: new Date(now - 2 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "qa_eval_published",
        title: "New QA evaluation available",
        body: "Your call from yesterday scored 92. Grade: A.",
        actionUrl: "/qc",
        createdAt: new Date(now - 5 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "commission_paid",
        title: "Commission payout processed",
        body: "$1,850.00 for the Apr 1–15 pay period is on its way.",
        actionUrl: "/commissions",
        createdAt: new Date(now - 1 * day).toISOString(),
        readAt: new Date(now - 0.5 * day).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "announcement",
        title: "Monthly kickoff tomorrow",
        body: "Floor-wide stand-up at 9 AM. Be on time.",
        actionUrl: "/announcements",
        createdAt: new Date(now - 3 * hr).toISOString(),
      },
    )
  }

  if (args.userRole === "leadership") {
    notes.push(
      {
        recipientId: args.userId,
        type: "rta_alert",
        title: "Adherence alert on your team",
        body: "2 agents exceeded scheduled break time in the last hour.",
        actionUrl: "/rta",
        createdAt: new Date(now - 15 * min).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "target_updated",
        title: "Team target updated",
        body: "Admin set your team units target to 180 for this month.",
        actionUrl: "/dashboard",
        createdAt: new Date(now - 6 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "escalation",
        title: "Clawback dispute pending your review",
        body: "Sarah J. flagged a clawback for review.",
        actionUrl: "/clawbacks",
        createdAt: new Date(now - 1 * day).toISOString(),
      },
    )
  }

  if (args.userRole === "supervisor" || args.userRole === "executive") {
    notes.push(
      {
        recipientId: args.userId,
        type: "target_updated",
        title: "Floor targets published",
        body: "New monthly targets are live. Review team cascade.",
        actionUrl: "/admin/targets",
        createdAt: new Date(now - 12 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "escalation",
        title: "Underperformance flag",
        body: "Team Alpha is pacing 62% — intervention recommended.",
        actionUrl: "/team",
        createdAt: new Date(now - 4 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "qa_eval_published",
        title: "Weekly QA roll-up ready",
        body: "Avg floor score 84.2 · 38 evaluations completed.",
        actionUrl: "/qc",
        createdAt: new Date(now - 1 * day).toISOString(),
        readAt: new Date(now - 0.5 * day).toISOString(),
      },
    )
  }

  if (args.userRole === "admin") {
    notes.push(
      {
        recipientId: args.userId,
        type: "escalation",
        title: "3 clawback disputes awaiting approval",
        body: "Review in the Clawbacks admin module.",
        actionUrl: "/admin/clawbacks",
        createdAt: new Date(now - 3 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "target_updated",
        title: "Targets not set for next month yet",
        body: "Draft targets for the next cycle in the Targets Center.",
        actionUrl: "/admin/targets",
        createdAt: new Date(now - 20 * hr).toISOString(),
      },
    )
  }

  if (
    args.userRole === "qa_analyst" ||
    args.userRole === "qa_senior" ||
    args.userRole === "qa_trainer"
  ) {
    notes.push(
      {
        recipientId: args.userId,
        type: "task_assigned",
        title: "12 calls in your audit queue",
        body: "SLA on the oldest: 18 hours remaining.",
        actionUrl: "/qc",
        createdAt: new Date(now - 1 * hr).toISOString(),
      },
      {
        recipientId: args.userId,
        type: "qa_eval_published",
        title: "Calibration deadline Friday",
        body: "2 calibration evaluations required this week.",
        actionUrl: "/qc",
        createdAt: new Date(now - 8 * hr).toISOString(),
      },
    )
  }

  if (args.userRole === "rta") {
    notes.push(
      {
        recipientId: args.userId,
        type: "rta_alert",
        title: "5 active infractions on the floor",
        body: "Review and dispatch.",
        actionUrl: "/rta",
        createdAt: new Date(now - 10 * min).toISOString(),
      },
    )
  }

  const store = read()
  notes.forEach((n) =>
    store.notifications.push({
      ...n,
      id: `ntf-${Math.random().toString(36).slice(2, 10)}`,
    } as Notification),
  )
  write(store)

  seeded[args.userId] = true
  window.localStorage.setItem(SEED_FLAG_KEY, JSON.stringify(seeded))
}

// -----------------------------------------------------------------------------

export function useNotifications(userId: string | undefined) {
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener("lendify:notifications:changed", handler)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handler()
    })
    return () => {
      window.removeEventListener("lendify:notifications:changed", handler)
    }
  }, [])

  const notifications = React.useMemo(
    () => (userId ? getNotifications(userId) : []),
    [userId, version],
  )

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.readAt).length,
    [notifications],
  )

  return { notifications, unreadCount }
}
