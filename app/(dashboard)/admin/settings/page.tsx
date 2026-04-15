'use client'

import * as React from 'react'
import {
  LayoutGrid,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  GripVertical,
  Shield,
  Settings,
  Palette,
  Bell,
  ChevronUp,
  ChevronDown,
  Check,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { useSettings, type DashboardWidget } from '@/lib/settings-context'
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

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const settings = useSettings()
  
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('agent')
  const [widgets, setWidgets] = React.useState<DashboardWidget[]>([])
  const [hasChanges, setHasChanges] = React.useState(false)
  const [savedMessage, setSavedMessage] = React.useState(false)

  // Load widgets for selected role
  React.useEffect(() => {
    const roleWidgets = settings.getWidgetsForRole(selectedRole)
    setWidgets([...roleWidgets].sort((a, b) => a.order - b.order))
    setHasChanges(false)
  }, [selectedRole, settings])

  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Settings are only accessible to administrators.
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
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const index = sorted.findIndex(w => w.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === sorted.length - 1) return prev

      const swapIndex = direction === 'up' ? index - 1 : index + 1
      const temp = sorted[index].order
      sorted[index].order = sorted[swapIndex].order
      sorted[swapIndex].order = temp
      
      return sorted.sort((a, b) => a.order - b.order)
    })
    setHasChanges(true)
  }

  const resetToDefault = () => {
    settings.resetWidgetsForRole(selectedRole)
    const roleWidgets = settings.getWidgetsForRole(selectedRole)
    setWidgets([...roleWidgets].sort((a, b) => a.order - b.order))
    setHasChanges(false)
  }

  const saveChanges = () => {
    settings.updateWidgetsForRole(selectedRole, widgets)
    setHasChanges(false)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  const enabledCount = widgets.filter(w => w.enabled).length

  // Group widgets by category for display
  const metricWidgets = widgets.filter(w => w.category === 'metrics').sort((a, b) => a.order - b.order)
  const chartWidgets = widgets.filter(w => w.category === 'charts').sort((a, b) => a.order - b.order)
  const otherWidgets = widgets.filter(w => w.category === 'other').sort((a, b) => a.order - b.order)
  const tableWidgets = widgets.filter(w => w.category === 'tables').sort((a, b) => a.order - b.order)

  const renderWidgetList = (widgetList: DashboardWidget[], title: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      {widgetList.map((widget) => {
        const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order)
        const index = sortedWidgets.findIndex(w => w.id === widget.id)
        return (
          <div
            key={widget.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all',
              widget.enabled 
                ? 'bg-card border-border' 
                : 'bg-muted/30 border-border/50 opacity-60'
            )}
          >
            <GripVertical className="size-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{widget.name}</p>
                {widget.enabled && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    #{widget.order}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {widget.description}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => moveWidget(widget.id, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => moveWidget(widget.id, 'down')}
                disabled={index === sortedWidgets.length - 1}
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
            <Switch
              checked={widget.enabled}
              onCheckedChange={() => toggleWidget(widget.id)}
            />
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings, notifications, and dashboard layouts
          </p>
        </div>
        {(hasChanges || savedMessage) && (
          <div className="flex items-center gap-2">
            {savedMessage ? (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 gap-1">
                <Check className="size-3" />
                Saved
              </Badge>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="size-4 mr-2" />
                  Reset
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="size-4 hidden sm:block" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="size-4 hidden sm:block" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="size-4 hidden sm:block" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Layout Builder Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Layout Builder</CardTitle>
              <CardDescription>
                Configure which widgets appear on dashboards for each role. Changes will take effect immediately when saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Label className="text-sm font-medium">Configure layout for:</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent Dashboard</SelectItem>
                    <SelectItem value="leadership">Team Lead Dashboard</SelectItem>
                    <SelectItem value="supervisor">Supervisor Dashboard</SelectItem>
                    <SelectItem value="executive">Executive Dashboard</SelectItem>
                    <SelectItem value="admin">Admin Dashboard</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  {enabledCount} of {widgets.length} widgets enabled
                </div>
              </div>

              <Separator />

              {/* Widget Lists by Category */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  {renderWidgetList(metricWidgets, 'KPI Metrics')}
                  {renderWidgetList(chartWidgets, 'Charts')}
                </div>
                <div className="space-y-6">
                  {renderWidgetList(otherWidgets, 'Sidebar Widgets')}
                  {renderWidgetList(tableWidgets, 'Data Tables')}
                </div>
              </div>

              {/* Preview Note */}
              <div className="rounded-lg border border-dashed p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Disabled widgets will be hidden from the dashboard. Enabled widgets will automatically redistribute to fill available space.
                </p>
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      value={settings.general.companyName} 
                      onChange={(e) => settings.updateGeneral({ companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input 
                      value={settings.general.supportEmail}
                      onChange={(e) => settings.updateGeneral({ supportEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year Start</Label>
                  <Select 
                    value={settings.general.fiscalYearStart}
                    onValueChange={(v) => settings.updateGeneral({ fiscalYearStart: v as 'january' | 'april' | 'july' | 'october' })}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
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
                  <Switch 
                    checked={settings.general.demoMode}
                    onCheckedChange={(v) => settings.updateGeneral({ demoMode: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access for non-admins
                    </p>
                  </div>
                  <Switch 
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(v) => settings.updateGeneral({ maintenanceMode: v })}
                  />
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
                Configure email and in-app notifications for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New commission earned</p>
                      <p className="text-sm text-muted-foreground">When a loan closes and commission is calculated</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailCommissionEarned}
                      onCheckedChange={(v) => settings.updateNotifications({ emailCommissionEarned: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Clawback alert</p>
                      <p className="text-sm text-muted-foreground">When a clawback is applied to an account</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailClawbackAlert}
                      onCheckedChange={(v) => settings.updateNotifications({ emailClawbackAlert: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New announcement</p>
                      <p className="text-sm text-muted-foreground">When a company-wide announcement is posted</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailNewAnnouncement}
                      onCheckedChange={(v) => settings.updateNotifications({ emailNewAnnouncement: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly summary</p>
                      <p className="text-sm text-muted-foreground">Weekly performance summary every Monday</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailWeeklySummary}
                      onCheckedChange={(v) => settings.updateNotifications({ emailWeeklySummary: v })}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">In-App Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pipeline updates</p>
                      <p className="text-sm text-muted-foreground">Real-time updates on loan status changes</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.inAppPipelineUpdates}
                      onCheckedChange={(v) => settings.updateNotifications({ inAppPipelineUpdates: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Leaderboard changes</p>
                      <p className="text-sm text-muted-foreground">When your ranking changes on the leaderboard</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.inAppLeaderboardChanges}
                      onCheckedChange={(v) => settings.updateNotifications({ inAppLeaderboardChanges: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Knowledge base updates</p>
                      <p className="text-sm text-muted-foreground">When new articles or updates are published</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.inAppKnowledgeBaseUpdates}
                      onCheckedChange={(v) => settings.updateNotifications({ inAppKnowledgeBaseUpdates: v })}
                    />
                  </div>
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
                  <Select 
                    value={settings.appearance.theme}
                    onValueChange={(v) => settings.updateAppearance({ theme: v as 'light' | 'dark' | 'system' })}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
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
                      { name: 'gold', color: 'bg-[#BFBF3F]', label: 'Gold' },
                      { name: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
                      { name: 'blue', color: 'bg-blue-500', label: 'Blue' },
                      { name: 'purple', color: 'bg-purple-500', label: 'Purple' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => settings.updateAppearance({ accentColor: c.name as 'gold' | 'emerald' | 'blue' | 'purple' })}
                        className={cn(
                          'size-8 rounded-full border-2 transition-all',
                          c.color,
                          settings.appearance.accentColor === c.name 
                            ? 'border-foreground ring-2 ring-foreground/20 scale-110' 
                            : 'border-transparent hover:scale-105'
                        )}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {settings.appearance.accentColor.charAt(0).toUpperCase() + settings.appearance.accentColor.slice(1)}
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
                  <Switch 
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(v) => settings.updateAppearance({ compactMode: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Avatars</p>
                    <p className="text-sm text-muted-foreground">
                      Display user avatars throughout the platform
                    </p>
                  </div>
                  <Switch 
                    checked={settings.appearance.showAvatars}
                    onCheckedChange={(v) => settings.updateAppearance({ showAvatars: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
