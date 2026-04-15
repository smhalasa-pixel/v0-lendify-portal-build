'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettings, defaultWidgets, type DashboardWidget } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Bell,
  Palette,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'

export default function UserSettingsPage() {
  const { user } = useAuth()
  const settings = useSettings()
  
  // Local state for user's widgets
  const [widgets, setWidgets] = React.useState<DashboardWidget[]>([])
  const [hasChanges, setHasChanges] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  // Load user's widgets on mount
  React.useEffect(() => {
    if (user?.id) {
      setWidgets(settings.getWidgetsForUser(user.id))
    }
  }, [user?.id, settings])

  // Notification settings
  const notifications = user?.id ? settings.getNotificationsForUser(user.id) : null
  
  // Appearance settings
  const appearance = user?.id ? settings.getAppearanceForUser(user.id) : null

  // Toggle widget
  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ))
    setHasChanges(true)
    setSaved(false)
  }

  // Move widget up
  const moveWidgetUp = (widgetId: string) => {
    const idx = widgets.findIndex(w => w.id === widgetId)
    if (idx > 0) {
      const newWidgets = [...widgets]
      const temp = newWidgets[idx - 1]
      newWidgets[idx - 1] = { ...newWidgets[idx], order: newWidgets[idx - 1].order }
      newWidgets[idx] = { ...temp, order: widgets[idx].order }
      setWidgets(newWidgets)
      setHasChanges(true)
      setSaved(false)
    }
  }

  // Move widget down
  const moveWidgetDown = (widgetId: string) => {
    const idx = widgets.findIndex(w => w.id === widgetId)
    if (idx < widgets.length - 1) {
      const newWidgets = [...widgets]
      const temp = newWidgets[idx + 1]
      newWidgets[idx + 1] = { ...newWidgets[idx], order: newWidgets[idx + 1].order }
      newWidgets[idx] = { ...temp, order: widgets[idx].order }
      setWidgets(newWidgets)
      setHasChanges(true)
      setSaved(false)
    }
  }

  // Save layout
  const saveLayout = () => {
    if (user?.id) {
      settings.updateWidgetsForUser(user.id, widgets)
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // Reset to defaults
  const resetLayout = () => {
    if (user?.id) {
      settings.resetWidgetsForUser(user.id)
      setWidgets([...defaultWidgets])
      setHasChanges(false)
    }
  }

  // Update notification
  const updateNotification = (key: string, value: boolean) => {
    if (user?.id) {
      settings.updateNotificationsForUser(user.id, { [key]: value })
    }
  }

  // Update appearance
  const updateAppearance = (key: string, value: string | boolean) => {
    if (user?.id) {
      settings.updateAppearanceForUser(user.id, { [key]: value })
    }
  }

  // Group widgets by category
  const widgetsByCategory = React.useMemo(() => {
    const grouped: Record<string, DashboardWidget[]> = {
      metrics: [],
      charts: [],
      other: [],
      tables: [],
    }
    widgets.forEach(w => {
      if (grouped[w.category]) {
        grouped[w.category].push(w)
      }
    })
    return grouped
  }, [widgets])

  const categoryLabels: Record<string, string> = {
    metrics: 'KPI Metrics',
    charts: 'Charts',
    other: 'Sidebar Widgets',
    tables: 'Data Tables',
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Settings</h1>
        <p className="text-muted-foreground">Personalize your dashboard and preferences</p>
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="size-4" />
            Layout
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

        {/* Layout Builder */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dashboard Layout</CardTitle>
                <CardDescription>
                  Customize which widgets appear on your dashboard and their order
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetLayout}>
                  <RotateCcw className="size-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  onClick={saveLayout} 
                  disabled={!hasChanges}
                  className={cn(saved && "bg-green-600 hover:bg-green-600")}
                >
                  {saved ? (
                    <>
                      <Check className="size-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                categoryWidgets.length > 0 && (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-2">
                      {categoryWidgets.map((widget, idx) => (
                        <div
                          key={widget.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            widget.enabled 
                              ? "bg-card border-border" 
                              : "bg-muted/30 border-border/50 opacity-60"
                          )}
                        >
                          <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{widget.name}</span>
                              {widget.id === 'kpi-epf' && (
                                <Badge variant="secondary" className="text-[10px]">Executive+</Badge>
                              )}
                              {widget.id === 'lead-source-table' && (
                                <Badge variant="secondary" className="text-[10px]">Admin</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {widget.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => moveWidgetUp(widget.id)}
                              disabled={idx === 0}
                            >
                              <ChevronUp className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => moveWidgetDown(widget.id)}
                              disabled={idx === categoryWidgets.length - 1}
                            >
                              <ChevronDown className="size-4" />
                            </Button>
                          </div>

                          <Button
                            variant={widget.enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleWidget(widget.id)}
                            className="w-20"
                          >
                            {widget.enabled ? (
                              <>
                                <Eye className="size-3 mr-1" />
                                Show
                              </>
                            ) : (
                              <>
                                <EyeOff className="size-3 mr-1" />
                                Hide
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose which emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Commission Earned</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you earn a commission</p>
                </div>
                <Switch
                  checked={notifications?.emailCommissionEarned ?? true}
                  onCheckedChange={(checked) => updateNotification('emailCommissionEarned', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clawback Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about potential clawbacks</p>
                </div>
                <Switch
                  checked={notifications?.emailClawbackAlert ?? true}
                  onCheckedChange={(checked) => updateNotification('emailClawbackAlert', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Announcements</Label>
                  <p className="text-sm text-muted-foreground">Get notified about company announcements</p>
                </div>
                <Switch
                  checked={notifications?.emailNewAnnouncement ?? false}
                  onCheckedChange={(checked) => updateNotification('emailNewAnnouncement', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly performance summary</p>
                </div>
                <Switch
                  checked={notifications?.emailWeeklySummary ?? false}
                  onCheckedChange={(checked) => updateNotification('emailWeeklySummary', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Control real-time notifications within the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Pipeline Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about pipeline changes</p>
                </div>
                <Switch
                  checked={notifications?.inAppPipelineUpdates ?? true}
                  onCheckedChange={(checked) => updateNotification('inAppPipelineUpdates', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Leaderboard Changes</Label>
                  <p className="text-sm text-muted-foreground">Get notified when rankings change</p>
                </div>
                <Switch
                  checked={notifications?.inAppLeaderboardChanges ?? true}
                  onCheckedChange={(checked) => updateNotification('inAppLeaderboardChanges', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Knowledge Base Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about new articles and updates</p>
                </div>
                <Switch
                  checked={notifications?.inAppKnowledgeBaseUpdates ?? true}
                  onCheckedChange={(checked) => updateNotification('inAppKnowledgeBaseUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateAppearance('theme', theme)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-center capitalize",
                      appearance?.theme === theme
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accent Color</CardTitle>
              <CardDescription>Choose your preferred accent color</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'gold', color: 'bg-yellow-500', label: 'Gold' },
                  { id: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
                  { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
                  { id: 'purple', color: 'bg-purple-500', label: 'Purple' },
                ].map((accent) => (
                  <button
                    key={accent.id}
                    onClick={() => updateAppearance('accentColor', accent.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                      appearance?.accentColor === accent.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("size-6 rounded-full", accent.color)} />
                    <span className="text-sm">{accent.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Customize the display of elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch
                  checked={appearance?.compactMode ?? false}
                  onCheckedChange={(checked) => updateAppearance('compactMode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Avatars</Label>
                  <p className="text-sm text-muted-foreground">Display user avatars in tables and lists</p>
                </div>
                <Switch
                  checked={appearance?.showAvatars ?? true}
                  onCheckedChange={(checked) => updateAppearance('showAvatars', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
