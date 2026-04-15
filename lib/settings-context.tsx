'use client'

import * as React from 'react'
import type { UserRole } from './types'

// Dashboard widget definitions - must match actual dashboard sections
export interface DashboardWidget {
  id: string
  name: string
  description: string
  enabled: boolean
  order: number
  category: 'metrics' | 'charts' | 'tables' | 'other'
}

// Default widgets configuration for each role
const defaultWidgets: DashboardWidget[] = [
  // Metrics
  { id: 'kpi-submissions', name: 'Submissions KPIs', description: 'Units Submitted, Debt Submitted, Conv. Rate', enabled: true, order: 1, category: 'metrics' },
  { id: 'kpi-enrolled', name: 'Enrolled KPIs (Highlighted)', description: 'Units Enrolled, Debt Enrolled, Qual. Conv.', enabled: true, order: 2, category: 'metrics' },
  { id: 'kpi-fpc', name: 'FPC & Ancillary KPIs', description: 'Units FPC, Debt FPC, Ancillary Sales', enabled: true, order: 3, category: 'metrics' },
  { id: 'kpi-averages', name: 'Averages KPIs', description: 'Avg Daily Units, Avg Daily Debt, Avg Debt/File', enabled: true, order: 4, category: 'metrics' },
  { id: 'kpi-clients', name: 'Client KPIs', description: 'Clients Enrolled, Active, Cancelled, Cancellation %', enabled: true, order: 5, category: 'metrics' },
  { id: 'kpi-epf', name: 'EPF KPIs (Executive)', description: 'EPFs Collected, EPFs Scheduled', enabled: true, order: 6, category: 'metrics' },
  
  // Charts
  { id: 'volume-chart', name: 'Volume Chart', description: 'Interactive volume trends over time', enabled: true, order: 7, category: 'charts' },
  
  // Right column
  { id: 'monthly-targets', name: 'Monthly Targets', description: 'Progress towards monthly goals', enabled: true, order: 8, category: 'other' },
  { id: 'client-search', name: 'Client Search', description: 'Quick client lookup tool', enabled: true, order: 9, category: 'other' },
  { id: 'announcements', name: 'Announcements', description: 'Company announcements feed', enabled: true, order: 10, category: 'other' },
  
  // Tables
  { id: 'performance-tables', name: 'Performance Tables', description: 'Teams/Agents performance data', enabled: true, order: 11, category: 'tables' },
  { id: 'lead-source-table', name: 'Lead Source Performance', description: 'Lead source metrics (Admin only)', enabled: true, order: 12, category: 'tables' },
]

// Notification settings
export interface NotificationSettings {
  // Email notifications
  emailCommissionEarned: boolean
  emailClawbackAlert: boolean
  emailNewAnnouncement: boolean
  emailWeeklySummary: boolean
  // In-app notifications
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

// General settings
export interface GeneralSettings {
  companyName: string
  supportEmail: string
  fiscalYearStart: 'january' | 'april' | 'july' | 'october'
  demoMode: boolean
  maintenanceMode: boolean
}

const defaultGeneralSettings: GeneralSettings = {
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

// Layout configuration per role
export interface RoleLayoutConfig {
  role: UserRole
  widgets: DashboardWidget[]
}

interface SettingsContextType {
  // Layout
  getWidgetsForRole: (role: UserRole) => DashboardWidget[]
  updateWidgetsForRole: (role: UserRole, widgets: DashboardWidget[]) => void
  resetWidgetsForRole: (role: UserRole) => void
  
  // Notifications
  notifications: NotificationSettings
  updateNotifications: (settings: Partial<NotificationSettings>) => void
  
  // General
  general: GeneralSettings
  updateGeneral: (settings: Partial<GeneralSettings>) => void
  
  // Appearance
  appearance: AppearanceSettings
  updateAppearance: (settings: Partial<AppearanceSettings>) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Role-specific layouts
  const [roleLayouts, setRoleLayouts] = React.useState<Record<UserRole, DashboardWidget[]>>({
    agent: [...defaultWidgets],
    leadership: [...defaultWidgets],
    supervisor: [...defaultWidgets],
    executive: [...defaultWidgets],
    admin: [...defaultWidgets],
  })
  
  const [notifications, setNotifications] = React.useState<NotificationSettings>(defaultNotifications)
  const [general, setGeneral] = React.useState<GeneralSettings>(defaultGeneralSettings)
  const [appearance, setAppearance] = React.useState<AppearanceSettings>(defaultAppearanceSettings)

  const getWidgetsForRole = React.useCallback((role: UserRole): DashboardWidget[] => {
    return roleLayouts[role] || defaultWidgets
  }, [roleLayouts])

  const updateWidgetsForRole = React.useCallback((role: UserRole, widgets: DashboardWidget[]) => {
    setRoleLayouts(prev => ({
      ...prev,
      [role]: widgets,
    }))
  }, [])

  const resetWidgetsForRole = React.useCallback((role: UserRole) => {
    setRoleLayouts(prev => ({
      ...prev,
      [role]: [...defaultWidgets],
    }))
  }, [])

  const updateNotifications = React.useCallback((settings: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...settings }))
  }, [])

  const updateGeneral = React.useCallback((settings: Partial<GeneralSettings>) => {
    setGeneral(prev => ({ ...prev, ...settings }))
  }, [])

  const updateAppearance = React.useCallback((settings: Partial<AppearanceSettings>) => {
    setAppearance(prev => ({ ...prev, ...settings }))
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        getWidgetsForRole,
        updateWidgetsForRole,
        resetWidgetsForRole,
        notifications,
        updateNotifications,
        general,
        updateGeneral,
        appearance,
        updateAppearance,
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

// Export default widgets for reference
export { defaultWidgets }
