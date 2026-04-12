'use client'

import * as React from 'react'
import {
  LayoutGrid,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
  Shield,
  Settings,
  Palette,
  Bell,
  Database,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

interface WidgetConfig {
  id: string
  name: string
  enabled: boolean
  order: number
}

interface LayoutConfig {
  role: UserRole
  widgets: WidgetConfig[]
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'kpi-cards', name: 'KPI Cards', enabled: true, order: 1 },
  { id: 'volume-chart', name: 'Volume Chart', enabled: true, order: 2 },
  { id: 'pipeline-chart', name: 'Pipeline Chart', enabled: true, order: 3 },
  { id: 'pipeline-table', name: 'Pipeline Table', enabled: true, order: 4 },
  { id: 'announcements', name: 'Announcements', enabled: true, order: 5 },
  { id: 'team-performance', name: 'Team Performance', enabled: false, order: 6 },
  { id: 'leaderboard-mini', name: 'Mini Leaderboard', enabled: false, order: 7 },
  { id: 'recent-activity', name: 'Recent Activity', enabled: false, order: 8 },
]

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('agent')
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>(defaultWidgets)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Redirect non-executives
  if (user?.role !== 'executive') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Settings are only accessible to executives.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ))
    setHasChanges(true)
  }

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newWidgets = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      const temp = newWidgets[index].order
      newWidgets[index].order = newWidgets[swapIndex].order
      newWidgets[swapIndex].order = temp
      return newWidgets.sort((a, b) => a.order - b.order)
    })
    setHasChanges(true)
  }

  const resetToDefault = () => {
    setWidgets(defaultWidgets)
    setHasChanges(false)
  }

  const saveChanges = () => {
    // In a real app, this would save to the database
    setHasChanges(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and dashboard layouts
          </p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetToDefault}>
              <RotateCcw className="size-4 mr-2" />
              Reset
            </Button>
            <Button onClick={saveChanges}>
              <Save className="size-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList>
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="size-4" />
            Layout Builder
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="size-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Layout Builder Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Layout Builder</CardTitle>
              <CardDescription>
                Configure which widgets appear on dashboards for each role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selector */}
              <div className="flex items-center gap-4">
                <Label>Configure layout for:</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent Dashboard</SelectItem>
                    <SelectItem value="leadership">Leadership Dashboard</SelectItem>
                    <SelectItem value="executive">Executive Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Widget List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-4">
                  <span>Available Widgets</span>
                  <span>{widgets.filter(w => w.enabled).length} of {widgets.length} enabled</span>
                </div>

                {widgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                      widget.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
                    )}
                  >
                    <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <p className="font-medium">{widget.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Position: {widget.order}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={index === 0}
                      >
                        <span className="sr-only">Move up</span>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={index === widgets.length - 1}
                      >
                        <span className="sr-only">Move down</span>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>
                    </div>
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="Lendify Associates" />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input defaultValue="support@lendify.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year Start</Label>
                  <Select defaultValue="january">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                      <SelectItem value="october">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Demo Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Show demo data and allow role switching
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access for non-admins
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and in-app notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: 'New commission earned', description: 'When a loan closes and commission is calculated' },
                    { label: 'Clawback alert', description: 'When a clawback is applied to your account' },
                    { label: 'New announcement', description: 'When a company-wide announcement is posted' },
                    { label: 'Weekly summary', description: 'Weekly performance summary every Monday' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={index < 2} />
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">In-App Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Pipeline updates', description: 'Real-time updates on loan status changes' },
                    { label: 'Leaderboard changes', description: 'When your ranking changes' },
                    { label: 'Knowledge base updates', description: 'When new articles are published' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select defaultValue="dark">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: 'Gold', color: 'bg-[#BFBF3F]' },
                      { name: 'Emerald', color: 'bg-emerald-500' },
                      { name: 'Blue', color: 'bg-blue-500' },
                      { name: 'Purple', color: 'bg-purple-500' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        className={cn(
                          'size-8 rounded-full border-2',
                          c.color,
                          c.name === 'Gold' ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                        )}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: Lendify Gold
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for denser information display
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Avatars</p>
                    <p className="text-sm text-muted-foreground">
                      Display user avatars throughout the platform
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
