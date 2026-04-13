'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Users, Shield, TrendingUp } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const demoUsers = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    role: 'agent' as const,
    description: 'Sales agent view with personal KPIs and commissions',
    icon: TrendingUp,
    features: ['Personal Dashboard', 'My Commissions', 'My Pipeline', 'Scripts & KB'],
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    role: 'leadership' as const,
    description: 'Team leader & supervisor view with team oversight and performance metrics',
    icon: Users,
    features: ['Team Dashboard', 'Team Commissions', 'Performance Reports', 'All Sales Agent Features'],
  },
  {
    id: 'user-3',
    name: 'Jennifer Martinez',
    role: 'executive' as const,
    description: 'Executive view with global metrics and administrative controls',
    icon: Shield,
    features: ['Global Dashboard', 'All Teams View', 'Admin Panel', 'Layout Builder'],
  },
]

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'executive':
      return 'default'
    case 'leadership':
      return 'secondary'
    default:
      return 'outline'
  }
}

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleLogin = (userId: string) => {
    login(userId)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
            <DollarSign className="size-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Lendify Portal</h1>
            <p className="text-xs text-muted-foreground">Internal Operations Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Welcome to Lendify
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select a demo account to explore the platform. Each role provides a different view 
              tailored to their responsibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {demoUsers.map((demoUser) => {
              const Icon = demoUser.icon
              return (
                <div
                  key={demoUser.id}
                  className="glass-card rounded-xl p-5 cursor-pointer"
                  onClick={() => handleLogin(demoUser.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <Badge variant={getRoleBadgeVariant(demoUser.role)}>
                      {demoUser.role.charAt(0).toUpperCase() + demoUser.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">{demoUser.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {demoUser.description}
                  </p>
                  
                  <ul className="space-y-1.5 mb-5">
                    {demoUser.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="size-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full">
                    Sign in as {demoUser.name.split(' ')[0]}
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              This is a demo environment with mock data. In production, this would connect to your 
              authentication provider and real database.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Lendify Portal - Internal Operations Platform</p>
        </div>
      </footer>
    </div>
  )
}
