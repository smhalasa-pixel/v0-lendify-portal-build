'use client'

import * as React from 'react'

// Dashboard widget definitions
export interface DashboardWidget {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
  category: 'metrics' | 'charts' | 'tables' | 'sidebar'
}

// Master widget list - defines all available widgets
export const masterWidgetList: Omit<DashboardWidget, 'enabled'>[] = [
  // Metrics
  { id: 'kpi-submissions', name: 'Submissions', description: 'Units Submitted, Debt Submitted, Conv. Rate', icon: 'TrendingUp', category: 'metrics' },
  { id: 'kpi-enrolled', name: 'Enrolled', description: 'Units Enrolled, Debt Enrolled, Qual. Conv.', icon: 'BarChart3', category: 'metrics' },
  { id: 'kpi-fpc', name: 'FPC & Ancillary', description: 'Units FPC, Debt FPC, Ancillary Sales', icon: 'Target', category: 'metrics' },
  { id: 'kpi-averages', name: 'Averages', description: 'Avg Daily Units, Avg Daily Debt, Avg Debt/File', icon: 'Calculator', category: 'metrics' },
  { id: 'kpi-clients', name: 'Clients', description: 'Clients Enrolled, Active, Cancelled, Cancellation %', icon: 'Users', category: 'metrics' },
  { id: 'kpi-epf', name: 'EPF Metrics', description: 'EPFs Collected, EPFs Scheduled', icon: 'DollarSign', category: 'metrics' },
  { id: 'kpi-qc-score', name: 'QC Score', description: 'Quality Control Score, Evaluations Count', icon: 'ClipboardCheck', category: 'metrics' },
  
  // Charts
  { id: 'volume-chart', name: 'Volume Chart', description: 'Interactive volume trends over time', icon: 'LineChart', category: 'charts' },
  
  // Sidebar
  { id: 'monthly-targets', name: 'Monthly Targets', description: 'Progress towards monthly goals', icon: 'Target', category: 'sidebar' },
  { id: 'client-search', name: 'Client Search', description: 'Quick client lookup tool', icon: 'Search', category: 'sidebar' },
  { id: 'announcements', name: 'Announcements', description: 'Company announcements feed', icon: 'Megaphone', category: 'sidebar' },
  
  // Tables
  { id: 'performance-tables', name: 'Performance Tables', description: 'Agent/Team performance data', icon: 'Table', category: 'tables' },
  { id: 'lead-source-table', name: 'Lead Source Table', description: 'Lead source metrics (Admin only)', icon: 'PieChart', category: 'tables' },
]

// Default all widgets enabled
const defaultEnabledWidgets = (): DashboardWidget[] => 
  masterWidgetList.map(w => ({ ...w, enabled: true }))

// Notification settings
export interface NotificationSettings {
  emailCommissionEarned: boolean
  emailClawbackAlert: boolean
  emailNewAnnouncement: boolean
  emailWeeklySummary: boolean
  inAppPipelineUpdates: boolean
  inAppLeaderboardChanges: boolean
  inAppKnowledgeBaseUpdates: boolean
}

const defaultNotifications: NotificationSettings = {
  emailCommissionEarned: true,
  emailClawbackAlert: true,
  emailNewAnnouncement: false,
  emailWeeklySummary: false,
  inAppPipelineUpdates: true,
  inAppLeaderboardChanges: true,
  inAppKnowledgeBaseUpdates: true,
}

// System settings (admin only)
export interface SystemSettings {
  companyName: string
  supportEmail: string
  fiscalYearStart: 'january' | 'april' | 'july' | 'october'
  demoMode: boolean
  maintenanceMode: boolean
}

const defaultSystemSettings: SystemSettings = {
  companyName: 'Lendify Associates',
  supportEmail: 'support@lendify.com',
  fiscalYearStart: 'january',
  demoMode: true,
  maintenanceMode: false,
}

// Appearance settings
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: 'gold' | 'emerald' | 'blue' | 'purple'
  compactMode: boolean
  showAvatars: boolean
}

const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'dark',
  accentColor: 'gold',
  compactMode: false,
  showAvatars: true,
}

// User preferences
interface UserPreferences {
  widgets: DashboardWidget[]
  notifications: NotificationSettings
  appearance: AppearanceSettings
}

interface SettingsContextType {
  // System-wide widget availability (admin controls this)
  systemWidgets: DashboardWidget[]
  updateSystemWidget: (widgetId: string, enabled: boolean) => void
  resetSystemWidgets: () => void
  isWidgetAvailableSystemWide: (widgetId: string) => boolean
  
  // User-specific preferences (respects system settings)
  getWidgetsForUser: (userId: string) => DashboardWidget[]
  updateUserWidget: (userId: string, widgetId: string, enabled: boolean) => void
  resetUserWidgets: (userId: string) => void
  
  // User notifications
  getNotificationsForUser: (userId: string) => NotificationSettings
  updateNotificationForUser: (userId: string, key: keyof NotificationSettings, value: boolean) => void
  
  // User appearance
  getAppearanceForUser: (userId: string) => AppearanceSettings
  updateAppearanceForUser: (userId: string, key: keyof AppearanceSettings, value: AppearanceSettings[keyof AppearanceSettings]) => void
  
  // System settings
  system: SystemSettings
  updateSystem: (settings: Partial<SystemSettings>) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // System-wide widget availability (admin controls)
  const [systemWidgets, setSystemWidgets] = React.useState<DashboardWidget[]>(defaultEnabledWidgets())
  
  // User preferences (keyed by userId)
  const [userPreferences, setUserPreferences] = React.useState<Record<string, UserPreferences>>({})
  
  // System settings
  const [system, setSystem] = React.useState<SystemSettings>(defaultSystemSettings)

  // Check if widget is available system-wide
  const isWidgetAvailableSystemWide = React.useCallback((widgetId: string): boolean => {
    const widget = systemWidgets.find(w => w.id === widgetId)
    return widget?.enabled ?? false
  }, [systemWidgets])

  // Update system widget (admin)
  const updateSystemWidget = React.useCallback((widgetId: string, enabled: boolean) => {
    setSystemWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, enabled } : w
    ))
  }, [])

  // Reset system widgets to all enabled
  const resetSystemWidgets = React.useCallback(() => {
    setSystemWidgets(defaultEnabledWidgets())
  }, [])

  // Get widgets for user (respects system settings)
  const getWidgetsForUser = React.useCallback((userId: string): DashboardWidget[] => {
    const userWidgets = userPreferences[userId]?.widgets || defaultEnabledWidgets()
    
    // Merge with system settings - if system disables a widget, user can't see it
    return userWidgets.map(uw => {
      const systemWidget = systemWidgets.find(sw => sw.id === uw.id)
      // Widget is only enabled if BOTH system and user have it enabled
      return {
        ...uw,
        enabled: (systemWidget?.enabled ?? false) && uw.enabled
      }
    })
  }, [userPreferences, systemWidgets])

  // Update user widget preference
  const updateUserWidget = React.useCallback((userId: string, widgetId: string, enabled: boolean) => {
    setUserPreferences(prev => {
      const current = prev[userId] || {
        widgets: defaultEnabledWidgets(),
        notifications: { ...defaultNotifications },
        appearance: { ...defaultAppearanceSettings },
      }
      return {
        ...prev,
        [userId]: {
          ...current,
          widgets: current.widgets.map(w => 
            w.id === widgetId ? { ...w, enabled } : w
          ),
        },
      }
    })
  }, [])

  // Reset user widgets
  const resetUserWidgets = React.useCallback((userId: string) => {
    setUserPreferences(prev => {
      const current = prev[userId]
      if (!current) return prev
      return {
        ...prev,
        [userId]: {
          ...current,
          widgets: defaultEnabledWidgets(),
        },
      }
    })
  }, [])

  // Get notifications for user
  const getNotificationsForUser = React.useCallback((userId: string): NotificationSettings => {
    return userPreferences[userId]?.notifications || { ...defaultNotifications }
  }, [userPreferences])

  // Update notification for user
  const updateNotificationForUser = React.useCallback((userId: string, key: keyof NotificationSettings, value: boolean) => {
    setUserPreferences(prev => {
      const current = prev[userId] || {
        widgets: defaultEnabledWidgets(),
        notifications: { ...defaultNotifications },
        appearance: { ...defaultAppearanceSettings },
      }
      return {
        ...prev,
        [userId]: {
          ...current,
          notifications: {
            ...current.notifications,
            [key]: value,
          },
        },
      }
    })
  }, [])

  // Get appearance for user
  const getAppearanceForUser = React.useCallback((userId: string): AppearanceSettings => {
    return userPreferences[userId]?.appearance || { ...defaultAppearanceSettings }
  }, [userPreferences])

  // Update appearance for user
  const updateAppearanceForUser = React.useCallback((
    userId: string, 
    key: keyof AppearanceSettings, 
    value: AppearanceSettings[keyof AppearanceSettings]
  ) => {
    setUserPreferences(prev => {
      const current = prev[userId] || {
        widgets: defaultEnabledWidgets(),
        notifications: { ...defaultNotifications },
        appearance: { ...defaultAppearanceSettings },
      }
      return {
        ...prev,
        [userId]: {
          ...current,
          appearance: {
            ...current.appearance,
            [key]: value,
          },
        },
      }
    })
  }, [])

  // Update system settings
  const updateSystem = React.useCallback((settings: Partial<SystemSettings>) => {
    setSystem(prev => ({ ...prev, ...settings }))
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        systemWidgets,
        updateSystemWidget,
        resetSystemWidgets,
        isWidgetAvailableSystemWide,
        getWidgetsForUser,
        updateUserWidget,
        resetUserWidgets,
        getNotificationsForUser,
        updateNotificationForUser,
        getAppearanceForUser,
        updateAppearanceForUser,
        system,
        updateSystem,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = React.useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
