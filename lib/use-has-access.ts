"use client"

import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"

/**
 * Hook that returns a `hasAccess(roles)` predicate based on the current user.
 * Admins always have access. If no user is loaded, access is denied.
 *
 * Example:
 *   const { hasAccess } = useHasAccess()
 *   if (hasAccess(["admin", "supervisor"])) { ... }
 */
export function useHasAccess() {
  const { user } = useAuth()

  const hasAccess = (allowedRoles: Array<UserRole | string>) => {
    if (!user) return false
    if (user.role === "admin") return true
    return (allowedRoles as string[]).includes(user.role)
  }

  return { user, role: user?.role, hasAccess }
}
