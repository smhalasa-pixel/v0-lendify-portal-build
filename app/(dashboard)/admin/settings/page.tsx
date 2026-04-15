'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettings, masterWidgetList } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Shield,
  Building2,
  LayoutGrid,
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
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
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

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const settings = useSettings()
  const [saved, setSaved] = React.useState<string | null>(null)

  // System settings local state
  const [companyName, setCompanyName] = React.useState(settings.system.companyName)
  const [supportEmail, setSupportEmail] = React.useState(settings.system.supportEmail)
  const [fiscalYearStart, setFiscalYearStart] = React.useState(settings.system.fiscalYearStart)
  const [demoMode, setDemoMode] = React.useState(settings.system.demoMode)
  const [maintenanceMode, setMaintenanceMode] = React.useState(settings.system.maintenanceMode)

  // Sync local state when settings change
  React.useEffect(() => {
    setCompanyName(settings.system.companyName)
    setSupportEmail(settings.system.supportEmail)
    setFiscalYearStart(settings.system.fiscalYearStart)
    setDemoMode(settings.system.demoMode)
    setMaintenanceMode(settings.system.maintenanceMode)
  }, [settings.system])

  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              System settings are only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show saved indicator
  const showSaved = (section: string) => {
    setSaved(section)
    setTimeout(() => setSaved(null), 1500)
  }

  // Toggle system widget
  const toggleSystemWidget = (widgetId: string) => {
    const current = settings.systemWidgets.find(w => w.id === widgetId)
    settings.updateSystemWidget(widgetId, !current?.enabled)
    showSaved('widgets')
  }

  // Reset all system widgets
  const resetSystemWidgets = () => {
    settings.resetSystemWidgets()
    showSaved('widgets')
  }

  // Save system settings
  const saveSystemSettings = () => {
    settings.updateSystem({
      companyName,
      supportEmail,
      fiscalYearStart,
      demoMode,
      maintenanceMode,
    })
    showSaved('system')
  }

  // Group widgets by category
  const widgetsByCategory = {
    metrics: masterWidgetList.filter(w => w.category === 'metrics'),
    charts: masterWidgetList.filter(w => w.category === 'charts'),
    sidebar: masterWidgetList.filter(w => w.category === 'sidebar'),
    tables: masterWidgetList.filter(w => w.category === 'tables'),
  }

  const categoryInfo = {
    metrics: { title: 'KPI Metrics', description: 'Performance indicators', icon: BarChart3 },
    charts: { title: 'Charts', description: 'Visual charts and graphs', icon: LineChart },
    sidebar: { title: 'Sidebar Widgets', description: 'Right column widgets', icon: LayoutGrid },
    tables: { title: 'Data Tables', description: 'Performance tables', icon: Table },
  }

  // Count enabled/disabled
  const enabledCount = settings.systemWidgets.filter(w => w.enabled).length
  const totalCount = settings.systemWidgets.length

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings for all users</p>
      </div>

      <Tabs defaultValue="widgets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="widgets" className="gap-2">
            <LayoutGrid className="size-4" />
            Dashboard Widgets
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="size-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Widget Availability */}
        <TabsContent value="widgets" className="space-y-4">
          {/* Info Banner */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex gap-3">
              <Shield className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">System-Wide Widget Control</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Widgets you disable here will be hidden for ALL users. Users cannot enable widgets you have disabled.
                  This is useful for hiding metrics or features that are not relevant to your organization.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{enabledCount} of {totalCount} widgets enabled</p>
              <p className="text-xs text-muted-foreground">Click to enable/disable for all users</p>
            </div>
            <div className="flex items-center gap-2">
              {saved === 'widgets' && (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <Check className="size-4" /> Saved
                </span>
              )}
              <Button variant="outline" size="sm" onClick={resetSystemWidgets}>
                <RotateCcw className="size-4 mr-2" />
                Enable All
              </Button>
            </div>
          </div>

          {Object.entries(widgetsByCategory).map(([category, widgets]) => {
            const info = categoryInfo[category as keyof typeof categoryInfo]
            const CategoryIcon = info.icon
            const categoryWidgets = widgets.map(w => ({
              ...w,
              enabled: settings.systemWidgets.find(sw => sw.id === w.id)?.enabled ?? true
            }))
            const categoryEnabled = categoryWidgets.filter(w => w.enabled).length

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CategoryIcon className="size-4 text-primary" />
                      {info.title}
                    </CardTitle>
                    <Badge variant={categoryEnabled === widgets.length ? "default" : "secondary"}>
                      {categoryEnabled}/{widgets.length} enabled
                    </Badge>
                  </div>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryWidgets.map(widget => {
                      const Icon = iconMap[widget.icon] || BarChart3

                      return (
                        <button
                          key={widget.id}
                          onClick={() => toggleSystemWidget(widget.id)}
                          className={cn(
                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                            widget.enabled
                              ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/15"
                              : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                          )}
                        >
                          {/* Status indicator */}
                          <div className={cn(
                            "absolute top-2 right-2 size-5 rounded-full flex items-center justify-center",
                            widget.enabled ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          )}>
                            {widget.enabled ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                          </div>

                          {/* Icon */}
                          <div className={cn(
                            "size-10 rounded-lg flex items-center justify-center",
                            widget.enabled 
                              ? "bg-green-500/20 text-green-600" 
                              : "bg-red-500/10 text-red-400"
                          )}>
                            <Icon className="size-5" />
                          </div>

                          {/* Name */}
                          <div>
                            <p className={cn(
                              "font-medium text-sm",
                              widget.enabled ? "text-foreground" : "text-muted-foreground line-through"
                            )}>
                              {widget.name}
                            </p>
                            <p className={cn(
                              "text-[10px] mt-0.5",
                              widget.enabled ? "text-green-600" : "text-red-400"
                            )}>
                              {widget.enabled ? "Available to all" : "Hidden from all"}
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

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year Start</Label>
                <Select value={fiscalYearStart} onValueChange={(v) => setFiscalYearStart(v as typeof fiscalYearStart)}>
                  <SelectTrigger className="w-48">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Modes</CardTitle>
              <CardDescription>Control system behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Demo Mode</Label>
                  <p className="text-sm text-muted-foreground">Use mock data for demonstration</p>
                </div>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <Label className="flex items-center gap-2">
                      Maintenance Mode
                      {maintenanceMode && <Badge variant="destructive" className="text-[10px]">Active</Badge>}
                    </Label>
                    <p className="text-sm text-muted-foreground">Only admins can access the system</p>
                  </div>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              {maintenanceMode && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="size-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Maintenance mode is active. Non-admin users cannot access the system.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            {saved === 'system' && (
              <span className="text-sm text-green-500 flex items-center gap-1 mr-2">
                <Check className="size-4" /> Saved
              </span>
            )}
            <Button onClick={saveSystemSettings}>
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
