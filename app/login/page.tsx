'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const demoCredentials: Record<string, { password: string; userId: string }> = {
  'sarah.johnson': { password: 'agent123', userId: 'user-1' },
  'michael.chen': { password: 'lead123', userId: 'user-2' },
  'alex.thompson': { password: 'super123', userId: 'user-7' },
  'jennifer.martinez': { password: 'exec123', userId: 'user-3' },
  'david.williams': { password: 'agent123', userId: 'user-4' },
  'emily.brown': { password: 'agent123', userId: 'user-5' },
  'admin': { password: 'admin123', userId: 'user-admin' },
}

function ForgeMark({ size = 48 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-lg"
      style={{ width: size, height: size, backgroundColor: '#1A1A1A' }}
    >
      <svg viewBox="-60 -60 120 120" style={{ width: '72%', height: '72%' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fg-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#909090" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
        </defs>
        <rect x="-28" y="-34" width="56" height="24" rx="3" fill="url(#fg-metal)" />
        <line x1="-20" y1="-26" x2="20" y2="-26" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
        <line x1="-14" y1="-18" x2="14" y2="-18" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-18" cy="-22" r="2.2" fill="#3A3A3A" />
        <circle cx="0" cy="-22" r="2.2" fill="#3A3A3A" />
        <circle cx="18" cy="-22" r="2.2" fill="#3A3A3A" />
        <rect x="-6" y="-10" width="12" height="58" rx="1.5" fill="#8B6B4A" />
        <line x1="-4" y1="4" x2="4" y2="4" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="18" x2="4" y2="18" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="32" x2="4" y2="32" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="0" cy="52" rx="8" ry="5" fill="url(#fg-metal)" />
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => { if (user) router.push('/dashboard') }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const c = demoCredentials[username.toLowerCase()]
    if (!c) { setError('Invalid username. Please check your credentials.'); setIsLoading(false); return }
    if (c.password !== password) { setError('Invalid password. Please try again.'); setIsLoading(false); return }
    login(c.userId)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <ForgeMark size={40} />
          <div>
            <h1 className="text-lg font-bold tracking-[0.18em] text-foreground" style={{ fontFamily: 'Georgia, serif' }}>FORGE</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: '#E8B746' }}>SALES · FORGED · DAILY</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card border-border/40">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="size-4 shrink-0" />{error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} className="pl-10" autoComplete="username" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-3 text-center">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30"><p className="font-medium">Agent</p><p className="text-muted-foreground">sarah.johnson</p><p className="text-muted-foreground">agent123</p></div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30"><p className="font-medium">Team Lead</p><p className="text-muted-foreground">michael.chen</p><p className="text-muted-foreground">lead123</p></div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30"><p className="font-medium">Supervisor</p><p className="text-muted-foreground">alex.thompson</p><p className="text-muted-foreground">super123</p></div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30"><p className="font-medium">Executive</p><p className="text-muted-foreground">jennifer.martinez</p><p className="text-muted-foreground">exec123</p></div>
                </div>
                <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/30"><p className="font-medium text-destructive">Admin</p><p className="text-muted-foreground">admin</p><p className="text-muted-foreground">admin123</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Forge — Internal Operations Platform</p>
        </div>
      </footer>
    </div>
  )
}
