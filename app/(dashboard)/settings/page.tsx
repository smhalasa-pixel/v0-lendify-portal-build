'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettings, masterWidgetList } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Bell,
  Palette,
  RotateCcw,
  TrendingUp,
  BarChart3,
  Target,
  Calculator,
  Users,
  DollarSign,
  LineChart,
  Search,
  Megaphone,
  Table,
  PieChart,
  Lock,
  Check,
} from 'lucide-react'

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  BarChart3,
  Target,
  Calculator,
  Users,
  DollarSign,
  LineChart,
  Search,
  Megaphone,
  Table,
  PieChart,
}

export default function UserSettingsPage() {
  const { user } = useAuth()
  const settings = useSettings()
  const [saved, setSaved] = React.useState<string | null>(null)

  // Get user's current widget states (already merged with system settings)
  const userWidgets = user?.id ? settings.getWidgetsForUser(user.id) : []
  const notifications = user?.id ? settings.getNotificationsForUser(user.id) : null
  const appearance = user?.id ? settings.getAppearanceForUser(user.id) : null

  // Check if widget is disabled system-wide
  const isSystemDisabled = (widgetId: string) => !settings.isWidgetAvailableSystemWide(widgetId)

  // Toggle widget
  const toggleWidget = (widgetId: string) => {
    if (!user?.id || isSystemDisabled(widgetId)) return
    const current = userWidgets.find(w => w.id === widgetId)
    settings.updateUserWidget(user.id, widgetId, !current?.enabled)
    showSaved('layout')
  }

  // Reset layout
  const resetLayout = () => {
    if (!user?.id) return
    settings.resetUserWidgets(user.id)
    showSaved('layout')
  }

  // Toggle notification
  const toggleNotification = (key: string) => {
    if (!user?.id || !notifications) return
    const typedKey = key as keyof typeof notifications
    settings.updateNotificationForUser(user.id, typedKey, !notifications[typedKey])
    showSaved('notifications')
  }

  // Update appearance
  const updateAppearance = (key: string, value: string | boolean) => {
    if (!user?.id) return
    settings.updateAppearanceForUser(user.id, key as keyof NonNullable<typeof appearance>, value as never)
    showSaved('appearance')
  }

  // Show saved indicator
  const showSaved = (section: string) => {
    setSaved(section)
    setTimeout(() => setSaved(null), 1500)
  }

  // Group widgets by category
  const widgetsByCategory = {
    metrics: masterWidgetList.filter(w => w.category === 'metrics'),
    charts: masterWidgetList.filter(w => w.category === 'charts'),
    sidebar: masterWidgetList.filter(w => w.category === 'sidebar'),
    tables: masterWidgetList.filter(w => w.category === 'tables'),
  }

  const categoryInfo = {
    metrics: { title: 'KPI Metrics', description: 'Performance indicators at the top of your dashboard', icon: BarChart3 },
    charts: { title: 'Charts', description: 'Visual charts and graphs', icon: LineChart },
    sidebar: { title: 'Sidebar Widgets', description: 'Tools and info in the right column', icon: LayoutGrid },
    tables: { title: 'Data Tables', description: 'Performance tables at the bottom', icon: Table },
  }

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
        <p className="text-muted-foreground">Customize your dashboard and preferences</p>
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="size-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="size-4" />
            Display
          </TabsTrigger>
        </TabsList>

        {/* Layout Builder */}
        <TabsContent value="layout" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Click any card to show or hide it on your dashboard
            </p>
            <div className="flex items-center gap-2">
              {saved === 'layout' && (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <Check className="size-4" /> Saved
                </span>
              )}
              <Button variant="outline" size="sm" onClick={resetLayout}>
                <RotateCcw className="size-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {Object.entries(widgetsByCategory).map(([category, widgets]) => {
            const info = categoryInfo[category as keyof typeof categoryInfo]
            const CategoryIcon = info.icon
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CategoryIcon className="size-4 text-primary" />
                    {info.title}
                  </CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {widgets.map(widget => {
                      const userWidget = userWidgets.find(w => w.id === widget.id)
                      const isEnabled = userWidget?.enabled ?? false
                      const isLocked = isSystemDisabled(widget.id)
                      const Icon = iconMap[widget.icon] || BarChart3

                      return (
                        <button
                          key={widget.id}
                          onClick={() => !isLocked && toggleWidget(widget.id)}
                          disabled={isLocked}
                          className={cn(
                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                            isLocked 
                              ? "border-border/50 bg-muted/20 opacity-50 cursor-not-allowed"
                              : isEnabled
                                ? "border-primary bg-primary/10 hover:bg-primary/15"
                                : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          {/* Status indicator */}
                          {isLocked ? (
                            <div className="absolute top-2 right-2">
                              <Lock className="size-3 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className={cn(
                              "absolute top-2 right-2 size-2.5 rounded-full",
                              isEnabled ? "bg-green-500" : "bg-muted-foreground/30"
                            )} />
                          )}

                          {/* Icon */}
                          <div className={cn(
                            "size-10 rounded-lg flex items-center justify-center",
                            isLocked 
                              ? "bg-muted text-muted-foreground"
                              : isEnabled 
                                ? "bg-primary/20 text-primary" 
                                : "bg-muted text-muted-foreground"
                          )}>
                            <Icon className="size-5" />
                          </div>

                          {/* Name */}
                          <div>
                            <p className={cn(
                              "font-medium text-sm",
                              isLocked ? "text-muted-foreground" : isEnabled ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {widget.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {isLocked ? "Disabled by admin" : isEnabled ? "Visible" : "Hidden"}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-end">
            {saved === 'notifications' && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <Check className="size-4" /> Saved
              </span>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose which emails you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailCommissionEarned', label: 'Commission Earned', desc: 'When you earn a commission' },
                { key: 'emailClawbackAlert', label: 'Clawback Alerts', desc: 'About potential clawbacks' },
                { key: 'emailNewAnnouncement', label: 'New Announcements', desc: 'Company announcements' },
                { key: 'emailWeeklySummary', label: 'Weekly Summary', desc: 'Weekly performance summary' },
              ].map((item, i) => (
                <React.Fragment key={item.key}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications?.[item.key as keyof typeof notifications] ?? false}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Real-time notifications within the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'inAppPipelineUpdates', label: 'Pipeline Updates', desc: 'Pipeline changes' },
                { key: 'inAppLeaderboardChanges', label: 'Leaderboard Changes', desc: 'Ranking changes' },
                { key: 'inAppKnowledgeBaseUpdates', label: 'Knowledge Base Updates', desc: 'New articles' },
              ].map((item, i) => (
                <React.Fragment key={item.key}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{item.label}</Label>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications?.[item.key as keyof typeof notifications] ?? false}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4">
          <div className="flex justify-end">
            {saved === 'appearance' && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <Check className="size-4" /> Saved
              </span>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your color scheme</CardDescription>
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
              <CardDescription>Choose your accent color</CardDescription>
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
                      "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      appearance?.accentColor === accent.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("size-6 rounded-full", accent.color)} />
                    <span className="text-xs font-medium">{accent.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Customize the display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing</p>
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
                  <p className="text-sm text-muted-foreground">Display user avatars</p>
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
