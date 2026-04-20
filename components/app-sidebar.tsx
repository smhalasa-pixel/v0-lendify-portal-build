'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ChevronDown,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { useHasAccess } from '@/lib/use-has-access'
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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ForgeLogo } from '@/components/forge-logo'

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const mainNav: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Leaderboards', url: '/leaderboards', icon: Trophy },
  { title: 'Announcements', url: '/announcements', icon: Megaphone },
  { title: 'Scripts', url: '/scripts', icon: FileText },
  { title: 'Knowledge', url: '/knowledge', icon: BookOpen },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Tickets', url: '/tickets', icon: Ticket },
  { title: 'Commissions', url: '/commissions', icon: DollarSign },
  { title: 'Clawbacks', url: '/clawbacks', icon: RotateCcw },
]

const qaNav: NavItem[] = [
  { title: 'QA Dashboard', url: '/qa', icon: ClipboardCheck },
  { title: 'Evaluate', url: '/qa/evaluate', icon: CheckSquare },
  { title: 'Evaluations', url: '/qa/evaluations', icon: FileText },
  { title: 'Scorecards', url: '/qa/scorecards', icon: Shield },
  { title: 'Queue', url: '/qa/queue', icon: LifeBuoy },
]

const rtaNav: NavItem[] = [
  { title: 'RTA Dashboard', url: '/rta', icon: Activity },
  { title: 'Agents', url: '/rta/agents', icon: Trophy },
  { title: 'Breaks', url: '/rta/breaks', icon: RotateCcw },
  { title: 'Infractions', url: '/rta/infractions', icon: Shield },
]

const adminNav: NavItem[] = [
  { title: 'Admin', url: '/admin', icon: Shield },
  { title: 'Users', url: '/admin/users', icon: Trophy },
  { title: 'Announcements', url: '/admin/announcements', icon: Megaphone },
  { title: 'Knowledge', url: '/admin/knowledge', icon: BookOpen },
  { title: 'Scripts', url: '/admin/scripts', icon: FileText },
  { title: 'Commissions', url: '/admin/commissions', icon: DollarSign },
  { title: 'Clawbacks', url: '/admin/clawbacks', icon: RotateCcw },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
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
      <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.url || pathname.startsWith(item.url + '/')
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-8 px-3 rounded-md text-sm data-[active=true]:bg-muted data-[active=true]:text-foreground"
                >
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

  const visibleQa = qaNav.filter(() =>
    hasAccess(['admin', 'qa_analyst', 'qa_manager', 'leadership']),
  )
  const visibleRta = rtaNav.filter(() =>
    hasAccess(['admin', 'supervisor', 'leadership', 'rta_coordinator']),
  )
  const visibleAdmin = adminNav.filter(() => hasAccess(['admin']))

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent"
            >
              <Link href="/dashboard" className="flex items-center gap-3">
                {/* Forge brand mark */}
                <ForgeLogo
                  variant="icon-dark"
                  width={36}
                  className="shrink-0 ring-1 ring-sidebar-border"
                  ariaLabel=""
                />
                <div className="flex flex-col gap-0.5 leading-none text-left min-w-0">
                  <span
                    className="text-sm font-bold tracking-[0.18em] text-sidebar-foreground truncate"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    FORGE
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.22em] truncate"
                    style={{ color: '#E8B746' }}
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
        <NavSection label="Workspace" items={mainNav} pathname={pathname} />
        <NavSection label="Quality" items={visibleQa} pathname={pathname} />
        <NavSection label="Real-time" items={visibleRta} pathname={pathname} />
        <NavSection label="Admin" items={visibleAdmin} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-foreground">
                    {initials}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left min-w-0 flex-1">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {user?.role || ''}
                    </span>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="min-w-[14rem]"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
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
