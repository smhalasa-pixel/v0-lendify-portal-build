'use client'

import * as React from 'react'
import type { User, UserRole } from './types'
import { mockUsers } from './mock-data'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (userId: string) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = React.createContext<AuthContextType | null>(null)

const AUTH_STORAGE_KEY = 'lendify-auth-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Load user from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        setUser(userData)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = React.useCallback((userId: string) => {
    const foundUser = mockUsers.find(u => u.id === userId)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser))
    }
  }, [])

  const logout = React.useCallback(() => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  // For demo purposes - allows switching roles without re-login
  const switchRole = React.useCallback((role: UserRole) => {
    const userWithRole = mockUsers.find(u => u.role === role)
    if (userWithRole) {
      setUser(userWithRole)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithRole))
    }
  }, [])

  const value = React.useMemo(
    () => ({ user, isLoading, login, logout, switchRole }),
    [user, isLoading, login, logout, switchRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for role-based access
export function useHasAccess(allowedRoles: UserRole[]) {
  const { user } = useAuth()
  if (!user) return false
  return allowedRoles.includes(user.role)
}
