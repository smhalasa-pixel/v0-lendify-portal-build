"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Trophy,
  Megaphone,
  FileText,
  CheckSquare,
  Ticket,
  LifeBuoy,
  BookOpen,
  DollarSign,
  RotateCcw,
  ClipboardCheck,
  Activity,
  Shield,
  Settings,
  LogOut,
  MessageSquare,
  PhoneCall,
  Tv,
  Radio,
  Sunrise,
  Mail,
  Target,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { useHasAccess } from "@/lib/use-has-access"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ForgeLogo } from "@/components/forge-logo"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inbox", url: "/inbox", icon: Mail },
  {
    title: "Daily Huddle",
    url: "/huddle",
    icon: Sunrise,
    roles: ["leadership", "supervisor", "executive", "admin"],
  },
  { title: "Coaching", url: "/coaching", icon: MessageSquare },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
  { title: "Scripts", url: "/scripts", icon: FileText },
  { title: "Knowledge", url: "/knowledge", icon: BookOpen },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Commissions", url: "/commissions", icon: DollarSign },
  { title: "Clawbacks", url: "/clawbacks", icon: RotateCcw },
]

const callsNav: NavItem[] = [
  { title: "Command Center", url: "/calls", icon: PhoneCall },
  { title: "Floor TV", url: "/calls/floor", icon: Tv },
  {
    title: "RingCentral",
    url: "/calls/ringcentral",
    icon: Radio,
    roles: ["admin", "supervisor", "executive"],
  },
]

const qaNav: NavItem[] = [
  { title: "QA Dashboard", url: "/qa", icon: ClipboardCheck },
  { title: "Evaluate", url: "/qa/evaluate", icon: CheckSquare },
  { title: "Evaluations", url: "/qa/evaluations", icon: FileText },
  { title: "Scorecards", url: "/qa/scorecards", icon: Shield },
  { title: "Queue", url: "/qa/queue", icon: LifeBuoy },
]

const rtaNav: NavItem[] = [
  { title: "RTA Dashboard", url: "/rta", icon: Activity },
  { title: "Agents", url: "/rta/agents", icon: Trophy },
  { title: "Breaks", url: "/rta/breaks", icon: RotateCcw },
  { title: "Infractions", url: "/rta/infractions", icon: Shield },
]

const adminNav: NavItem[] = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Targets", url: "/admin/targets", icon: Target },
  { title: "Users", url: "/admin/users", icon: Trophy },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Knowledge", url: "/admin/knowledge", icon: BookOpen },
  { title: "Scripts", url: "/admin/scripts", icon: FileText },
  { title: "Commissions", url: "/admin/commissions", icon: DollarSign },
  { title: "Clawbacks", url: "/admin/clawbacks", icon: RotateCcw },
  { title: "Settings", url: "/admin/settings", icon: Settings },
]

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavItem[]
  pathname: string
}) {
  if (items.length === 0) return null
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { hasAccess } = useHasAccess()

  const visibleCalls = callsNav.filter((item) =>
    item.roles ? hasAccess(item.roles) : true,
  )
  const visibleQa = qaNav.filter(() =>
    hasAccess([
      "admin",
      "qa_analyst",
      "qa_senior",
      "qa_trainer",
      "supervisor",
      "executive",
      "leadership",
    ])
  )
  const visibleRta = rtaNav.filter(() =>
    hasAccess([
      "admin",
      "supervisor",
      "executive",
      "leadership",
      "rta",
    ])
  )
  const visibleAdmin = adminNav.filter(() => hasAccess(["admin"]))

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="data-[state=open]:bg-sidebar-accent">
              <Link href="/dashboard">
                <ForgeLogo
                  variant="icon-dark"
                  width={36}
                  className="shrink-0 ring-1 ring-sidebar-border"
                  ariaLabel=""
                />
                <div className="flex flex-col gap-0.5 leading-none text-left">
                  <span
                    className="text-sm font-bold tracking-[0.18em] text-sidebar-foreground"
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
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavSection
          label="Workspace"
          items={mainNav.filter((item) =>
            item.roles ? hasAccess(item.roles) : true,
          )}
          pathname={pathname}
        />
        <NavSection label="Calls" items={visibleCalls} pathname={pathname} />
        <NavSection label="Quality" items={visibleQa} pathname={pathname} />
        <NavSection label="Real-time Adherence" items={visibleRta} pathname={pathname} />
        <NavSection label="Administration" items={visibleAdmin} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary font-semibold text-xs">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || "User"}</span>
                    <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                      {user?.role || ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="size-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
