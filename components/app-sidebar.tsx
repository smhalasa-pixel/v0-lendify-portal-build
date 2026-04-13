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

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Knowledge Base',
    href: '/knowledge',
    icon: BookOpen,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Scripts',
    href: '/scripts',
    icon: FileText,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'To Do List',
    href: '/tasks',
    icon: ClipboardList,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Leaderboards',
    href: '/leaderboards',
    icon: Trophy,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Commissions',
    href: '/commissions',
    icon: DollarSign,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
  {
    title: 'Clawbacks',
    href: '/clawbacks',
    icon: AlertTriangle,
    roles: ['agent', 'leadership', 'executive'] as UserRole[],
  },
]

const adminNavItems = [
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    roles: ['executive'] as UserRole[],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    roles: ['executive'] as UserRole[],
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['executive'] as UserRole[],
  },
]

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'executive':
      return 'default'
    case 'leadership':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'executive':
      return 'Executive'
    case 'leadership':
      return 'Team Leader'
    default:
      return 'Sales Agent'
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, switchRole } = useAuth()
  const hasAdminAccess = useHasAccess(['executive'])

  const filteredMainNav = mainNavItems.filter(item => {
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
                <Image
                  src="/images/lendify-logo.png"
                  alt="Lendify"
                  width={32}
                  height={32}
                  className="rounded-lg object-contain"
                  style={{ width: 32, height: 'auto' }}
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-foreground">Lendify</span>
                  <span className="text-xs text-muted-foreground">Portal</span>
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
                <DropdownMenuItem onClick={() => switchRole('executive')}>
                  <Badge variant="default" className="mr-2">Executive</Badge>
                  Jennifer Martinez
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
