'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettings, defaultWidgets, type DashboardWidget } from '@/lib/settings-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const settings = useSettings()
  
  // Selected role for layout defaults
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('agent')
  const [roleWidgets, setRoleWidgets] = React.useState<DashboardWidget[]>([])
  const [hasLayoutChanges, setHasLayoutChanges] = React.useState(false)
  const [layoutSaved, setLayoutSaved] = React.useState(false)

  // System settings local state
  const [companyName, setCompanyName] = React.useState(settings.system.companyName)
  const [supportEmail, setSupportEmail] = React.useState(settings.system.supportEmail)
  const [fiscalYearStart, setFiscalYearStart] = React.useState(settings.system.fiscalYearStart)
  const [demoMode, setDemoMode] = React.useState(settings.system.demoMode)
  const [maintenanceMode, setMaintenanceMode] = React.useState(settings.system.maintenanceMode)
  const [systemSaved, setSystemSaved] = React.useState(false)

  // Load role widgets when role changes
  React.useEffect(() => {
    setRoleWidgets([...settings.getDefaultWidgetsForRole(selectedRole)])
    setHasLayoutChanges(false)
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
              System settings are only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Toggle widget for role
  const toggleWidget = (widgetId: string) => {
    setRoleWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ))
    setHasLayoutChanges(true)
    setLayoutSaved(false)
  }

  // Move widget up
  const moveWidgetUp = (widgetId: string) => {
    const idx = roleWidgets.findIndex(w => w.id === widgetId)
    if (idx > 0) {
      const newWidgets = [...roleWidgets]
      const temp = newWidgets[idx - 1]
      newWidgets[idx - 1] = { ...newWidgets[idx], order: newWidgets[idx - 1].order }
      newWidgets[idx] = { ...temp, order: roleWidgets[idx].order }
      setRoleWidgets(newWidgets)
      setHasLayoutChanges(true)
      setLayoutSaved(false)
    }
  }

  // Move widget down
  const moveWidgetDown = (widgetId: string) => {
    const idx = roleWidgets.findIndex(w => w.id === widgetId)
    if (idx < roleWidgets.length - 1) {
      const newWidgets = [...roleWidgets]
      const temp = newWidgets[idx + 1]
      newWidgets[idx + 1] = { ...newWidgets[idx], order: newWidgets[idx + 1].order }
      newWidgets[idx] = { ...temp, order: roleWidgets[idx].order }
      setRoleWidgets(newWidgets)
      setHasLayoutChanges(true)
      setLayoutSaved(false)
    }
  }

  // Save role layout defaults
  const saveRoleLayout = () => {
    settings.updateDefaultWidgetsForRole(selectedRole, roleWidgets)
    setHasLayoutChanges(false)
    setLayoutSaved(true)
    setTimeout(() => setLayoutSaved(false), 2000)
  }

  // Reset role layout to defaults
  const resetRoleLayout = () => {
    setRoleWidgets([...defaultWidgets])
    setHasLayoutChanges(true)
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
    setSystemSaved(true)
    setTimeout(() => setSystemSaved(false), 2000)
  }

  // Group widgets by category
  const widgetsByCategory = React.useMemo(() => {
    const grouped: Record<string, DashboardWidget[]> = {
      metrics: [],
      charts: [],
      other: [],
      tables: [],
    }
    roleWidgets.forEach(w => {
      if (grouped[w.category]) {
        grouped[w.category].push(w)
      }
    })
    return grouped
  }, [roleWidgets])

  const categoryLabels: Record<string, string> = {
    metrics: 'KPI Metrics',
    charts: 'Charts',
    other: 'Sidebar Widgets',
    tables: 'Data Tables',
  }

  const roleLabels: Record<UserRole, string> = {
    agent: 'Agent',
    leadership: 'Team Lead',
    supervisor: 'Supervisor',
    executive: 'Executive',
    admin: 'Admin',
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and default layouts for roles</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="role-defaults" className="gap-2">
            <LayoutGrid className="size-4" />
            Role Defaults
          </TabsTrigger>
        </TabsList>

        {/* General System Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company settings used across the platform</CardDescription>
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
                <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
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
              <CardDescription>Control system behavior and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Demo Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the system uses mock data for demonstration
                  </p>
                </div>
                <Switch
                  checked={demoMode}
                  onCheckedChange={setDemoMode}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <Label className="flex items-center gap-2">
                      Maintenance Mode
                      {maintenanceMode && (
                        <Badge variant="destructive" className="text-[10px]">Active</Badge>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, only admins can access the system
                    </p>
                  </div>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
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

          <div className="flex justify-end">
            <Button onClick={saveSystemSettings}>
              {systemSaved ? (
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
        </TabsContent>

        {/* Role Default Layouts */}
        <TabsContent value="role-defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Default Dashboard Layout by Role</CardTitle>
                  <CardDescription>
                    Set default widget visibility for new users. Users can customize their own view in My Settings.
                  </CardDescription>
                </div>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <SelectItem key={role} value={role}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">
                  Editing defaults for: {roleLabels[selectedRole]}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetRoleLayout}>
                    <RotateCcw className="size-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={saveRoleLayout} 
                    disabled={!hasLayoutChanges}
                    className={cn(layoutSaved && "bg-green-600 hover:bg-green-600")}
                  >
                    {layoutSaved ? (
                      <>
                        <Check className="size-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save Defaults
                      </>
                    )}
                  </Button>
                </div>
              </div>

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

              <div className="rounded-lg border border-dashed p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  These are default settings for new users. Each user can customize their own layout in My Settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
