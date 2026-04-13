'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Demo credentials mapping - in production this would be a database lookup
const demoCredentials: Record<string, { password: string; userId: string }> = {
  'sarah.johnson': { password: 'agent123', userId: 'user-1' },
  'michael.chen': { password: 'lead123', userId: 'user-2' },
  'alex.thompson': { password: 'super123', userId: 'user-7' },
  'jennifer.martinez': { password: 'exec123', userId: 'user-3' },
  // Additional agents
  'david.williams': { password: 'agent123', userId: 'user-4' },
  'emily.brown': { password: 'agent123', userId: 'user-5' },
  // Admin
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
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const credentials = demoCredentials[username.toLowerCase()]
    
    if (!credentials) {
      setError('Invalid username. Please check your credentials.')
      setIsLoading(false)
      return
    }
    
    if (credentials.password !== password) {
      setError('Invalid password. Please try again.')
      setIsLoading(false)
      return
    }
    
    // Successful login
    login(credentials.userId)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Image
            src="/images/lendify-logo.png"
            alt="Lendify"
            width={40}
            height={40}
            className="rounded-xl object-contain"
            style={{ width: 40, height: 'auto' }}
          />
          <div>
            <h1 className="font-bold text-lg text-foreground">Lendify Portal</h1>
            <p className="text-xs text-muted-foreground">Internal Operations Platform</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card border-border/40">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              {/* Demo Credentials Info */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-3 text-center">Demo Credentials</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Agent</p>
                    <p className="text-muted-foreground">sarah.johnson</p>
                    <p className="text-muted-foreground">agent123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Team Lead</p>
                    <p className="text-muted-foreground">michael.chen</p>
                    <p className="text-muted-foreground">lead123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Supervisor</p>
                    <p className="text-muted-foreground">alex.thompson</p>
                    <p className="text-muted-foreground">super123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Executive</p>
                    <p className="text-muted-foreground">jennifer.martinez</p>
                    <p className="text-muted-foreground">exec123</p>
                  </div>
                </div>
                <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/30">
                  <p className="font-medium text-destructive">Admin</p>
                  <p className="text-muted-foreground">admin</p>
                  <p className="text-muted-foreground">admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
