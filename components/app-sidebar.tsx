'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  AlertTriangle,
  Megaphone,
  BookOpen,
  FileText,
  Trophy,
  Settings,
  Users,
  ChevronDown,
  LogOut,
  Shield,
  ClipboardList,
  Ticket,
  SlidersHorizontal,
  ClipboardCheck,
  GraduationCap,
  Radio,
  Clock,
  Bell,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth, useHasAccess } from '@/lib/auth-context'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/types'
import { BreakControl } from '@/components/break-control'
import { ForgeLogo } from '@/components/forge-logo'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin'] as UserRole[],
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin'] as UserRole[],
  },
  {
    title: 'Knowledge Base',
    href: '/knowledge',
    icon: BookOpen,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin'] as UserRole[],
  },
  {
    title: 'Scripts',
    href: '/scripts',
    icon: FileText,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin'] as UserRole[],
  },
  {
    title: 'To Do List',
    href: '/tasks',
    icon: ClipboardList,
    roles: ['agent', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
  {
    title: 'Leaderboards',
    href: '/leaderboards',
    icon: Trophy,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin'] as UserRole[],
  },
  {
    title: 'Commissions',
    href: '/commissions',
    icon: DollarSign,
    roles: ['agent', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
  {
    title: 'Clawbacks',
    href: '/clawbacks',
    icon: AlertTriangle,
    roles: ['agent', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: Ticket,
    roles: ['agent', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
  {
    title: 'My Settings',
    href: '/settings',
    icon: SlidersHorizontal,
    roles: ['agent', 'leadership', 'supervisor', 'executive', 'admin', 'qa_senior', 'qa_trainer'] as UserRole[],
  },
]

const qaNavItems = [
  {
    title: 'QA Dashboard',
    href: '/qa',
    icon: ClipboardCheck,
    roles: ['qa_senior', 'qa_trainer', 'admin'] as UserRole[],
  },
  {
    title: 'New Evaluation',
    href: '/qa/evaluate',
    icon: ClipboardList,
    roles: ['qa_senior', 'qa_trainer', 'admin'] as UserRole[],
  },
  {
    title: 'All Evaluations',
    href: '/qa/evaluations',
    icon: FileText,
    roles: ['qa_senior', 'qa_trainer', 'admin'] as UserRole[],
  },
  {
    title: 'Scorecards',
    href: '/qa/scorecards',
    icon: GraduationCap,
    roles: ['qa_senior', 'qa_trainer', 'admin'] as UserRole[],
  },
]

const rtaNavItems = [
  {
    title: 'RTA Dashboard',
    href: '/rta',
    icon: Radio,
    roles: ['rta', 'admin'] as UserRole[],
  },
  {
    title: 'Agent Status',
    href: '/rta/agents',
    icon: Users,
    roles: ['rta', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
  {
    title: 'Break History',
    href: '/rta/breaks',
    icon: Clock,
    roles: ['rta', 'admin'] as UserRole[],
  },
  {
    title: 'Infractions',
    href: '/rta/infractions',
    icon: AlertTriangle,
    roles: ['rta', 'leadership', 'supervisor', 'admin'] as UserRole[],
  },
]

const adminNavItems = [
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    roles: ['admin'] as UserRole[],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'] as UserRole[],
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin'] as UserRole[],
  },
]

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'executive':
      return 'default'
    case 'supervisor':
      return 'default'
    case 'leadership':
      return 'secondary'
    case 'qa_senior':
      return 'default'
    case 'qa_trainer':
      return 'secondary'
    case 'rta':
      return 'default'
    default:
      return 'outline'
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'executive':
      return 'Executive'
    case 'supervisor':
      return 'Supervisor'
    case 'leadership':
      return 'Team Leader'
    case 'qa_senior':
      return 'QA Senior'
    case 'qa_trainer':
      return 'QA & Trainer'
    case 'rta':
      return 'RTA Monitor'
    default:
      return 'Sales Agent'
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, switchRole } = useAuth()
  const hasAdminAccess = useHasAccess(['admin'])

  const filteredMainNav = mainNavItems.filter(item => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const filteredQANav = qaNavItems.filter(item => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const filteredRTANav = rtaNavItems.filter(item => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const filteredAdminNav = adminNavItems.filter(item => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                <ForgeLogo
                  variant="icon-dark"
                  width={40}
                  className="shrink-0 ring-1 ring-sidebar-border"
                  ariaLabel=""
                />
                <div className="flex flex-col gap-0.5 leading-none text-left">
                  <span
                    className="text-sm font-bold tracking-[0.18em] text-sidebar-foreground"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    FORGE
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#E8B746]">
                    SALES · FORGED · DAILY
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNav.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredQANav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Quality Assurance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredQANav.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredRTANav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Real-Time Adherence</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredRTANav.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {hasAdminAccess && filteredAdminNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminNav.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Break Control for agents/leaders/supervisors */}
        <BreakControl />
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
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-medium truncate max-w-[120px]">
                      {user?.name || 'Guest'}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(user?.role || 'agent')}
                      className="w-fit text-[10px] px-1.5 py-0"
                    >
                      {getRoleLabel(user?.role || 'agent')}
                    </Badge>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Demo: Switch Role
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole('agent')}>
                  <Badge variant="outline" className="mr-2">Sales Agent</Badge>
                  Sarah Johnson
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('leadership')}>
                  <Badge variant="secondary" className="mr-2">Team Leader</Badge>
                  Michael Chen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('supervisor')}>
                  <Badge variant="default" className="mr-2">Supervisor</Badge>
                  Alex Thompson
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('executive')}>
                  <Badge variant="default" className="mr-2">Executive</Badge>
                  Jennifer Martinez
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('admin')}>
                  <Badge variant="destructive" className="mr-2">Admin</Badge>
                  System Administrator
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  QA Roles
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole('qa_senior')}>
                  <Badge variant="default" className="mr-2">QA Senior</Badge>
                  Marcus Rodriguez
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchRole('qa_trainer')}>
                  <Badge variant="secondary" className="mr-2">QA Trainer</Badge>
                  Lisa Chen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  RTA Roles
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => switchRole('rta')}>
                  <Badge variant="default" className="mr-2">RTA Monitor</Badge>
                  Rachel Adams
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 size-4" />
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
