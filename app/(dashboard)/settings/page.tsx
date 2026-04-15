'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettings, defaultWidgets, type DashboardWidget } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Bell,
  Palette,
  RotateCcw,
  Save,
  Check,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Search,
  Megaphone,
  Table,
  PieChart,
} from 'lucide-react'

// Widget card component with visual icon
function WidgetCard({ 
  widget, 
  onToggle,
  icon: Icon,
}: { 
  widget: DashboardWidget
  onToggle: () => void
  icon: React.ElementType
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
        "hover:scale-[1.02] active:scale-[0.98]",
        widget.enabled
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-muted/30 opacity-60 hover:opacity-80"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute top-2 right-2 size-3 rounded-full transition-colors",
        widget.enabled ? "bg-green-500" : "bg-muted-foreground/30"
      )} />
      
      {/* Icon */}
      <div className={cn(
        "size-12 rounded-lg flex items-center justify-center transition-colors",
        widget.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="size-6" />
      </div>
      
      {/* Name */}
      <div>
        <p className={cn(
          "font-medium text-sm",
          widget.enabled ? "text-foreground" : "text-muted-foreground"
        )}>
          {widget.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {widget.enabled ? "Visible" : "Hidden"}
        </p>
      </div>
    </button>
  )
}

// Widget icons mapping
const widgetIcons: Record<string, React.ElementType> = {
  'kpi-submissions': TrendingUp,
  'kpi-enrolled': BarChart3,
  'kpi-fpc': Target,
  'kpi-averages': PieChart,
  'kpi-clients': Users,
  'kpi-epf': BarChart3,
  'volume-chart': BarChart3,
  'monthly-targets': Target,
  'client-search': Search,
  'announcements': Megaphone,
  'performance-tables': Table,
  'lead-source-table': Table,
}

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

  // Get widgets by section for easier display
  const kpiWidgets = widgets.filter(w => w.category === 'metrics')
  const chartWidgets = widgets.filter(w => w.category === 'charts')
  const sidebarWidgets = widgets.filter(w => w.category === 'other')
  const tableWidgets = widgets.filter(w => w.category === 'tables')

  // Count enabled widgets
  const enabledCount = widgets.filter(w => w.enabled).length
  const totalCount = widgets.length

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please log in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Click any widget to show or hide it on your dashboard
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {enabledCount} of {totalCount} widgets visible
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetLayout}>
                <RotateCcw className="size-4 mr-2" />
                Reset All
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
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* KPI Metrics Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                KPI Metrics
              </CardTitle>
              <CardDescription>
                Performance indicators displayed at the top of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {kpiWidgets.map(widget => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    onToggle={() => toggleWidget(widget.id)}
                    icon={widgetIcons[widget.id] || BarChart3}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="size-4 text-primary" />
                Charts
              </CardTitle>
              <CardDescription>
                Visual charts and graphs on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {chartWidgets.map(widget => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    onToggle={() => toggleWidget(widget.id)}
                    icon={widgetIcons[widget.id] || BarChart3}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Widgets Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutGrid className="size-4 text-primary" />
                Sidebar Widgets
              </CardTitle>
              <CardDescription>
                Widgets displayed in the right column of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sidebarWidgets.map(widget => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    onToggle={() => toggleWidget(widget.id)}
                    icon={widgetIcons[widget.id] || LayoutGrid}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Tables Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Table className="size-4 text-primary" />
                Data Tables
              </CardTitle>
              <CardDescription>
                Performance tables at the bottom of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tableWidgets.map(widget => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    onToggle={() => toggleWidget(widget.id)}
                    icon={widgetIcons[widget.id] || Table}
                  />
                ))}
              </div>
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
                      "p-4 rounded-xl border-2 transition-all text-center capitalize font-medium",
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
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      appearance?.accentColor === accent.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("size-8 rounded-full", accent.color)} />
                    <span className="text-sm font-medium">{accent.label}</span>
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
