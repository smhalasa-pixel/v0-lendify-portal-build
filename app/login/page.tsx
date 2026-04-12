'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Users, Shield, TrendingUp, Sparkles } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const demoUsers = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    role: 'agent' as const,
    description: 'Individual loan officer view with personal KPIs and commissions',
    icon: TrendingUp,
    features: ['Personal Dashboard', 'My Commissions', 'My Pipeline', 'Scripts & KB'],
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/25 hover:shadow-blue-500/40',
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    role: 'leadership' as const,
    description: 'Team manager view with team oversight and performance metrics',
    icon: Users,
    features: ['Team Dashboard', 'Team Commissions', 'Performance Reports', 'All Agent Features'],
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/25 hover:shadow-purple-500/40',
  },
  {
    id: 'user-3',
    name: 'Jennifer Martinez',
    role: 'executive' as const,
    description: 'Executive view with global metrics and administrative controls',
    icon: Shield,
    features: ['Global Dashboard', 'All Teams View', 'Admin Panel', 'Layout Builder'],
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/25 hover:shadow-amber-500/40',
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
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 gradient-bg" />
      
      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
            <DollarSign className="size-5" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Lendify Portal</h1>
            <p className="text-xs text-purple-300/60">Internal Operations Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles className="size-4 text-purple-400" />
              <span className="text-sm text-purple-300">Demo Environment</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Welcome to Lendify
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Select a demo account to explore the platform. Each role provides a different view 
              tailored to their responsibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {demoUsers.map((demoUser) => {
              const Icon = demoUser.icon
              return (
                <div
                  key={demoUser.id}
                  className="group cursor-pointer"
                  onClick={() => handleLogin(demoUser.id)}
                >
                  {/* Glow effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${demoUser.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className={`relative glass-card rounded-2xl p-6 h-full transition-all duration-300 ${demoUser.glow} group-hover:scale-[1.02]`}>
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${demoUser.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`size-12 rounded-xl bg-gradient-to-br ${demoUser.gradient} flex items-center justify-center shadow-lg ${demoUser.glow} transition-shadow`}>
                          <Icon className="size-6 text-white" />
                        </div>
                        <Badge 
                          variant={getRoleBadgeVariant(demoUser.role)}
                          className="bg-white/10 border-white/20 text-white"
                        >
                          {demoUser.role.charAt(0).toUpperCase() + demoUser.role.slice(1)}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{demoUser.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {demoUser.description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {demoUser.features.map((feature, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className={`size-1.5 rounded-full bg-gradient-to-r ${demoUser.gradient}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full bg-gradient-to-r ${demoUser.gradient} hover:opacity-90 text-white border-0 shadow-lg ${demoUser.glow} transition-all`}
                      >
                        Sign in as {demoUser.name.split(' ')[0]}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              This is a demo environment with mock data. In production, this would connect to your 
              authentication provider and real database.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 backdrop-blur-xl bg-black/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Lendify Portal - Internal Operations Platform</p>
        </div>
      </footer>
    </div>
  )
}
