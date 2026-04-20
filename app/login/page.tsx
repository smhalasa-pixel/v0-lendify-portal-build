'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForgeLogo } from '@/components/forge-logo'

const demoCredentials: Record<string, { password: string; userId: string }> = {
  'sarah.johnson': { password: 'agent123', userId: 'user-1' },
  'michael.chen': { password: 'lead123', userId: 'user-2' },
  'alex.thompson': { password: 'super123', userId: 'user-7' },
  'jennifer.martinez': { password: 'exec123', userId: 'user-3' },
  'david.williams': { password: 'agent123', userId: 'user-4' },
  'emily.brown': { password: 'agent123', userId: 'user-5' },
  'admin': { password: 'admin123', userId: 'user-admin' },
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
    await new Promise((r) => setTimeout(r, 400))
    const c = demoCredentials[username.toLowerCase()]
    if (!c) { setError('Invalid username. Please check your credentials.'); setIsLoading(false); return }
    if (c.password !== password) { setError('Invalid password. Please try again.'); setIsLoading(false); return }
    login(c.userId)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A0A0B', color: '#FAFAFA' }}>
      <header style={{ borderBottom: '1px solid #27272A', backgroundColor: 'rgba(10,10,11,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="container mx-auto px-4 py-4">
          <ForgeLogo variant="primary" width={120} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card style={{ backgroundColor: '#121214', border: '1px solid #27272A' }}>
            <CardHeader className="text-center pb-2">
              <CardTitle style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, letterSpacing: '0.02em' }}>
                Welcome Back
              </CardTitle>
              <CardDescription style={{ color: '#A1A1A8' }}>
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5' }}>
                    <AlertCircle className="size-4 shrink-0" />{error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: '#A1A1A8' }} />
                    <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" autoComplete="username" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: '#A1A1A8' }} />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#A1A1A8' }}>
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoading}
                  style={{ backgroundColor: '#FAFAFA', color: '#0A0A0B' }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid #27272A' }}>
                <p className="text-xs mb-3 text-center" style={{ color: '#A1A1A8' }}>Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Agent', 'sarah.johnson', 'agent123'],
                    ['Team Lead', 'michael.chen', 'lead123'],
                    ['Supervisor', 'alex.thompson', 'super123'],
                    ['Executive', 'jennifer.martinez', 'exec123'],
                  ].map(([role, u, p]) => (
                    <div key={role} className="p-2 rounded-md" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
                      <p className="font-semibold" style={{ color: '#E8B746' }}>{role}</p>
                      <p style={{ color: '#A1A1A8' }}>{u}</p>
                      <p style={{ color: '#A1A1A8' }}>{p}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 rounded-md" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
                  <p className="font-semibold" style={{ color: '#FCA5A5' }}>Admin</p>
                  <p style={{ color: '#A1A1A8' }}>admin</p>
                  <p style={{ color: '#A1A1A8' }}>admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #27272A', padding: '24px 0' }}>
        <div className="container mx-auto px-4 text-center text-sm" style={{ color: '#A1A1A8' }}>
          <p>Forge — Internal Operations Platform</p>
        </div>
      </footer>
    </div>
  )
}
