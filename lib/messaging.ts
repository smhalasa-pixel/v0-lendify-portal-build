"use client"

/**
 * Messaging system — DM between roles with scoped recipient rules.
 *
 * Visibility matrix (who a user can DM):
 *   - agent       → own lead, own supervisor, any QA, admin, executive
 *   - leadership  → own agents, peer leads, own supervisor, any QA, admin, executive, RTA
 *   - supervisor  → own leads, own agents (via teams), peer supervisors, any QA, admin, executive, RTA
 *   - executive   → supervisors, admin, leadership
 *   - qa (any)    → anyone
 *   - rta         → leadership, supervisors, admin
 *   - admin       → anyone
 */

import * as React from "react"
import type { User, UserRole } from "./types"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MessageThread {
  id: string
  participants: string[] // userIds
  subject: string
  lastMessageAt: string
  lastMessagePreview: string
  lastSenderId: string
  createdAt: string
  unreadBy: string[]
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  body: string
  sentAt: string
  readBy: string[]
}

// -----------------------------------------------------------------------------
// Recipient rules
// -----------------------------------------------------------------------------

export function canMessage(sender: User, recipient: User): boolean {
  if (sender.id === recipient.id) return false

  const senderRole = sender.role
  const recipientRole = recipient.role

  // Admins and executives can reach everyone
  if (senderRole === "admin") return true
  if (senderRole === "executive")
    return (
      recipientRole === "admin" ||
      recipientRole === "supervisor" ||
      recipientRole === "leadership" ||
      recipientRole === "executive" ||
      recipientRole === "qa_senior" ||
      recipientRole === "qa_analyst" ||
      recipientRole === "qa_trainer"
    )

  // QA roles can reach everyone (they do evals across the floor)
  if (
    senderRole === "qa_senior" ||
    senderRole === "qa_analyst" ||
    senderRole === "qa_trainer"
  ) {
    return true
  }

  // RTA → leadership, supervisors, admin
  if (senderRole === "rta") {
    return (
      recipientRole === "leadership" ||
      recipientRole === "supervisor" ||
      recipientRole === "admin"
    )
  }

  // Agent
  if (senderRole === "agent") {
    if (recipientRole === "admin" || recipientRole === "executive") return true
    if (
      recipientRole === "qa_senior" ||
      recipientRole === "qa_analyst" ||
      recipientRole === "qa_trainer"
    )
      return true
    // Own team lead (same teamId)
    if (
      recipientRole === "leadership" &&
      sender.teamId &&
      recipient.teamId === sender.teamId
    )
      return true
    // Own supervisor
    if (
      recipientRole === "supervisor" &&
      sender.teamId &&
      recipient.teamIds?.includes(sender.teamId)
    )
      return true
    return false
  }

  // Team lead (leadership)
  if (senderRole === "leadership") {
    if (recipientRole === "admin" || recipientRole === "executive") return true
    if (
      recipientRole === "qa_senior" ||
      recipientRole === "qa_analyst" ||
      recipientRole === "qa_trainer"
    )
      return true
    if (recipientRole === "rta") return true
    // Own agents
    if (recipientRole === "agent" && recipient.teamId === sender.teamId)
      return true
    // Peer leads (any)
    if (recipientRole === "leadership") return true
    // Own supervisor
    if (
      recipientRole === "supervisor" &&
      sender.teamId &&
      recipient.teamIds?.includes(sender.teamId)
    )
      return true
    return false
  }

  // Supervisor
  if (senderRole === "supervisor") {
    if (recipientRole === "admin" || recipientRole === "executive") return true
    if (
      recipientRole === "qa_senior" ||
      recipientRole === "qa_analyst" ||
      recipientRole === "qa_trainer"
    )
      return true
    if (recipientRole === "rta") return true
    // Own team leads and agents (via teams)
    const myTeams = new Set(sender.teamIds ?? [])
    if (recipientRole === "leadership" && recipient.teamId && myTeams.has(recipient.teamId))
      return true
    if (recipientRole === "agent" && recipient.teamId && myTeams.has(recipient.teamId))
      return true
    // Peer supervisors (any)
    if (recipientRole === "supervisor") return true
    return false
  }

  return false
}

export function getMessageableUsers(sender: User, allUsers: User[]): User[] {
  return allUsers.filter((u) => canMessage(sender, u))
}

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

const STORAGE_KEY = "lendify:messaging:v1"

type MessagingStore = {
  threads: MessageThread[]
  messages: Message[]
}

function readStore(): MessagingStore {
  if (typeof window === "undefined") return { threads: [], messages: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { threads: [], messages: [] }
    const parsed = JSON.parse(raw) as MessagingStore
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    }
  } catch {
    return { threads: [], messages: [] }
  }
}

function writeStore(store: MessagingStore) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent("lendify:messaging:changed"))
  } catch {
    // noop
  }
}

// -----------------------------------------------------------------------------
// Operations
// -----------------------------------------------------------------------------

export function getThreadsForUser(userId: string): MessageThread[] {
  const { threads } = readStore()
  return threads
    .filter((t) => t.participants.includes(userId))
    .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt))
}

export function getThread(threadId: string): MessageThread | undefined {
  return readStore().threads.find((t) => t.id === threadId)
}

export function getMessagesForThread(threadId: string): Message[] {
  return readStore()
    .messages.filter((m) => m.threadId === threadId)
    .sort((a, b) => +new Date(a.sentAt) - +new Date(b.sentAt))
}

export function findOrCreateThread(args: {
  senderId: string
  recipientId: string
  subject?: string
}): MessageThread {
  const store = readStore()
  const existing = store.threads.find(
    (t) =>
      t.participants.length === 2 &&
      t.participants.includes(args.senderId) &&
      t.participants.includes(args.recipientId),
  )
  if (existing) return existing
  const now = new Date().toISOString()
  const thread: MessageThread = {
    id: `thread-${Math.random().toString(36).slice(2, 10)}`,
    participants: [args.senderId, args.recipientId],
    subject: args.subject ?? "",
    lastMessageAt: now,
    lastMessagePreview: "",
    lastSenderId: args.senderId,
    createdAt: now,
    unreadBy: [],
  }
  store.threads.push(thread)
  writeStore(store)
  return thread
}

export function sendMessage(args: {
  threadId: string
  senderId: string
  senderName: string
  senderRole: UserRole
  body: string
}): Message {
  const store = readStore()
  const thread = store.threads.find((t) => t.id === args.threadId)
  if (!thread) throw new Error("Thread not found")

  const now = new Date().toISOString()
  const message: Message = {
    id: `msg-${Math.random().toString(36).slice(2, 10)}`,
    threadId: args.threadId,
    senderId: args.senderId,
    senderName: args.senderName,
    senderRole: args.senderRole,
    body: args.body,
    sentAt: now,
    readBy: [args.senderId],
  }
  store.messages.push(message)

  thread.lastMessageAt = now
  thread.lastSenderId = args.senderId
  thread.lastMessagePreview = args.body.slice(0, 140)
  thread.unreadBy = thread.participants.filter((p) => p !== args.senderId)
  writeStore(store)
  return message
}

export function markThreadRead(threadId: string, userId: string) {
  const store = readStore()
  const thread = store.threads.find((t) => t.id === threadId)
  if (!thread) return
  thread.unreadBy = thread.unreadBy.filter((u) => u !== userId)
  store.messages
    .filter((m) => m.threadId === threadId && !m.readBy.includes(userId))
    .forEach((m) => m.readBy.push(userId))
  writeStore(store)
}

export function getUnreadThreadCount(userId: string): number {
  return readStore().threads.filter(
    (t) => t.participants.includes(userId) && t.unreadBy.includes(userId),
  ).length
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

export function useMessaging(userId: string | undefined) {
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener("lendify:messaging:changed", handler)
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) handler()
    })
    return () => {
      window.removeEventListener("lendify:messaging:changed", handler)
    }
  }, [])

  const threads = React.useMemo(
    () => (userId ? getThreadsForUser(userId) : []),
    [userId, version],
  )

  const unreadCount = React.useMemo(
    () => (userId ? getUnreadThreadCount(userId) : 0),
    [userId, version],
  )

  return { threads, unreadCount, version }
}
