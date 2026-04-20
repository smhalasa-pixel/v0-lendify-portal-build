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

function ForgeMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, backgroundColor: '#0B1220' }}
    >
      <svg viewBox="-50 -50 100 100" style={{ width: '78%', height: '78%' }} xmlns="http://www.w3.org/2000/svg">
        <rect x="-5" y="-4" width="10" height="46" fill="#E8B746" />
        <g stroke="#0B1220" strokeWidth="0.7">
          <line x1="-5" y1="4" x2="5" y2="4" />
          <line x1="-5" y1="10" x2="5" y2="10" />
          <line x1="-5" y1="16" x2="5" y2="16" />
          <line x1="-5" y1="22" x2="5" y2="22" />
          <line x1="-5" y1="28" x2="5" y2="28" />
          <line x1="-5" y1="34" x2="5" y2="34" />
        </g>
        <rect x="-8" y="40" width="16" height="6" fill="#E8B746" />
        <rect x="-10" y="45" width="20" height="3" fill="#E8B746" />
        <path d="M -32 -30 L 32 -30 L 36 -22 L 36 -4 L 32 4 L -32 4 L -36 -4 L -36 -22 Z" fill="#E8B746" />
        <path d="M -32 -30 L 32 -30 L 36 -22 L -36 -22 Z" fill="#F0CC6A" />
        <path d="M -36 -4 L 36 -4 L 32 4 L -32 4 Z" fill="#C99A2E" />
        <g stroke="#0B1220" strokeWidth="1.2" fill="none" strokeLinecap="square">
          <path d="M -5 -18 L 0 -10 L 5 -18 Z" />
          <line x1="-22" y1="-18" x2="-12" y2="-18" />
          <line x1="12" y1="-18" x2="22" y2="-18" />
        </g>
        <circle cx="-28" cy="-13" r="1.4" fill="#0B1220" />
        <circle cx="28" cy="-13" r="1.4" fill="#0B1220" />
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

  React.useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 450))
    const c = demoCredentials[username.toLowerCase()]
    if (!c) {
      setError('Invalid username. Please check your credentials.')
      setIsLoading(false)
      return
    }
    if (c.password !== password) {
      setError('Invalid password. Please try again.')
      setIsLoading(false)
      return
    }
    login(c.userId)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-3">
          <ForgeMark size={40} />
          <div className="flex flex-col leading-tight">
            <span
              className="text-[17px] font-bold tracking-[0.18em] text-foreground"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              FORGE
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ color: '#E8B746' }}
            >
              SALES · FORGED · DAILY
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border/60">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-semibold"
                  style={{
                    backgroundColor: '#E8B746',
                    color: '#0B1220',
                    borderColor: '#E8B746',
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 border-t border-border/60 pt-6">
                <p className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border/40 bg-muted/30 p-2">
                    <p className="font-semibold text-foreground">Agent</p>
                    <p className="text-muted-foreground">sarah.johnson</p>
                    <p className="text-muted-foreground">agent123</p>
                  </div>
                  <div className="rounded-md border border-border/40 bg-muted/30 p-2">
                    <p className="font-semibold text-foreground">Team Lead</p>
                    <p className="text-muted-foreground">michael.chen</p>
                    <p className="text-muted-foreground">lead123</p>
                  </div>
                  <div className="rounded-md border border-border/40 bg-muted/30 p-2">
                    <p className="font-semibold text-foreground">Supervisor</p>
                    <p className="text-muted-foreground">alex.thompson</p>
                    <p className="text-muted-foreground">super123</p>
                  </div>
                  <div className="rounded-md border border-border/40 bg-muted/30 p-2">
                    <p className="font-semibold text-foreground">Executive</p>
                    <p className="text-muted-foreground">jennifer.martinez</p>
                    <p className="text-muted-foreground">exec123</p>
                  </div>
                </div>
                <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs">
                  <p className="font-semibold text-destructive">Admin</p>
                  <p className="text-muted-foreground">admin</p>
                  <p className="text-muted-foreground">admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Forge · Internal Operations
          </p>
        </div>
      </main>
    </div>
  )
}
