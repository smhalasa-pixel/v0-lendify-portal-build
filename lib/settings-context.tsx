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

// Default widgets configuration
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

// Appearance settings (per user)
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

// User-specific preferences
export interface UserPreferences {
  widgets: DashboardWidget[]
  notifications: NotificationSettings
  appearance: AppearanceSettings
}

interface SettingsContextType {
  // User-specific layout (per userId)
  getWidgetsForUser: (userId: string) => DashboardWidget[]
  updateWidgetsForUser: (userId: string, widgets: DashboardWidget[]) => void
  resetWidgetsForUser: (userId: string) => void
  
  // Legacy: role-based (for admin to set defaults per role)
  getDefaultWidgetsForRole: (role: UserRole) => DashboardWidget[]
  updateDefaultWidgetsForRole: (role: UserRole, widgets: DashboardWidget[]) => void
  
  // User-specific notifications
  getNotificationsForUser: (userId: string) => NotificationSettings
  updateNotificationsForUser: (userId: string, settings: Partial<NotificationSettings>) => void
  
  // User-specific appearance
  getAppearanceForUser: (userId: string) => AppearanceSettings
  updateAppearanceForUser: (userId: string, settings: Partial<AppearanceSettings>) => void
  
  // System settings (admin only)
  system: SystemSettings
  updateSystem: (settings: Partial<SystemSettings>) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // User-specific preferences (keyed by userId)
  const [userPreferences, setUserPreferences] = React.useState<Record<string, UserPreferences>>({})
  
  // Role-based defaults (admin can configure these)
  const [roleDefaults, setRoleDefaults] = React.useState<Record<UserRole, DashboardWidget[]>>({
    agent: [...defaultWidgets],
    leadership: [...defaultWidgets],
    supervisor: [...defaultWidgets],
    executive: [...defaultWidgets],
    admin: [...defaultWidgets],
  })
  
  // System settings
  const [system, setSystem] = React.useState<SystemSettings>(defaultSystemSettings)

  // Get widgets for a specific user
  const getWidgetsForUser = React.useCallback((userId: string): DashboardWidget[] => {
    return userPreferences[userId]?.widgets || [...defaultWidgets]
  }, [userPreferences])

  // Update widgets for a specific user
  const updateWidgetsForUser = React.useCallback((userId: string, widgets: DashboardWidget[]) => {
    setUserPreferences(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { 
          widgets: [...defaultWidgets], 
          notifications: { ...defaultNotifications },
          appearance: { ...defaultAppearanceSettings }
        }),
        widgets,
      },
    }))
  }, [])

  // Reset widgets for a specific user
  const resetWidgetsForUser = React.useCallback((userId: string) => {
    setUserPreferences(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { 
          widgets: [...defaultWidgets], 
          notifications: { ...defaultNotifications },
          appearance: { ...defaultAppearanceSettings }
        }),
        widgets: [...defaultWidgets],
      },
    }))
  }, [])

  // Get default widgets for a role (admin feature)
  const getDefaultWidgetsForRole = React.useCallback((role: UserRole): DashboardWidget[] => {
    return roleDefaults[role] || defaultWidgets
  }, [roleDefaults])

  // Update default widgets for a role (admin feature)
  const updateDefaultWidgetsForRole = React.useCallback((role: UserRole, widgets: DashboardWidget[]) => {
    setRoleDefaults(prev => ({
      ...prev,
      [role]: widgets,
    }))
  }, [])

  // Get notifications for a user
  const getNotificationsForUser = React.useCallback((userId: string): NotificationSettings => {
    return userPreferences[userId]?.notifications || { ...defaultNotifications }
  }, [userPreferences])

  // Update notifications for a user
  const updateNotificationsForUser = React.useCallback((userId: string, settings: Partial<NotificationSettings>) => {
    setUserPreferences(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { 
          widgets: [...defaultWidgets], 
          notifications: { ...defaultNotifications },
          appearance: { ...defaultAppearanceSettings }
        }),
        notifications: {
          ...(prev[userId]?.notifications || defaultNotifications),
          ...settings,
        },
      },
    }))
  }, [])

  // Get appearance for a user
  const getAppearanceForUser = React.useCallback((userId: string): AppearanceSettings => {
    return userPreferences[userId]?.appearance || { ...defaultAppearanceSettings }
  }, [userPreferences])

  // Update appearance for a user
  const updateAppearanceForUser = React.useCallback((userId: string, settings: Partial<AppearanceSettings>) => {
    setUserPreferences(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { 
          widgets: [...defaultWidgets], 
          notifications: { ...defaultNotifications },
          appearance: { ...defaultAppearanceSettings }
        }),
        appearance: {
          ...(prev[userId]?.appearance || defaultAppearanceSettings),
          ...settings,
        },
      },
    }))
  }, [])

  // Update system settings
  const updateSystem = React.useCallback((settings: Partial<SystemSettings>) => {
    setSystem(prev => ({ ...prev, ...settings }))
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        getWidgetsForUser,
        updateWidgetsForUser,
        resetWidgetsForUser,
        getDefaultWidgetsForRole,
        updateDefaultWidgetsForRole,
        getNotificationsForUser,
        updateNotificationsForUser,
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

// Export default widgets for reference
export { defaultWidgets }
