'use client'

import * as React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RoleGateProps {
  allowed: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ allowed, children, fallback }: RoleGateProps) {
  const { user } = useAuth()
  if (!user) return null

  const role = user.role
  // Admin sees everything, always
  if (role === 'admin') return <>{children}</>

  if (allowed.includes(role)) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-20">
      <Card className="border-border/70">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" />
          </div>
          <CardTitle className="text-base">Access restricted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This page is only available to authorized roles. Your current role is
            {' '}
            <span className="font-semibold text-foreground">{role}</span>.
          </p>
          <p className="text-xs text-muted-foreground/80">
            If you believe you should have access, contact your administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
