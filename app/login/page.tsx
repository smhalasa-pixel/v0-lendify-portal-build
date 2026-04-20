"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ForgeLogo } from "@/components/forge-logo"

const demoCredentials: Record<string, { password: string; userId: string }> = {
  "sarah.johnson": { password: "agent123", userId: "user-1" },
  "michael.chen": { password: "lead123", userId: "user-2" },
  "alex.thompson": { password: "super123", userId: "user-7" },
  "jennifer.martinez": { password: "exec123", userId: "user-3" },
  "david.williams": { password: "agent123", userId: "user-4" },
  "emily.brown": { password: "agent123", userId: "user-5" },
  admin: { password: "admin123", userId: "user-admin" },
}

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()

  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const creds = demoCredentials[username.toLowerCase()]
    if (!creds) {
      setError("Invalid username. Please check your credentials.")
      setIsLoading(false)
      return
    }
    if (creds.password !== password) {
      setError("Invalid password. Please try again.")
      setIsLoading(false)
      return
    }
    login(creds.userId)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-background/70 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <ForgeLogo variant="icon-dark" width={44} ariaLabel="" />
          <div className="flex flex-col gap-0.5 leading-none">
            <span
              className="text-base font-bold tracking-[0.18em]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              FORGE
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "#E8B746" }}
            >
              SALES · FORGED · DAILY
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle
                className="text-2xl font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="e.g. sarah.johnson"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                    backgroundColor: "#E8B746",
                    color: "#0a0a0a",
                  }}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3 text-center">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Agent</p>
                    <p className="text-muted-foreground font-mono text-[11px]">sarah.johnson</p>
                    <p className="text-muted-foreground font-mono text-[11px]">agent123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Team Lead</p>
                    <p className="text-muted-foreground font-mono text-[11px]">michael.chen</p>
                    <p className="text-muted-foreground font-mono text-[11px]">lead123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Supervisor</p>
                    <p className="text-muted-foreground font-mono text-[11px]">alex.thompson</p>
                    <p className="text-muted-foreground font-mono text-[11px]">super123</p>
                  </div>
                  <div className="p-2 rounded-md bg-muted/30 border border-border/30">
                    <p className="font-medium text-foreground">Executive</p>
                    <p className="text-muted-foreground font-mono text-[11px]">jennifer.martinez</p>
                    <p className="text-muted-foreground font-mono text-[11px]">exec123</p>
                  </div>
                </div>
                <div
                  className="mt-2 p-2 rounded-md border border-[#E8B746]/40"
                  style={{ backgroundColor: "rgba(232, 183, 70, 0.08)" }}
                >
                  <p className="font-medium" style={{ color: "#E8B746" }}>Admin</p>
                  <p className="text-muted-foreground font-mono text-[11px]">admin</p>
                  <p className="text-muted-foreground font-mono text-[11px]">admin123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/40 py-5">
        <div className="container mx-auto px-6 flex items-center justify-between text-[11px] text-muted-foreground">
          <p>Forge — Sales Operations Platform</p>
          <p className="font-mono">v2026.04</p>
        </div>
      </footer>
    </div>
  )
}
