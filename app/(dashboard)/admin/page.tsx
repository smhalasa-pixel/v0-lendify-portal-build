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
import { CurrencyDisplay } from '@/components/ui/currency-display'

const adminModules = [
  {
    title: 'User Management',
    description: 'Manage users, roles, and permissions',
    href: '/admin/users',
    icon: Users,
    stats: '24 active users',
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
    description: 'Configure layouts and platform settings',
    href: '/admin/settings',
    icon: Settings,
    stats: 'Last updated 2d ago',
  },
]

export default function AdminPage() {
  const { user } = useAuth()
  
  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              The Admin Panel is only accessible to administrators. Please contact your system administrator for access.
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
                <CurrencyDisplay value={dashboardMetrics.debtLoadEnrolled} className="text-2xl font-bold" />
                <p className="text-sm text-muted-foreground">MTD Debt Load</p>
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
                <p className="text-2xl font-bold">{dashboardMetrics.unitsEnrolled}</p>
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
              <Link key={module.title} href={module.href}>
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

      {/* EPF Lead Source Performance */}
      <Card>
        <CardHeader>
          <CardTitle>EPF Lead Source Performance</CardTitle>
          <CardDescription>Marketing spend and cost efficiency by lead source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Lead Source</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Spent Budget</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">CPE</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">CPDE</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Clients FPC</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">DE FPC</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Google Ads', spentBudget: 125000, cpe: 2450, cpde: 0.082, clientsFpc: 51, deFpc: 1520000 },
                  { name: 'Facebook Ads', spentBudget: 85000, cpe: 2125, cpde: 0.071, clientsFpc: 40, deFpc: 1200000 },
                  { name: 'TikTok Ads', spentBudget: 45000, cpe: 1875, cpde: 0.063, clientsFpc: 24, deFpc: 720000 },
                  { name: 'Referrals', spentBudget: 15000, cpe: 750, cpde: 0.025, clientsFpc: 20, deFpc: 600000 },
                  { name: 'Organic Search', spentBudget: 8000, cpe: 400, cpde: 0.013, clientsFpc: 20, deFpc: 600000 },
                  { name: 'Direct Mail', spentBudget: 32000, cpe: 3200, cpde: 0.107, clientsFpc: 10, deFpc: 300000 },
                  { name: 'Radio', spentBudget: 28000, cpe: 2800, cpde: 0.093, clientsFpc: 10, deFpc: 300000 },
                ].map((source, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{source.name}</td>
                    <td className="py-3 px-4 text-right">
                      <CurrencyDisplay value={source.spentBudget} className="text-sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <CurrencyDisplay value={source.cpe} className="text-sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <CurrencyDisplay value={source.cpde} className="text-sm" />
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{source.clientsFpc}</td>
                    <td className="py-3 px-4 text-right">
                      <CurrencyDisplay value={source.deFpc} className="text-sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-semibold">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">
                    <CurrencyDisplay value={338000} className="text-sm font-semibold" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <CurrencyDisplay value={1943} className="text-sm font-semibold" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <CurrencyDisplay value={0.065} className="text-sm font-semibold" />
                  </td>
                  <td className="py-3 px-4 text-right">175</td>
                  <td className="py-3 px-4 text-right">
                    <CurrencyDisplay value={5240000} className="text-sm font-semibold" />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

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
