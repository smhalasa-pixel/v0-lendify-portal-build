// Lendify Portal Types

export type UserRole = 'agent' | 'leadership' | 'supervisor' | 'executive' | 'admin'

export type Region = 'dubai' | 'jordan'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  teamId?: string
  teamName?: string
  teamIds?: string[] // For supervisors who manage multiple teams
  teamNames?: string[] // Names of teams for supervisors
  region?: Region // Optional - for regional segregation
  hireDate: string
  status: 'active' | 'inactive' | 'pending'
}

export interface Commission {
  id: string
  loanId: string
  borrowerName: string
  loanAmount: number
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid' | 'clawback'
  fundedDate: string
  paidDate?: string
  agentId: string
  agentName: string
  loanType: 'conventional' | 'fha' | 'va' | 'jumbo' | 'refinance'
}

export interface Clawback {
  id: string
  originalCommissionId: string
  loanId: string
  borrowerName: string
  originalAmount: number
  clawbackAmount: number
  reason: string
  status: 'pending' | 'deducted' | 'disputed' | 'waived'
  createdDate: string
  resolvedDate?: string
  agentId: string
  agentName: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'general' | 'policy' | 'product' | 'training' | 'compliance'
  publishedDate: string
  expiresDate?: string
  authorId: string
  authorName: string
  isPinned: boolean
  readBy: string[]
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdDate: string
  updatedDate: string
  authorId: string
  authorName: string
  views: number
  helpful: number
}

export interface Script {
  id: string
  title: string
  scenario: string
  content: string
  category: 'objection' | 'closing' | 'discovery' | 'follow-up' | 'referral'
  tags: string[]
  createdDate: string
  updatedDate: string
  authorId: string
  authorName: string
  usageCount: number
  rating: number
}

export interface LeaderboardEntry {
  rank: number
  agentId: string
  agentName: string
  avatar?: string
  teamId?: string
  teamName?: string
  unitsClosed: number
  debtLoadEnrolled: number
  unitsEnrolled: number
  conversionRate: number
  performanceGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  totalCommissions: number
  previousRank?: number
  trend: 'up' | 'down' | 'same'
}

export interface DashboardMetrics {
  // Enrolled metrics (funded/closed)
  debtLoadEnrolled: number
  debtLoadEnrolledChange: number
  unitsEnrolled: number
  unitsEnrolledChange: number
  // Submitted metrics (in pipeline)
  debtLoadSubmitted: number
  debtLoadSubmittedChange: number
  unitsSubmitted: number
  unitsSubmittedChange: number
  // FPC (First Payment Cleared) metrics
  debtLoadFPC: number
  debtLoadFPCChange: number
  unitsFPC: number
  unitsFPCChange: number
  // Ancillary metrics
  ancillaryRevenue: number
  ancillaryRevenueChange: number
  ancillaryCount: number
  ancillaryCountChange: number
  // Average metrics
  avgDebtLoadPerFile: number
  avgDebtLoadPerFileChange: number
  // Daily averages
  avgDailyEnrolledDebt: number
  avgDailyEnrolledDebtChange: number
  avgDailyEnrolledUnits: number
  avgDailyEnrolledUnitsChange: number
  // Client metrics
  clientsEnrolled: number
  clientsEnrolledChange: number
  clientsActive: number
  clientsActiveChange: number
  clientsCancelled: number
  clientsCancelledChange: number
  cancellationRate: number
  cancellationRateChange: number
  // EPF metrics (Electronic Payment Form)
  epfsCollected: number
  epfsCollectedChange: number
  epfsScheduled: number
  epfsScheduledChange: number
  // Conversion metrics
  conversionRate: number
  conversionRateChange: number
  conversionClosed: number // numerator for conversion rate
  conversionAssigned: number // denominator for conversion rate
  qualifiedConversionRate: number
  qualifiedConversionRateChange: number
  qualifiedClosed: number // numerator for qualified conversion
  qualifiedAssigned: number // denominator for qualified conversion
  // Financial metrics
  totalCommissions: number
  commissionsChange: number
  totalClawbacks: number
  clawbacksChange: number
  // Tier metrics
  currentTier: number
  expectedTier: number
  expectedCommission: number
  // Monthly targets
  monthlyTargetUnits: number
  monthlyTargetDebtLoad: number
  unitsToTarget: number // progress percentage
  debtLoadToTarget: number // progress percentage
  // Legacy/additional metrics
  avgLoanSize: number
  avgLoanSizeChange: number
  pipelineValue: number
  pipelineChange: number
  closingRate: number
  closingRateChange: number
}

export interface TeamMetrics extends DashboardMetrics {
  teamId: string
  teamName: string
  memberCount: number
  topPerformer: string
  performanceGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  pacing: number
  pacingUnits: number
  pacingDebtLoad: number
  trend: 'up' | 'down' | 'same'
}

export interface AgentPerformance {
  agentId: string
  agentName: string
  avatar?: string
  teamId: string
  teamName: string
  unitsSubmitted: number
  debtLoadSubmitted: number
  unitsEnrolled: number
  debtLoadEnrolled: number
  conversionRate: number
  ancillaryCount: number // Ancillary sales count
  performanceGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  monthlyTargetUnits: number
  monthlyTargetDebtLoad: number
  pacing: number // overall percentage of target based on time elapsed
  pacingUnits: number // pacing percentage for units
  pacingDebtLoad: number // pacing percentage for debt load
  trend: 'up' | 'down' | 'same'
  callQueueTier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum' | 'titanium' | 'champion' // Call queue tier
  }

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface PipelineLoan {
  id: string
  clientId: string
  borrowerName: string
  loanAmount: number
  loanType: string
  status: 'lead' | 'application' | 'processing' | 'underwriting' | 'approved' | 'closing' | 'funded'
  expectedCloseDate: string
  firstPaymentDate?: string
  agentId: string
  agentName: string
  createdDate: string
  lastActivity: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  status: 'lead' | 'submitted' | 'enrolled' | 'active' | 'cancelled' | 'completed'
  debtLoad: number
  submittedDate?: string
  enrolledDate?: string
  firstPaymentDate?: string
  agentId: string
  agentName: string
  teamId: string
}

export interface DashboardWidget {
  id: string
  type: 'kpi' | 'chart' | 'table' | 'list'
  title: string
  size: 'small' | 'medium' | 'large'
  order: number
  visible: boolean
  roleAccess: UserRole[]
}

export interface DashboardLayout {
  widgets: DashboardWidget[]
  lastUpdated: string
}

export interface DateRange {
  from: Date
  to: Date
  preset?: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom'
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dueDate: string
  dueTime?: string
  createdDate: string
  completedDate?: string
  createdById: string
  createdByName: string
  // Assignment - can be to individual, team, or all (department-wide)
  assignmentType: 'individual' | 'team' | 'department'
  assignedToId?: string // User ID if individual
  assignedToName?: string // User name if individual
  assignedToTeamId?: string // Team ID if team
  assignedToTeamName?: string // Team name if team
  // Completion tracking for team/department tasks
  completedBy?: string[] // Array of user IDs who completed
  category: 'compliance' | 'training' | 'sales' | 'administrative' | 'other'
}
