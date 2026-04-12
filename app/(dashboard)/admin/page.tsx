'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users,
  Settings,
  LayoutGrid,
  FileText,
  Megaphone,
  BookOpen,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Database,
  Activity,
  Shield,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const adminModules = [
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    href: '/admin/users',
    icon: Users,
    stats: '24 active users',
  },
  {
    title: 'Layout Builder',
    description: 'Configure dashboard widgets and layouts',
    href: '/admin/settings',
    icon: LayoutGrid,
    stats: '3 layouts configured',
  },
  {
    title: 'Announcement Manager',
    description: 'Create and manage announcements',
    href: '/admin/announcements',
    icon: Megaphone,
    stats: '5 active announcements',
  },
  {
    title: 'Knowledge Base Editor',
    description: 'Manage knowledge base articles',
    href: '/admin/knowledge',
    icon: BookOpen,
    stats: '12 articles',
  },
  {
    title: 'Script Manager',
    description: 'Create and organize call scripts',
    href: '/admin/scripts',
    icon: FileText,
    stats: '8 scripts',
  },
  {
    title: 'Commission Rules',
    description: 'Configure commission structures and tiers',
    href: '/admin/commissions',
    icon: DollarSign,
    stats: '4 active plans',
  },
  {
    title: 'Clawback Rules',
    description: 'Define clawback policies and thresholds',
    href: '/admin/clawbacks',
    icon: AlertTriangle,
    stats: '2 policies',
  },
  {
    title: 'System Settings',
    description: 'General platform configuration',
    href: '/admin/settings',
    icon: Settings,
    stats: 'Last updated 2d ago',
  },
]

export default function AdminPage() {
  const { user } = useAuth()
  
  // Redirect non-executives
  if (user?.role !== 'executive') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              The Admin Panel is only accessible to executives. Please contact your administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dashboardMetrics = dataService.getDashboardMetrics('executive')
  const agents = dataService.getAgents()
  const activeAgents = agents.filter(a => a.status === 'active').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage platform settings, users, and content
        </p>
      </div>

      {/* System Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAgents}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="size-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(dashboardMetrics.mtdVolume)}</p>
                <p className="text-sm text-muted-foreground">MTD Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardMetrics.mtdUnits}</p>
                <p className="text-sm text-muted-foreground">MTD Units</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Activity className="size-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Administration Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.href} href={module.href}>
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{module.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {module.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {module.stats}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Latest changes and updates to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Updated commission structure', user: 'Jennifer Martinez', time: '2 hours ago', type: 'settings' },
              { action: 'Added new announcement', user: 'Jennifer Martinez', time: '5 hours ago', type: 'content' },
              { action: 'Approved clawback dispute', user: 'Jennifer Martinez', time: '1 day ago', type: 'finance' },
              { action: 'Created new knowledge article', user: 'Jennifer Martinez', time: '2 days ago', type: 'content' },
              { action: 'Modified user permissions', user: 'Jennifer Martinez', time: '3 days ago', type: 'users' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 py-2">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                  {activity.type === 'settings' && <Settings className="size-4 text-muted-foreground" />}
                  {activity.type === 'content' && <FileText className="size-4 text-muted-foreground" />}
                  {activity.type === 'finance' && <DollarSign className="size-4 text-muted-foreground" />}
                  {activity.type === 'users' && <Users className="size-4 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
