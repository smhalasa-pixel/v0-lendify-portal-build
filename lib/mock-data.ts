// Mock data service for Lendify Portal
// This service simulates API responses and can be easily swapped for real API calls

import type {
  User,
  Commission,
  Clawback,
  Announcement,
  KnowledgeArticle,
  Script,
  LeaderboardEntry,
  DashboardMetrics,
  TeamMetrics,
  ChartDataPoint,
  PipelineLoan,
  DashboardWidget,
  DashboardLayout,
} from './types'

// Helper functions
const randomId = () => Math.random().toString(36).substring(2, 15)
const randomDate = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'sarah.johnson@lendify.com',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'agent',
    teamId: 'team-1',
    teamName: 'West Coast Team',
    hireDate: '2022-03-15',
    status: 'active',
  },
  {
    id: 'user-2',
    email: 'michael.chen@lendify.com',
    name: 'Michael Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    role: 'leadership',
    teamId: 'team-1',
    teamName: 'West Coast Team',
    hireDate: '2020-01-10',
    status: 'active',
  },
  {
    id: 'user-3',
    email: 'jennifer.martinez@lendify.com',
    name: 'Jennifer Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    role: 'executive',
    teamId: undefined,
    teamName: undefined,
    hireDate: '2018-06-01',
    status: 'active',
  },
  {
    id: 'user-4',
    email: 'david.williams@lendify.com',
    name: 'David Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'agent',
    teamId: 'team-1',
    teamName: 'West Coast Team',
    hireDate: '2023-01-20',
    status: 'active',
  },
  {
    id: 'user-5',
    email: 'emily.brown@lendify.com',
    name: 'Emily Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    role: 'agent',
    teamId: 'team-2',
    teamName: 'East Coast Team',
    hireDate: '2021-09-05',
    status: 'active',
  },
  {
    id: 'user-6',
    email: 'james.taylor@lendify.com',
    name: 'James Taylor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    role: 'leadership',
    teamId: 'team-2',
    teamName: 'East Coast Team',
    hireDate: '2019-04-15',
    status: 'active',
  },
]

// Mock Commissions
export const mockCommissions: Commission[] = [
  {
    id: 'comm-1',
    loanId: 'LN-2024-001',
    borrowerName: 'Robert & Lisa Thompson',
    loanAmount: 485000,
    commissionRate: 0.0125,
    commissionAmount: 6062.50,
    status: 'paid',
    fundedDate: '2024-01-15',
    paidDate: '2024-02-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    loanType: 'conventional',
  },
  {
    id: 'comm-2',
    loanId: 'LN-2024-002',
    borrowerName: 'Marcus Johnson',
    loanAmount: 325000,
    commissionRate: 0.015,
    commissionAmount: 4875.00,
    status: 'approved',
    fundedDate: '2024-01-22',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    loanType: 'fha',
  },
  {
    id: 'comm-3',
    loanId: 'LN-2024-003',
    borrowerName: 'Jennifer & Michael Davis',
    loanAmount: 750000,
    commissionRate: 0.01,
    commissionAmount: 7500.00,
    status: 'pending',
    fundedDate: '2024-02-05',
    agentId: 'user-4',
    agentName: 'David Williams',
    loanType: 'jumbo',
  },
  {
    id: 'comm-4',
    loanId: 'LN-2024-004',
    borrowerName: 'Amanda Wilson',
    loanAmount: 280000,
    commissionRate: 0.0125,
    commissionAmount: 3500.00,
    status: 'paid',
    fundedDate: '2024-01-10',
    paidDate: '2024-01-25',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    loanType: 'va',
  },
  {
    id: 'comm-5',
    loanId: 'LN-2024-005',
    borrowerName: 'Christopher Lee',
    loanAmount: 420000,
    commissionRate: 0.0125,
    commissionAmount: 5250.00,
    status: 'clawback',
    fundedDate: '2023-12-01',
    paidDate: '2023-12-15',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    loanType: 'refinance',
  },
  {
    id: 'comm-6',
    loanId: 'LN-2024-006',
    borrowerName: 'Patricia & John Adams',
    loanAmount: 550000,
    commissionRate: 0.0125,
    commissionAmount: 6875.00,
    status: 'approved',
    fundedDate: '2024-02-10',
    agentId: 'user-4',
    agentName: 'David Williams',
    loanType: 'conventional',
  },
  {
    id: 'comm-7',
    loanId: 'LN-2024-007',
    borrowerName: 'Kevin & Maria Garcia',
    loanAmount: 395000,
    commissionRate: 0.015,
    commissionAmount: 5925.00,
    status: 'pending',
    fundedDate: '2024-02-12',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    loanType: 'fha',
  },
]

// Mock Clawbacks
export const mockClawbacks: Clawback[] = [
  {
    id: 'claw-1',
    originalCommissionId: 'comm-5',
    loanId: 'LN-2024-005',
    borrowerName: 'Christopher Lee',
    originalAmount: 5250.00,
    clawbackAmount: 5250.00,
    reason: 'Early payoff within 6 months',
    status: 'deducted',
    createdDate: '2024-02-01',
    resolvedDate: '2024-02-15',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
  },
  {
    id: 'claw-2',
    originalCommissionId: 'comm-old-1',
    loanId: 'LN-2023-089',
    borrowerName: 'Steven Wright',
    originalAmount: 4200.00,
    clawbackAmount: 2100.00,
    reason: 'Loan rescission - borrower exercised right to cancel',
    status: 'pending',
    createdDate: '2024-02-10',
    agentId: 'user-4',
    agentName: 'David Williams',
  },
  {
    id: 'claw-3',
    originalCommissionId: 'comm-old-2',
    loanId: 'LN-2023-102',
    borrowerName: 'Michelle Torres',
    originalAmount: 3800.00,
    clawbackAmount: 3800.00,
    reason: 'Loan default within 3 months',
    status: 'disputed',
    createdDate: '2024-01-25',
    agentId: 'user-5',
    agentName: 'Emily Brown',
  },
]

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Q1 2024 Commission Structure Updates',
    content: 'We are pleased to announce enhanced commission rates effective March 1st. Conventional loans will now earn 1.35% (up from 1.25%), and FHA/VA loans will remain at 1.5%. Additionally, we are introducing a new tier bonus for agents closing 10+ loans per month.',
    priority: 'high',
    category: 'policy',
    publishedDate: '2024-02-15',
    authorId: 'user-3',
    authorName: 'Jennifer Martinez',
    isPinned: true,
    readBy: ['user-1', 'user-2'],
  },
  {
    id: 'ann-2',
    title: 'New Compliance Training Required by March 31st',
    content: 'All loan officers must complete the updated TRID compliance training module by March 31st, 2024. This training covers recent regulatory changes and best practices. Access the training through the Knowledge Base.',
    priority: 'urgent',
    category: 'compliance',
    publishedDate: '2024-02-10',
    expiresDate: '2024-03-31',
    authorId: 'user-3',
    authorName: 'Jennifer Martinez',
    isPinned: true,
    readBy: ['user-1'],
  },
  {
    id: 'ann-3',
    title: 'Welcome New Team Members',
    content: 'Please join us in welcoming three new loan officers to the Lendify family: Alex Thompson (West Coast), Maria Santos (East Coast), and Ryan Park (Central). They will be completing onboarding this week.',
    priority: 'low',
    category: 'general',
    publishedDate: '2024-02-12',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    isPinned: false,
    readBy: ['user-1', 'user-4', 'user-5'],
  },
  {
    id: 'ann-4',
    title: 'New Jumbo Loan Product Launch',
    content: 'We are excited to introduce our new Jumbo Elite product with rates starting at Prime + 0.5%. This product is available for loan amounts up to $3M with flexible DTI requirements. Training materials are now available in the Knowledge Base.',
    priority: 'medium',
    category: 'product',
    publishedDate: '2024-02-08',
    authorId: 'user-3',
    authorName: 'Jennifer Martinez',
    isPinned: false,
    readBy: ['user-2', 'user-6'],
  },
  {
    id: 'ann-5',
    title: 'System Maintenance Scheduled for Sunday',
    content: 'The loan origination system will undergo scheduled maintenance this Sunday from 2:00 AM to 6:00 AM EST. Please plan accordingly and complete any urgent submissions before the maintenance window.',
    priority: 'medium',
    category: 'general',
    publishedDate: '2024-02-14',
    expiresDate: '2024-02-18',
    authorId: 'user-6',
    authorName: 'James Taylor',
    isPinned: false,
    readBy: [],
  },
]

// Mock Knowledge Articles
export const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'kb-1',
    title: 'Understanding FHA Loan Requirements',
    content: 'A comprehensive guide to FHA loan requirements including credit score minimums, down payment requirements, DTI ratios, and property standards...',
    category: 'Products',
    tags: ['FHA', 'Government Loans', 'First-Time Buyers'],
    createdDate: '2023-06-15',
    updatedDate: '2024-01-20',
    authorId: 'user-3',
    authorName: 'Jennifer Martinez',
    views: 1250,
    helpful: 89,
  },
  {
    id: 'kb-2',
    title: 'Commission Calculator Guide',
    content: 'Step-by-step instructions for using the commission calculator, understanding tier structures, and projecting earnings...',
    category: 'Tools',
    tags: ['Commission', 'Calculator', 'Earnings'],
    createdDate: '2023-08-01',
    updatedDate: '2024-02-01',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    views: 890,
    helpful: 67,
  },
  {
    id: 'kb-3',
    title: 'TRID Compliance Checklist',
    content: 'Essential checklist for ensuring TRID compliance throughout the loan process, including timeline requirements and disclosure guidelines...',
    category: 'Compliance',
    tags: ['TRID', 'Compliance', 'Disclosures'],
    createdDate: '2023-05-10',
    updatedDate: '2024-02-10',
    authorId: 'user-3',
    authorName: 'Jennifer Martinez',
    views: 2100,
    helpful: 156,
  },
  {
    id: 'kb-4',
    title: 'Jumbo Loan Processing Best Practices',
    content: 'Best practices for processing jumbo loans including documentation requirements, asset verification, and underwriting considerations...',
    category: 'Products',
    tags: ['Jumbo', 'High-Balance', 'Processing'],
    createdDate: '2023-11-05',
    updatedDate: '2024-01-15',
    authorId: 'user-6',
    authorName: 'James Taylor',
    views: 650,
    helpful: 45,
  },
  {
    id: 'kb-5',
    title: 'Rate Lock Procedures',
    content: 'Complete guide to rate lock procedures, extension policies, renegotiation rules, and best practices for timing locks...',
    category: 'Processes',
    tags: ['Rate Lock', 'Pricing', 'Procedures'],
    createdDate: '2023-09-20',
    updatedDate: '2024-01-08',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    views: 980,
    helpful: 72,
  },
]

// Mock Scripts
export const mockScripts: Script[] = [
  {
    id: 'script-1',
    title: 'Rate Objection Handler',
    scenario: 'When a prospect says your rates are too high',
    content: `"I completely understand that rate is important to you - it should be! Let me ask you this: are you looking for the lowest rate, or the lowest total cost of the loan? Because sometimes a slightly higher rate with lower closing costs actually saves you money. Let me show you a quick comparison..."`,
    category: 'objection',
    tags: ['rates', 'pricing', 'objection'],
    createdDate: '2023-07-15',
    updatedDate: '2024-01-10',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    usageCount: 245,
    rating: 4.8,
  },
  {
    id: 'script-2',
    title: 'First-Time Buyer Discovery',
    scenario: 'Initial conversation with first-time homebuyers',
    content: `"Congratulations on taking this exciting step toward homeownership! I'd love to learn more about your situation. Can you tell me a bit about what's motivating you to buy now? Are you currently renting, and do you have a timeline in mind? Also, have you started looking at homes yet, or would you like to get pre-approved first?"`,
    category: 'discovery',
    tags: ['first-time', 'discovery', 'qualification'],
    createdDate: '2023-08-20',
    updatedDate: '2024-02-01',
    authorId: 'user-1',
    authorName: 'Sarah Johnson',
    usageCount: 189,
    rating: 4.6,
  },
  {
    id: 'script-3',
    title: 'Refinance Follow-Up',
    scenario: 'Following up with a refinance lead who went cold',
    content: `"Hi [Name], this is [Your Name] from Lendify. I wanted to check in because when we last spoke, you were interested in refinancing. I know timing is everything with rates, and I actually have some good news - we've seen some movement that might make now a great time to revisit. Do you have 5 minutes to see if the numbers work for you?"`,
    category: 'follow-up',
    tags: ['refinance', 'follow-up', 'reactivation'],
    createdDate: '2023-09-10',
    updatedDate: '2024-01-25',
    authorId: 'user-5',
    authorName: 'Emily Brown',
    usageCount: 156,
    rating: 4.4,
  },
  {
    id: 'script-4',
    title: 'Asking for Referrals',
    scenario: 'After closing, asking satisfied clients for referrals',
    content: `"[Name], it's been such a pleasure helping you with your home purchase. Now that you're settling in, I wanted to ask - do you know anyone else who might be looking to buy or refinance? I'd love to provide them the same level of service. Most of my business comes from referrals from happy clients like yourself."`,
    category: 'referral',
    tags: ['referral', 'post-closing', 'networking'],
    createdDate: '2023-10-05',
    updatedDate: '2024-02-05',
    authorId: 'user-4',
    authorName: 'David Williams',
    usageCount: 134,
    rating: 4.7,
  },
  {
    id: 'script-5',
    title: 'Closing the Application',
    scenario: 'Moving a qualified prospect to submit an application',
    content: `"Based on everything we've discussed, it looks like you're in a great position to move forward. The next step is to complete a quick application - it takes about 15 minutes and doesn't affect your credit score for the initial review. I can walk you through it right now, or if you prefer, I can send you a secure link. Which works better for you?"`,
    category: 'closing',
    tags: ['closing', 'application', 'conversion'],
    createdDate: '2023-11-15',
    updatedDate: '2024-01-30',
    authorId: 'user-2',
    authorName: 'Michael Chen',
    usageCount: 201,
    rating: 4.9,
  },
]

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    teamName: 'West Coast Team',
    debtLoadEnrolled: 4250000,
    unitsEnrolled: 12,
    totalCommissions: 53125,
    previousRank: 2,
    trend: 'up',
  },
  {
    rank: 2,
    agentId: 'user-5',
    agentName: 'Emily Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    teamName: 'East Coast Team',
    debtLoadEnrolled: 3890000,
    unitsEnrolled: 11,
    totalCommissions: 48625,
    previousRank: 1,
    trend: 'down',
  },
  {
    rank: 3,
    agentId: 'user-4',
    agentName: 'David Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    teamName: 'West Coast Team',
    debtLoadEnrolled: 3450000,
    unitsEnrolled: 9,
    totalCommissions: 43125,
    previousRank: 3,
    trend: 'same',
  },
  {
    rank: 4,
    agentId: 'user-7',
    agentName: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    teamName: 'West Coast Team',
    debtLoadEnrolled: 2980000,
    unitsEnrolled: 8,
    totalCommissions: 37250,
    previousRank: 5,
    trend: 'up',
  },
  {
    rank: 5,
    agentId: 'user-8',
    agentName: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    teamName: 'East Coast Team',
    debtLoadEnrolled: 2750000,
    unitsEnrolled: 7,
    totalCommissions: 34375,
    previousRank: 4,
    trend: 'down',
  },
  {
    rank: 6,
    agentId: 'user-9',
    agentName: 'Ryan Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    teamName: 'Central Team',
    debtLoadEnrolled: 2450000,
    unitsEnrolled: 6,
    totalCommissions: 30625,
    previousRank: 7,
    trend: 'up',
  },
  {
    rank: 7,
    agentId: 'user-10',
    agentName: 'Jessica Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    teamName: 'Central Team',
    debtLoadEnrolled: 2100000,
    unitsEnrolled: 5,
    totalCommissions: 26250,
    previousRank: 6,
    trend: 'down',
  },
  {
    rank: 8,
    agentId: 'user-11',
    agentName: 'Brian Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian',
    teamName: 'East Coast Team',
    debtLoadEnrolled: 1850000,
    unitsEnrolled: 5,
    totalCommissions: 23125,
    previousRank: 8,
    trend: 'same',
  },
]

// Mock Pipeline
export const mockPipeline: PipelineLoan[] = [
  {
    id: 'pipe-1',
    borrowerName: 'Thomas & Rebecca Moore',
    loanAmount: 525000,
    loanType: 'Conventional',
    status: 'underwriting',
    expectedCloseDate: '2024-03-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-01-20',
    lastActivity: '2024-02-14',
  },
  {
    id: 'pipe-2',
    borrowerName: 'Andrew Nelson',
    loanAmount: 380000,
    loanType: 'FHA',
    status: 'processing',
    expectedCloseDate: '2024-03-15',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-02-01',
    lastActivity: '2024-02-13',
  },
  {
    id: 'pipe-3',
    borrowerName: 'Linda & Robert Scott',
    loanAmount: 675000,
    loanType: 'Jumbo',
    status: 'approved',
    expectedCloseDate: '2024-02-28',
    agentId: 'user-4',
    agentName: 'David Williams',
    createdDate: '2024-01-15',
    lastActivity: '2024-02-12',
  },
  {
    id: 'pipe-4',
    borrowerName: 'Michelle Carter',
    loanAmount: 295000,
    loanType: 'VA',
    status: 'closing',
    expectedCloseDate: '2024-02-20',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    createdDate: '2024-01-10',
    lastActivity: '2024-02-15',
  },
  {
    id: 'pipe-5',
    borrowerName: 'Jason & Amy Phillips',
    loanAmount: 450000,
    loanType: 'Conventional',
    status: 'application',
    expectedCloseDate: '2024-04-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-02-10',
    lastActivity: '2024-02-14',
  },
  {
    id: 'pipe-6',
    borrowerName: 'Daniel White',
    loanAmount: 320000,
    loanType: 'Refinance',
    status: 'lead',
    expectedCloseDate: '2024-04-15',
    agentId: 'user-4',
    agentName: 'David Williams',
    createdDate: '2024-02-12',
    lastActivity: '2024-02-12',
  },
]

// Generate chart data for various time periods
export function generateVolumeChartData(days: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const baseValue = 150000 + Math.random() * 100000
    const seasonalFactor = 1 + Math.sin(i / 7) * 0.2
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue * seasonalFactor),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }
  
  return data
}

export function generateUnitsChartData(days: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 3) + 1,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  }
  
  return data
}

// Dashboard metrics calculation
export function getDashboardMetrics(userId?: string, teamId?: string): DashboardMetrics {
  // Filter commissions (enrolled/funded loans)
  const relevantCommissions = mockCommissions.filter(c => {
    if (userId) return c.agentId === userId
    if (teamId) {
      const agent = mockUsers.find(u => u.id === c.agentId)
      return agent?.teamId === teamId
    }
    return true
  })

  // Enrolled = funded loans
  const debtLoadEnrolled = relevantCommissions.reduce((sum, c) => sum + c.loanAmount, 0)
  const unitsEnrolled = relevantCommissions.length
  const totalCommissions = relevantCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const avgLoanSize = unitsEnrolled > 0 ? debtLoadEnrolled / unitsEnrolled : 0

  // Filter pipeline (submitted loans in progress)
  const relevantPipeline = mockPipeline.filter(p => {
    if (userId) return p.agentId === userId
    if (teamId) {
      const agent = mockUsers.find(u => u.id === p.agentId)
      return agent?.teamId === teamId
    }
    return true
  })

  // Submitted = loans in pipeline
  const debtLoadSubmitted = relevantPipeline.reduce((sum, p) => sum + p.loanAmount, 0)
  const unitsSubmitted = relevantPipeline.length

  // Clawbacks
  const relevantClawbacks = mockClawbacks.filter(c => {
    if (userId) return c.agentId === userId
    if (teamId) {
      const agent = mockUsers.find(u => u.id === c.agentId)
      return agent?.teamId === teamId
    }
    return true
  })
  const totalClawbacks = relevantClawbacks.reduce((sum, c) => sum + c.clawbackAmount, 0)

  // FPC (First Payment Cleared) - commissions that have been paid (cleared)
  const fpcCommissions = relevantCommissions.filter(c => c.status === 'paid')
  const debtLoadFPC = fpcCommissions.reduce((sum, c) => sum + c.loanAmount, 0)
  const unitsFPC = fpcCommissions.length

  // Conversion rates
  const totalLeads = unitsSubmitted + unitsEnrolled // Total opportunities
  const conversionRate = totalLeads > 0 ? (unitsEnrolled / totalLeads) * 100 : 0
  // Qualified = applications and beyond in pipeline
  const qualifiedPipeline = relevantPipeline.filter(p => 
    ['application', 'processing', 'underwriting', 'approved', 'closing'].includes(p.status)
  )
  const qualifiedLeads = qualifiedPipeline.length + unitsEnrolled
  const qualifiedConversionRate = qualifiedLeads > 0 ? (unitsEnrolled / qualifiedLeads) * 100 : 0

  return {
    debtLoadEnrolled,
    debtLoadEnrolledChange: 12.5,
    unitsEnrolled,
    unitsEnrolledChange: 8.3,
    debtLoadSubmitted,
    debtLoadSubmittedChange: 18.7,
    unitsSubmitted,
    unitsSubmittedChange: 15.2,
    debtLoadFPC,
    debtLoadFPCChange: 9.8,
    unitsFPC,
    unitsFPCChange: 7.2,
    conversionRate,
    conversionRateChange: 3.5,
    qualifiedConversionRate,
    qualifiedConversionRateChange: 5.1,
    totalCommissions,
    commissionsChange: 15.2,
    totalClawbacks,
    clawbacksChange: -5.3,
    avgLoanSize,
    avgLoanSizeChange: 3.8,
    pipelineValue: debtLoadSubmitted,
    pipelineChange: 22.1,
    closingRate: 68.5,
    closingRateChange: 2.4,
  }
}

// Team metrics
export function getTeamMetrics(): TeamMetrics[] {
  const teams = ['team-1', 'team-2']
  const teamNames: Record<string, string> = {
    'team-1': 'West Coast Team',
    'team-2': 'East Coast Team',
  }

  return teams.map(teamId => {
    const members = mockUsers.filter(u => u.teamId === teamId)
    const metrics = getDashboardMetrics(undefined, teamId)
    const teamLeader = mockLeaderboard.find(l => {
      const user = mockUsers.find(u => u.id === l.agentId)
      return user?.teamId === teamId
    })

    return {
      ...metrics,
      teamId,
      teamName: teamNames[teamId],
      memberCount: members.length,
      topPerformer: teamLeader?.agentName || 'N/A',
    }
  })
}

// Default dashboard layout
export const defaultDashboardLayout: DashboardLayout = {
  widgets: [
    // Row 1: Enrolled & Submitted
    { id: 'kpi-debt-enrolled', type: 'kpi', title: 'Debt Load Enrolled', size: 'small', order: 1, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-units-enrolled', type: 'kpi', title: 'Units Enrolled', size: 'small', order: 2, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-debt-submitted', type: 'kpi', title: 'Debt Load Submitted', size: 'small', order: 3, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-units-submitted', type: 'kpi', title: 'Units Submitted', size: 'small', order: 4, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    // Row 2: FPC & Conversion
    { id: 'kpi-debt-fpc', type: 'kpi', title: 'Debt Load FPC', size: 'small', order: 5, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-units-fpc', type: 'kpi', title: 'Units FPC', size: 'small', order: 6, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-conversion', type: 'kpi', title: 'Conversion Rate', size: 'small', order: 7, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-qualified-conversion', type: 'kpi', title: 'Qualified Conversion', size: 'small', order: 8, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    // Row 3: Financial
    { id: 'kpi-commissions', type: 'kpi', title: 'Commission', size: 'small', order: 9, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-clawbacks', type: 'kpi', title: 'Clawbacks', size: 'small', order: 10, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'kpi-avg-debt', type: 'kpi', title: 'Avg Debt Size', size: 'small', order: 11, visible: true, roleAccess: ['leadership', 'executive'] },
    { id: 'kpi-closing-rate', type: 'kpi', title: 'Closing Rate', size: 'small', order: 12, visible: true, roleAccess: ['leadership', 'executive'] },
    // Charts & Tables
    { id: 'chart-debt', type: 'chart', title: 'Debt Load Trend', size: 'large', order: 13, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'chart-pipeline', type: 'chart', title: 'Pipeline by Status', size: 'medium', order: 14, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'table-pipeline', type: 'table', title: 'Active Pipeline', size: 'large', order: 15, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'list-announcements', type: 'list', title: 'Recent Announcements', size: 'medium', order: 16, visible: true, roleAccess: ['agent', 'leadership', 'executive'] },
    { id: 'table-team', type: 'table', title: 'Team Performance', size: 'large', order: 17, visible: true, roleAccess: ['leadership', 'executive'] },
    { id: 'chart-comparison', type: 'chart', title: 'Team Comparison', size: 'large', order: 18, visible: true, roleAccess: ['executive'] },
  ],
  lastUpdated: new Date().toISOString(),
}

// Service functions that mimic API calls
export const dataService = {
  // Auth
  getCurrentUser: (userId: string): User | undefined => {
    return mockUsers.find(u => u.id === userId)
  },
  
  getUsers: (): User[] => mockUsers,
  
  getAgents: (): User[] => mockUsers.filter(u => u.role === 'agent'),
  
  getTeams: (): { id: string; name: string }[] => {
    const teamsMap = new Map<string, string>()
    mockUsers.forEach(u => {
      if (u.teamId && u.teamName) {
        teamsMap.set(u.teamId, u.teamName)
      }
    })
    return Array.from(teamsMap.entries()).map(([id, name]) => ({ id, name }))
  },
  
  // Commissions
  getCommissions: (userId?: string): Commission[] => {
    if (userId) {
      return mockCommissions.filter(c => c.agentId === userId)
    }
    return mockCommissions
  },
  
  // Clawbacks
  getClawbacks: (userId?: string): Clawback[] => {
    if (userId) {
      return mockClawbacks.filter(c => c.agentId === userId)
    }
    return mockClawbacks
  },
  
  // Announcements
  getAnnouncements: (): Announcement[] => {
    return [...mockAnnouncements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    })
  },
  
  markAnnouncementRead: (announcementId: string, userId: string): void => {
    const announcement = mockAnnouncements.find(a => a.id === announcementId)
    if (announcement && !announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId)
    }
  },
  
  // Knowledge Base
  getKnowledgeArticles: (category?: string): KnowledgeArticle[] => {
    if (category) {
      return mockKnowledgeArticles.filter(a => a.category === category)
    }
    return mockKnowledgeArticles
  },
  
  searchKnowledgeArticles: (query: string): KnowledgeArticle[] => {
    const lowerQuery = query.toLowerCase()
    return mockKnowledgeArticles.filter(
      a => a.title.toLowerCase().includes(lowerQuery) ||
           a.content.toLowerCase().includes(lowerQuery) ||
           a.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  },
  
  // Scripts
  getScripts: (category?: string): Script[] => {
    if (category) {
      return mockScripts.filter(s => s.category === category)
    }
    return mockScripts
  },
  
  searchScripts: (query: string): Script[] => {
    const lowerQuery = query.toLowerCase()
    return mockScripts.filter(
      s => s.title.toLowerCase().includes(lowerQuery) ||
           s.scenario.toLowerCase().includes(lowerQuery) ||
           s.content.toLowerCase().includes(lowerQuery) ||
           s.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  },
  
  // Leaderboard
  getLeaderboard: (period: 'mtd' | 'qtd' | 'ytd' = 'mtd'): LeaderboardEntry[] => {
    // In a real app, this would filter by period
    return mockLeaderboard
  },
  
  // Pipeline
  getPipeline: (userId?: string): PipelineLoan[] => {
    if (userId) {
      return mockPipeline.filter(p => p.agentId === userId)
    }
    return mockPipeline
  },
  
  // Dashboard
  getDashboardMetrics,
  getTeamMetrics,
  
  getDashboardLayout: (): DashboardLayout => {
    const stored = typeof window !== 'undefined' 
      ? localStorage.getItem('lendify-dashboard-layout') 
      : null
    if (stored) {
      return JSON.parse(stored)
    }
    return defaultDashboardLayout
  },
  
  saveDashboardLayout: (layout: DashboardLayout): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lendify-dashboard-layout', JSON.stringify(layout))
    }
  },
  
  // Chart data
  getVolumeChartData: (days: number = 30) => generateVolumeChartData(days),
  getUnitsChartData: (days: number = 30) => generateUnitsChartData(days),
}
