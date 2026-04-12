// Lendify Portal Types

export type UserRole = 'agent' | 'leadership' | 'executive'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  teamId?: string
  teamName?: string
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
  teamName?: string
  debtLoadEnrolled: number
  unitsEnrolled: number
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
  // Conversion metrics
  conversionRate: number
  conversionRateChange: number
  qualifiedConversionRate: number
  qualifiedConversionRateChange: number
  // Financial metrics
  totalCommissions: number
  commissionsChange: number
  totalClawbacks: number
  clawbacksChange: number
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
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface PipelineLoan {
  id: string
  borrowerName: string
  loanAmount: number
  loanType: string
  status: 'lead' | 'application' | 'processing' | 'underwriting' | 'approved' | 'closing' | 'funded'
  expectedCloseDate: string
  agentId: string
  agentName: string
  createdDate: string
  lastActivity: string
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
