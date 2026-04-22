/**
 * Role-based page visibility audit
 * Documents exactly what each role should see across the platform
 * Used to verify system is properly scoped
 */

import { User } from "./types"

export type PageVisibility = Record<string, Record<string, boolean>>

/**
 * Page access matrix: [role][page] = can access
 * This is the source of truth for who sees what
 */
export const pageVisibilityMatrix: PageVisibility = {
  agent: {
    "/dashboard": true,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": true,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": true,
    "/tickets": true,
    "/commissions": true,
    "/clawbacks": true,
    "/calls": true,
    "/calls/floor": false,
    "/calls/ringcentral": false,
    "/huddle": false,
    "/qa": false,
    "/rta": false,
    "/admin": false,
    "/admin/targets": false,
    "/admin/users": false,
    "/admin/settings": false,
    "/admin/commissions": false,
    "/admin/clawbacks": false,
  },
  leadership: {
    "/dashboard": true,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": true,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": true,
    "/tickets": true,
    "/commissions": true,
    "/clawbacks": true,
    "/calls": true,
    "/calls/floor": true,
    "/calls/ringcentral": false,
    "/huddle": true,
    "/qa": true,
    "/rta": true,
    "/admin": false,
    "/admin/targets": false,
    "/admin/users": false,
    "/admin/settings": false,
    "/admin/commissions": false,
    "/admin/clawbacks": false,
  },
  supervisor: {
    "/dashboard": true,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": true,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": true,
    "/tickets": true,
    "/commissions": true,
    "/clawbacks": true,
    "/calls": true,
    "/calls/floor": true,
    "/calls/ringcentral": true,
    "/huddle": true,
    "/qa": true,
    "/rta": true,
    "/admin": false,
    "/admin/targets": false,
    "/admin/users": false,
    "/admin/settings": false,
    "/admin/commissions": false,
    "/admin/clawbacks": false,
  },
  executive: {
    "/dashboard": true,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": true,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": true,
    "/tickets": true,
    "/commissions": true,
    "/clawbacks": true,
    "/calls": true,
    "/calls/floor": true,
    "/calls/ringcentral": true,
    "/huddle": true,
    "/qa": true,
    "/rta": true,
    "/admin": true,
    "/admin/targets": false,
    "/admin/users": false,
    "/admin/settings": false,
    "/admin/commissions": false,
    "/admin/clawbacks": false,
  },
  admin: {
    "/dashboard": true,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": true,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": true,
    "/tickets": true,
    "/commissions": true,
    "/clawbacks": true,
    "/calls": true,
    "/calls/floor": true,
    "/calls/ringcentral": true,
    "/huddle": true,
    "/qa": true,
    "/rta": true,
    "/admin": true,
    "/admin/targets": true,
    "/admin/users": true,
    "/admin/settings": true,
    "/admin/commissions": true,
    "/admin/clawbacks": true,
  },
  qa_analyst: {
    "/dashboard": false,
    "/inbox": true,
    "/coaching": false,
    "/leaderboards": false,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": false,
    "/tickets": true,
    "/commissions": false,
    "/clawbacks": false,
    "/calls": false,
    "/calls/floor": false,
    "/calls/ringcentral": false,
    "/huddle": false,
    "/qa": true,
    "/rta": false,
    "/admin": false,
  },
  qa_senior: {
    "/dashboard": false,
    "/inbox": true,
    "/coaching": false,
    "/leaderboards": false,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": false,
    "/tickets": true,
    "/commissions": false,
    "/clawbacks": false,
    "/calls": false,
    "/calls/floor": false,
    "/calls/ringcentral": false,
    "/huddle": false,
    "/qa": true,
    "/rta": false,
    "/admin": false,
  },
  qa_trainer: {
    "/dashboard": false,
    "/inbox": true,
    "/coaching": true,
    "/leaderboards": false,
    "/announcements": true,
    "/scripts": true,
    "/knowledge": true,
    "/tasks": false,
    "/tickets": true,
    "/commissions": false,
    "/clawbacks": false,
    "/calls": false,
    "/calls/floor": false,
    "/calls/ringcentral": false,
    "/huddle": false,
    "/qa": true,
    "/rta": false,
    "/admin": false,
  },
  rta: {
    "/dashboard": false,
    "/inbox": true,
    "/coaching": false,
    "/leaderboards": false,
    "/announcements": true,
    "/scripts": false,
    "/knowledge": false,
    "/tasks": false,
    "/tickets": false,
    "/commissions": false,
    "/clawbacks": false,
    "/calls": false,
    "/calls/floor": true,
    "/calls/ringcentral": false,
    "/huddle": false,
    "/qa": false,
    "/rta": true,
    "/admin": false,
  },
}

export function canAccessPage(user: User | null, pathname: string): boolean {
  if (!user) return false

  const userMatrix = pageVisibilityMatrix[user.role]
  if (!userMatrix) return false

  // Exact match first
  if (pathname in userMatrix) {
    return userMatrix[pathname]
  }

  // Check parent paths (e.g., /admin/targets → /admin)
  const parts = pathname.split("/").filter(Boolean)
  for (let i = parts.length; i > 0; i--) {
    const parent = "/" + parts.slice(0, i).join("/")
    if (parent in userMatrix) {
      return userMatrix[parent]
    }
  }

  return false
}

/**
 * Data visibility: scopes data by team/role
 * Used by pages to filter what data they show
 */
export interface DataVisibilityScope {
  isAgent: boolean
  isSelfOnly: boolean // agent or personal role
  isTeamScoped: boolean // can see own team
  isOrgWide: boolean // can see everything
  teamIds?: string[]
  agentIds?: string[]
}

export function getDataVisibilityScope(user: User): DataVisibilityScope {
  const isAgent = user.role === "agent"

  if (isAgent) {
    return {
      isAgent: true,
      isSelfOnly: true,
      isTeamScoped: false,
      isOrgWide: false,
      agentIds: [user.id],
      teamIds: [],
    }
  }

  if (user.role === "leadership") {
    return {
      isAgent: false,
      isSelfOnly: false,
      isTeamScoped: true,
      isOrgWide: false,
      agentIds: [],
      teamIds: user.teamId ? [user.teamId] : [],
    }
  }

  if (user.role === "supervisor") {
    return {
      isAgent: false,
      isSelfOnly: false,
      isTeamScoped: true,
      isOrgWide: false,
      agentIds: [],
      teamIds: user.teamIds || [],
    }
  }

  // Executives, admins, qa, rta see org-wide
  return {
    isAgent: false,
    isSelfOnly: false,
    isTeamScoped: false,
    isOrgWide: true,
    agentIds: [],
    teamIds: [],
  }
}

/**
 * Quick audit: returns stats for admin dashboard health check
 */
export function auditPageVisibility(): {
  totalPages: number
  roleCount: number
  avgPagesPerRole: number
  coverage: Record<string, number>
} {
  const allPages = new Set<string>()
  const roleStats: Record<string, number> = {}

  Object.entries(pageVisibilityMatrix).forEach(([role, pages]) => {
    const accessibleCount = Object.values(pages).filter(Boolean).length
    roleStats[role] = accessibleCount
    Object.keys(pages).forEach((p) => allPages.add(p))
  })

  const totalPages = allPages.size
  const roleCount = Object.keys(pageVisibilityMatrix).length
  const totalAccess = Object.values(roleStats).reduce((a, b) => a + b, 0)
  const avgPagesPerRole = Math.round(totalAccess / roleCount)

  return {
    totalPages,
    roleCount,
    avgPagesPerRole,
    coverage: roleStats,
  }
}
