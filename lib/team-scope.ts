"use client"

/**
 * Team Scope Utility
 *
 * Centralizes the rule set for "what teams/agents is this user allowed to see?"
 * Hierarchy reminder:
 *   - Agent         : self only
 *   - Team Lead     : their single team (~8 agents)
 *   - Supervisor    : multiple teams (~3 teams, ~24 agents)
 *   - Executive     : all teams
 *   - Admin         : all teams
 *   - QA / RTA roles: org-wide view (they're specialized, not team-bound)
 *
 * All team-filtered pages (Dashboard, Leaderboards, Commissions, Clawbacks,
 * Coaching, Calls, Tasks, QA metrics) should use these helpers instead of
 * hardcoding role checks.
 */

import * as React from "react"
import { useAuth } from "@/lib/auth-context"
import { dataService, mockUsers, mockTeams } from "@/lib/mock-data"
import type { User, UserRole } from "@/lib/types"

export type ScopeLevel = "self" | "team" | "teams" | "org"

export interface TeamScope {
  /** The user this scope was computed for */
  user: User | null
  /** Whether the user can cross team boundaries at all */
  isOrgWide: boolean
  /** Whether the user is limited to their own row */
  isSelfOnly: boolean
  /** The teams the user is allowed to see (empty = no teams; org-wide should check isOrgWide) */
  teamIds: string[]
  /** The team names (parallel to teamIds) for display */
  teamNames: string[]
  /** All agent (role=agent) IDs inside the scope */
  agentIds: string[]
  /** All users (any role) inside the scope */
  memberIds: string[]
  /** Human-readable label describing the scope, e.g. "West Coast Team" or "Alex's 3 teams" */
  label: string
  /** High-level scope level classification */
  level: ScopeLevel
}

const ORG_WIDE_ROLES: UserRole[] = [
  "executive",
  "admin",
  "qa_senior",
  "qa_analyst",
  "qa_trainer",
  "rta",
]

export function computeTeamScope(user: User | null): TeamScope {
  if (!user) {
    return {
      user: null,
      isOrgWide: false,
      isSelfOnly: true,
      teamIds: [],
      teamNames: [],
      agentIds: [],
      memberIds: [],
      label: "No access",
      level: "self",
    }
  }

  // Org-wide roles
  if (ORG_WIDE_ROLES.includes(user.role)) {
    const teamIds = mockTeams.map((t) => t.id)
    const teamNames = mockTeams.map((t) => t.name)
    const memberIds = mockUsers.map((u) => u.id)
    const agentIds = mockUsers.filter((u) => u.role === "agent").map((u) => u.id)
    return {
      user,
      isOrgWide: true,
      isSelfOnly: false,
      teamIds,
      teamNames,
      agentIds,
      memberIds,
      label: "All teams",
      level: "org",
    }
  }

  // Supervisor: multiple teams
  if (user.role === "supervisor") {
    const teamIds = user.teamIds ?? []
    const teamNames =
      user.teamNames ??
      teamIds.map((id) => mockTeams.find((t) => t.id === id)?.name ?? id)
    const members = mockUsers.filter(
      (u) => u.teamId && teamIds.includes(u.teamId),
    )
    return {
      user,
      isOrgWide: false,
      isSelfOnly: false,
      teamIds,
      teamNames,
      memberIds: members.map((u) => u.id),
      agentIds: members.filter((u) => u.role === "agent").map((u) => u.id),
      label:
        teamNames.length === 1
          ? teamNames[0]
          : `${user.name.split(" ")[0]}'s ${teamNames.length} teams`,
      level: "teams",
    }
  }

  // Team Lead: single team
  if (user.role === "leadership") {
    const teamId = user.teamId
    if (!teamId) {
      return {
        user,
        isOrgWide: false,
        isSelfOnly: true,
        teamIds: [],
        teamNames: [],
        agentIds: [],
        memberIds: [user.id],
        label: user.name,
        level: "self",
      }
    }
    const members = mockUsers.filter((u) => u.teamId === teamId)
    return {
      user,
      isOrgWide: false,
      isSelfOnly: false,
      teamIds: [teamId],
      teamNames: [user.teamName ?? teamId],
      memberIds: members.map((u) => u.id),
      agentIds: members.filter((u) => u.role === "agent").map((u) => u.id),
      label: user.teamName ?? "My Team",
      level: "team",
    }
  }

  // Agent: self only
  return {
    user,
    isOrgWide: false,
    isSelfOnly: true,
    teamIds: user.teamId ? [user.teamId] : [],
    teamNames: user.teamName ? [user.teamName] : [],
    agentIds: [user.id],
    memberIds: [user.id],
    label: "Me",
    level: "self",
  }
}

/** React hook wrapper around `computeTeamScope` */
export function useTeamScope(): TeamScope {
  const { user } = useAuth()
  return React.useMemo(() => computeTeamScope(user ?? null), [user])
}

/** Filter any list of objects with an `agentId` / `teamId` to scope. */
export function filterByScope<T extends { agentId?: string; teamId?: string }>(
  items: T[],
  scope: TeamScope,
): T[] {
  if (scope.isOrgWide) return items
  if (scope.isSelfOnly)
    return items.filter((it) => !it.agentId || it.agentId === scope.user?.id)
  return items.filter((it) => {
    if (it.teamId && scope.teamIds.includes(it.teamId)) return true
    if (it.agentId && scope.agentIds.includes(it.agentId)) return true
    return false
  })
}

/** Convenience: list the agents inside the scope as `User` records. */
export function getScopedAgents(scope: TeamScope): User[] {
  if (scope.isOrgWide) {
    return mockUsers.filter((u) => u.role === "agent")
  }
  if (scope.isSelfOnly && scope.user) {
    return scope.user.role === "agent" ? [scope.user] : []
  }
  return mockUsers.filter(
    (u) => u.role === "agent" && u.teamId && scope.teamIds.includes(u.teamId),
  )
}

/** Convenience: list all members (agents + leads) inside the scope. */
export function getScopedMembers(scope: TeamScope): User[] {
  if (scope.isOrgWide) return mockUsers
  if (scope.isSelfOnly && scope.user) return [scope.user]
  return mockUsers.filter((u) => u.teamId && scope.teamIds.includes(u.teamId))
}
