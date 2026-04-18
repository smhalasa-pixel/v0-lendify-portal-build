// Lendify Portal Types

export type UserRole = 'agent' | 'leadership' | 'supervisor' | 'executive' | 'admin' | 'qa_senior' | 'qa_analyst' | 'qa_trainer' | 'rta'

export type Region = 'dubai' | 'jordan'

// ==========================================
// BREAK & RTA SYSTEM TYPES
// ==========================================

export type AgentActivityStatus = 'active' | 'break' | 'restroom' | 'offline' | 'coaching'

export interface BreakSession {
  id: string
  agentId: string
  agentName: string
  teamId: string
  teamName: string
  statusType: AgentActivityStatus // break, restroom, or coaching
  startTime: string
  endTime?: string
  scheduledDuration: number // in minutes
  actualDuration?: number // in minutes
  isOvertime: boolean
  overtimeMinutes?: number
  approvedBy?: string // leadership/supervisor who approved extended break
  notes?: string
}

export interface AgentStatus {
  agentId: string
  agentName: string
  avatar?: string
  teamId: string
  teamName: string
  supervisorId?: string
  supervisorName?: string
  leaderId?: string
  leaderName?: string
  status: AgentActivityStatus
  currentBreak?: BreakSession
  lastStatusChange: string
  totalBreakTimeToday: number // in minutes
  scheduledBreakTime: number // in minutes (allowed per day)
  shiftstartTime: string
  shiftEndTime: string
  isInfraction: boolean
  infractionReason?: string
}

export interface RTAInfraction {
  id: string
  agentId: string
  agentName: string
  teamId: string
  teamName: string
  leaderId?: string
  leaderName?: string
  supervisorId?: string
  supervisorName?: string
  type: 'extended_break' | 'unauthorized_break' | 'excessive_breaks' | 'late_return' | 'early_logout' | 'missed_shift'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  breakSessionId?: string
  occurredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
  status: 'pending' | 'acknowledged' | 'resolved' | 'escalated'
  notifiedLeadership: boolean
  notifiedAt?: string
}

export interface RTANotification {
  id: string
  infractionId: string
  recipientId: string
  recipientName: string
  recipientRole: UserRole
  message: string
  sentAt: string
  readAt?: string
  isRead: boolean
}

export const STATUS_DURATIONS: Record<AgentActivityStatus, number> = {
  active: 0,
  break: 60,
  restroom: 10,
  coaching: 30,
  offline: 0,
}

export const STATUS_LABELS: Record<AgentActivityStatus, string> = {
  active: 'Active',
  break: 'Break',
  restroom: 'Rest-Room',
  coaching: 'Coaching',
  offline: 'Offline',
}

export interface Team {
  id: string
  name: string
  leaderId?: string // Team lead (leadership role)
  leaderName?: string
  supervisorId?: string // Supervisor who oversees this team
  supervisorName?: string
  memberCount: number
  createdAt: string
}

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
  // QC Metrics
  avgQcScore: number
  avgQcScoreChange: number
  totalEvaluations: number
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
  qcScore: number // Quality Control score (0-100)
  qcScoreChange: number // Change from previous period
  qcGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  evaluationsCount: number // Number of QC evaluations this period
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

// Ticket System Types
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed'
export type TicketCategory = 'technical' | 'commission' | 'client' | 'hr' | 'other'

export interface TicketComment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  authorRole: UserRole
  content: string
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  createdById: string
  createdByName: string
  createdByRole: UserRole
  createdByTeamId?: string
  assignedToId?: string
  assignedToName?: string
  assignedToRole?: UserRole
  escalatedToId?: string
  escalatedToName?: string
  escalatedToRole?: UserRole
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  comments: TicketComment[]
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

// ==========================================
// QA SCORECARD SYSTEM TYPES
// ==========================================

export type ScorecardCategory = 'opening' | 'discovery' | 'presentation' | 'objection_handling' | 'closing' | 'compliance' | 'professionalism'

export type ScorecardType = 'opener' | 'closer' | 'account_manager'

export interface ScorecardCriterion {
  id: string
  name: string
  description: string
  category: ScorecardCategory
  maxPoints: number
  weight: number // Percentage weight (all weights in a scorecard should sum to 100)
  isRequired: boolean // If failed, automatic fail for entire scorecard
  isCritical: boolean // If failed, significant penalty
}

export interface ScorecardTemplate {
  id: string
  name: string
  description: string
  type: ScorecardType // opener, closer, or account_manager
  version: number
  isActive: boolean
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
  criteria: ScorecardCriterion[]
  passingScore: number // Minimum score to pass (e.g., 70)
  autoFailThreshold: number // Score below this = automatic fail (e.g., 50)
  categories: {
    category: ScorecardCategory
    weight: number
    criteria: string[] // criterion IDs
  }[]
}

export interface EvaluationScore {
  criterionId: string
  score: number // 0 to maxPoints
  notes?: string
  passed: boolean
}

export interface QAEvaluation {
  id: string
  scorecardTemplateId: string
  scorecardTemplateName: string
  agentId: string
  agentName: string
  agentTeamId: string
  agentTeamName: string
  evaluatorId: string
  evaluatorName: string
  evaluatorRole: UserRole
  // Call/Interaction Details
  callId?: string
  callDate: string
  callDuration?: number // in seconds
  callType: 'inbound' | 'outbound' | 'transfer' | 'callback'
  clientName?: string
  // Scoring
  scores: EvaluationScore[]
  totalScore: number // Weighted percentage (0-100)
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
  passed: boolean
  hasAutoFail: boolean
  autoFailReason?: string
  // Feedback
  strengths: string[]
  areasForImprovement: string[]
  coachingNotes?: string
  actionItems?: string[]
  // Status
  status: 'draft' | 'submitted' | 'acknowledged' | 'disputed' | 'resolved'
  acknowledgedAt?: string
  disputeReason?: string
  disputeResolution?: string
  // Timestamps
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export interface QAMetrics {
  totalEvaluations: number
  avgScore: number
  avgScoreChange: number
  passRate: number
  passRateChange: number
  autoFailRate: number
  topPerformers: { agentId: string; agentName: string; avgScore: number }[]
  needsCoaching: { agentId: string; agentName: string; avgScore: number }[]
  scoreDistribution: { grade: string; count: number; percentage: number }[]
  categoryScores: { category: ScorecardCategory; avgScore: number }[]
  trendData: { date: string; avgScore: number; evaluationCount: number }[]
}

// QA Analyst Workload Types
export interface QAAnalystWorkload {
  analystId: string
  analystName: string
  avatar: string
  role: 'qa_analyst' | 'qa_trainer' | 'qa_senior'
  // Workload metrics
  pendingAudits: number
  completedToday: number
  completedThisWeek: number
  completedThisMonth: number
  totalAssigned: number
  // Quality metrics
  avgScoreGiven: number
  calibrationScore: number // How aligned with team avg
  // SLA metrics
  avgTurnaroundHours: number
  slaTarget: number // hours
  slaComplianceRate: number // percentage
  overdueAudits: number
  // Targets
  dailyTarget: number
  weeklyTarget: number
  monthlyTarget: number
}

export interface QAAuditQueue {
  id: string
  callId: string
  callDate: string
  callDuration: number
  callType: 'inbound' | 'outbound' | 'transfer' | 'callback'
  agentId: string
  agentName: string
  agentTeamId: string
  agentTeamName: string
  assignedToId?: string
  assignedToName?: string
  priority: 'normal' | 'high' | 'urgent'
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  assignedAt?: string
  completedAt?: string
  clientName?: string
  reason?: string // Why this call was flagged for QA
}

export interface QASLAMetrics {
  totalPendingAudits: number
  overdueAudits: number
  dueTodayAudits: number
  avgTurnaroundTime: number // hours
  slaTarget: number // hours
  slaComplianceRate: number
  auditsByPriority: { priority: string; count: number }[]
  auditsByStatus: { status: string; count: number }[]
}
