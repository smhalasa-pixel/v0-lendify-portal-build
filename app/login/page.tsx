'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  Headphones,
  Users,
  UserCog,
  Briefcase,
  ShieldCheck,
  ClipboardCheck,
  GraduationCap,
  Search,
  Activity,
  Zap,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Demo credentials — covers every role in the platform so QA can validate
 * every login path. Keys are lowercased usernames.
 */
type DemoAccount = {
  username: string
  password: string
  userId: string
  name: string
  role: string
  roleLabel: string
  department: 'sales' | 'quality' | 'operations' | 'admin'
  scope: string
  icon: React.ComponentType<{ className?: string }>
}

const demoAccounts: DemoAccount[] = [
  // -------- Sales floor --------
  {
    username: 'sarah.johnson',
    password: 'agent123',
    userId: 'user-1',
    name: 'Sarah Johnson',
    role: 'agent',
    roleLabel: 'Agent',
    department: 'sales',
    scope: 'West Coast Team · Personal dashboard only',
    icon: Headphones,
  },
  {
    username: 'david.williams',
    password: 'agent123',
    userId: 'user-4',
    name: 'David Williams',
    role: 'agent',
    roleLabel: 'Agent',
    department: 'sales',
    scope: 'West Coast Team · Personal dashboard only',
    icon: Headphones,
  },
  {
    username: 'emily.brown',
    password: 'agent123',
    userId: 'user-5',
    name: 'Emily Brown',
    role: 'agent',
    roleLabel: 'Agent',
    department: 'sales',
    scope: 'East Coast Team · Personal dashboard only',
    icon: Headphones,
  },
  {
    username: 'michael.chen',
    password: 'lead123',
    userId: 'user-2',
    name: 'Michael Chen',
    role: 'leadership',
    roleLabel: 'Team Lead',
    department: 'sales',
    scope: 'West Coast Team · 1 team, ~8 agents',
    icon: Users,
  },
  {
    username: 'james.taylor',
    password: 'lead123',
    userId: 'user-6',
    name: 'James Taylor',
    role: 'leadership',
    roleLabel: 'Team Lead',
    department: 'sales',
    scope: 'East Coast Team · 1 team, ~8 agents',
    icon: Users,
  },
  {
    username: 'alex.thompson',
    password: 'super123',
    userId: 'user-7',
    name: 'Alex Thompson',
    role: 'supervisor',
    roleLabel: 'Supervisor',
    department: 'sales',
    scope: 'West + East Coast · 3 team leads, ~24 agents',
    icon: UserCog,
  },
  {
    username: 'jennifer.martinez',
    password: 'exec123',
    userId: 'user-3',
    name: 'Jennifer Martinez',
    role: 'executive',
    roleLabel: 'Executive',
    department: 'sales',
    scope: 'Entire floor · All teams, all regions',
    icon: Briefcase,
  },

  // -------- Quality department --------
  {
    username: 'qa.senior',
    password: 'qa123',
    userId: 'user-qa-senior',
    name: 'Marcus Rodriguez',
    role: 'qa_senior',
    roleLabel: 'QA Senior',
    department: 'quality',
    scope: 'Calibration · Oversees QA analysts',
    icon: ShieldCheck,
  },
  {
    username: 'qa.trainer',
    password: 'qa123',
    userId: 'user-qa-trainer',
    name: 'Lisa Chen',
    role: 'qa_trainer',
    roleLabel: 'QA Trainer',
    department: 'quality',
    scope: 'Coaching · Training flagged agents',
    icon: GraduationCap,
  },
  {
    username: 'qa.analyst',
    password: 'qa123',
    userId: 'user-qa-1',
    name: 'Jennifer Martinez (QA)',
    role: 'qa_analyst',
    roleLabel: 'QA Analyst',
    department: 'quality',
    scope: 'Evaluates calls · All agents',
    icon: ClipboardCheck,
  },
  {
    username: 'qa.analyst2',
    password: 'qa123',
    userId: 'user-qa-2',
    name: 'Kevin Thompson',
    role: 'qa_analyst',
    roleLabel: 'QA Analyst',
    department: 'quality',
    scope: 'Evaluates calls · All agents',
    icon: ClipboardCheck,
  },

  // -------- Operations --------
  {
    username: 'rta.monitor',
    password: 'rta123',
    userId: 'user-rta',
    name: 'Rachel Adams',
    role: 'rta',
    roleLabel: 'RTA Coordinator',
    department: 'operations',
    scope: 'Real-time adherence · Break compliance',
    icon: Activity,
  },

  // -------- Administration --------
  {
    username: 'admin',
    password: 'admin123',
    userId: 'user-admin',
    name: 'System Administrator',
    role: 'admin',
    roleLabel: 'Admin',
    department: 'admin',
    scope: 'Full system access · User management',
    icon: Zap,
  },
]

const credentialsByUsername: Record<string, DemoAccount> = demoAccounts.reduce(
  (acc, a) => {
    acc[a.username.toLowerCase()] = a
    return acc
  },
  {} as Record<string, DemoAccount>,
)

const departmentMeta: Record<
  DemoAccount['department'],
  { label: string; caption: string }
> = {
  sales: { label: 'Sales Floor', caption: 'Agents, team leads, supervisors & executives' },
  quality: { label: 'Quality Assurance', caption: 'Call scoring, calibration & coaching' },
  operations: { label: 'Operations', caption: 'Real-time adherence & floor compliance' },
  admin: { label: 'Administration', caption: 'Platform configuration & user management' },
}

const departmentOrder: DemoAccount['department'][] = [
  'sales',
  'quality',
  'operations',
  'admin',
]

function ForgeMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, backgroundColor: '#0B1220' }}
    >
      <svg
        viewBox="-50 -50 100 100"
        style={{ width: '78%', height: '78%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
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
        <path
          d="M -32 -30 L 32 -30 L 36 -22 L 36 -4 L 32 4 L -32 4 L -36 -4 L -36 -22 Z"
          fill="#E8B746"
        />
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
  const [search, setSearch] = React.useState('')
  const [quickLoadingId, setQuickLoadingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const c = credentialsByUsername[username.toLowerCase().trim()]
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

  const quickSignIn = async (account: DemoAccount) => {
    setError('')
    setQuickLoadingId(account.userId)
    // Small delay so the user sees the loading state — feels intentional
    await new Promise((r) => setTimeout(r, 250))
    login(account.userId)
    router.push('/dashboard')
  }

  const grouped = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? demoAccounts.filter(
          (a) =>
            a.username.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.roleLabel.toLowerCase().includes(q) ||
            a.scope.toLowerCase().includes(q),
        )
      : demoAccounts
    return departmentOrder.map((dept) => ({
      dept,
      meta: departmentMeta[dept],
      accounts: filtered.filter((a) => a.department === dept),
    }))
  }, [search])

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

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8">
          {/* Left: sign-in form */}
          <div className="lg:sticky lg:top-8 self-start w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-border/60">
              <CardHeader className="text-center space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Welcome Back
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access the portal
                </CardDescription>
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
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
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

                <p className="mt-6 text-center text-[11px] text-muted-foreground">
                  Use the quick sign-in panel on the right to try any role
                  instantly.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: quick sign-in directory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Test Accounts
                </h2>
                <p className="text-sm text-muted-foreground">
                  One-click sign-in for every role on the platform. {demoAccounts.length}{' '}
                  accounts available.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accounts..."
                  className="pl-10"
                  aria-label="Search demo accounts"
                />
              </div>
            </div>

            <div className="space-y-5">
              {grouped.map(({ dept, meta, accounts }) => {
                if (accounts.length === 0) return null
                return (
                  <section key={dept}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {meta.label}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {meta.caption}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {accounts.map((a) => {
                        const Icon = a.icon
                        const loading = quickLoadingId === a.userId
                        return (
                          <button
                            key={a.userId}
                            type="button"
                            onClick={() => quickSignIn(a)}
                            disabled={loading || quickLoadingId !== null}
                            className="group flex flex-col items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-all hover:border-[#E8B746]/60 hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8B746] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex w-full items-start gap-2.5">
                              <div
                                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 transition-colors group-hover:border-[#E8B746]/60"
                                style={{
                                  backgroundColor: 'rgba(232, 183, 70, 0.08)',
                                }}
                              >
                                <Icon className="size-4 text-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {a.name}
                                  </p>
                                  <span
                                    className="shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                                    style={{
                                      borderColor: 'rgba(232, 183, 70, 0.35)',
                                      color: '#E8B746',
                                      backgroundColor: 'rgba(232, 183, 70, 0.06)',
                                    }}
                                  >
                                    {a.roleLabel}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {a.scope}
                                </p>
                              </div>
                            </div>

                            <div className="flex w-full items-center justify-between gap-2 border-t border-border/40 pt-2 text-[11px]">
                              <div className="min-w-0 flex-1 font-mono text-muted-foreground">
                                <span className="text-foreground/80">
                                  {a.username}
                                </span>
                                <span className="mx-1.5 opacity-50">·</span>
                                <span>{a.password}</span>
                              </div>
                              <span
                                className="shrink-0 font-semibold uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ color: '#E8B746' }}
                              >
                                {loading ? 'Signing in...' : 'Sign in →'}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )
              })}

              {grouped.every((g) => g.accounts.length === 0) && (
                <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  No accounts match &quot;{search}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Forge · Internal Operations
        </p>
      </main>
    </div>
  )
}
