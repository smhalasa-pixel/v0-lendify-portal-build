// Mock data service for Lendify Portal
// This service simulates API responses and can be easily swapped for real API calls

import type {
  User,
  Team,
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
  Task,
  AgentPerformance,
  Client,
  Ticket,
  TicketComment,
  TicketPriority,
  TicketStatus,
  TicketCategory,
  UserRole,
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
    region: 'dubai',
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
    region: 'dubai',
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
    // No region - executives see all
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
    region: 'dubai',
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
    region: 'jordan',
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
    region: 'jordan',
    hireDate: '2019-04-15',
    status: 'active',
  },
  {
    id: 'user-7',
    email: 'alex.thompson@lendify.com',
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'supervisor',
    teamIds: ['team-1', 'team-2'],
    teamNames: ['West Coast Team', 'East Coast Team'],
    region: 'dubai',
    hireDate: '2019-01-10',
    status: 'active',
  },
  {
    id: 'user-admin',
    email: 'admin@lendify.com',
    name: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'admin',
    teamId: undefined,
    teamName: undefined,
    // No region - admins see all
    hireDate: '2017-01-01',
    status: 'active',
  },
]

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'West Coast Team',
    leaderId: 'user-2',
    leaderName: 'Michael Chen',
    supervisorId: 'user-7',
    supervisorName: 'Alex Thompson',
    memberCount: 3, // Sarah, David, Michael
    createdAt: '2020-01-01',
  },
  {
    id: 'team-2',
    name: 'East Coast Team',
    leaderId: 'user-6',
    leaderName: 'James Taylor',
    supervisorId: 'user-7',
    supervisorName: 'Alex Thompson',
    memberCount: 2, // Emily, James
    createdAt: '2019-06-15',
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
    teamId: 'team-1',
    teamName: 'West Coast Team',
    unitsClosed: 12,
    debtLoadEnrolled: 4250000,
    unitsEnrolled: 18,
    conversionRate: 66.7,
    performanceGrade: 'A+',
    totalCommissions: 53125,
    previousRank: 2,
    trend: 'up',
  },
  {
    rank: 2,
    agentId: 'user-5',
    agentName: 'Emily Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    teamId: 'team-2',
    teamName: 'East Coast Team',
    unitsClosed: 11,
    debtLoadEnrolled: 3890000,
    unitsEnrolled: 16,
    conversionRate: 68.8,
    performanceGrade: 'A',
    totalCommissions: 48625,
    previousRank: 1,
    trend: 'down',
  },
  {
    rank: 3,
    agentId: 'user-4',
    agentName: 'David Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    teamId: 'team-1',
    teamName: 'West Coast Team',
    unitsClosed: 9,
    debtLoadEnrolled: 3450000,
    unitsEnrolled: 14,
    conversionRate: 64.3,
    performanceGrade: 'A-',
    totalCommissions: 43125,
    previousRank: 3,
    trend: 'same',
  },
  {
    rank: 4,
    agentId: 'user-7',
    agentName: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    teamId: 'team-1',
    teamName: 'West Coast Team',
    unitsClosed: 8,
    debtLoadEnrolled: 2980000,
    unitsEnrolled: 12,
    conversionRate: 66.7,
    performanceGrade: 'B+',
    totalCommissions: 37250,
    previousRank: 5,
    trend: 'up',
  },
  {
    rank: 5,
    agentId: 'user-8',
    agentName: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    teamId: 'team-2',
    teamName: 'East Coast Team',
    unitsClosed: 7,
    debtLoadEnrolled: 2750000,
    unitsEnrolled: 11,
    conversionRate: 63.6,
    performanceGrade: 'B',
    totalCommissions: 34375,
    previousRank: 4,
    trend: 'down',
  },
  {
    rank: 6,
    agentId: 'user-9',
    agentName: 'Ryan Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    teamId: 'team-3',
    teamName: 'Central Team',
    unitsClosed: 6,
    debtLoadEnrolled: 2450000,
    unitsEnrolled: 10,
    conversionRate: 60.0,
    performanceGrade: 'B-',
    totalCommissions: 30625,
    previousRank: 7,
    trend: 'up',
  },
  {
    rank: 7,
    agentId: 'user-10',
    agentName: 'Jessica Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    teamId: 'team-3',
    teamName: 'Central Team',
    unitsClosed: 5,
    debtLoadEnrolled: 2100000,
    unitsEnrolled: 9,
    conversionRate: 55.6,
    performanceGrade: 'C+',
    totalCommissions: 26250,
    previousRank: 6,
    trend: 'down',
  },
  {
    rank: 8,
    agentId: 'user-11',
    agentName: 'Brian Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brian',
    teamId: 'team-2',
    teamName: 'East Coast Team',
    unitsClosed: 5,
    debtLoadEnrolled: 1850000,
    unitsEnrolled: 8,
    conversionRate: 62.5,
    performanceGrade: 'C',
    totalCommissions: 23125,
    previousRank: 8,
    trend: 'same',
  },
]

// Mock Pipeline
export const mockPipeline: PipelineLoan[] = [
  {
    id: 'pipe-1',
    clientId: 'CL-2024-001',
    borrowerName: 'Thomas & Rebecca Moore',
    loanAmount: 525000,
    loanType: 'Conventional',
    status: 'underwriting',
    expectedCloseDate: '2024-03-01',
    firstPaymentDate: '2024-04-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-01-20',
    lastActivity: '2024-02-14',
  },
  {
    id: 'pipe-2',
    clientId: 'CL-2024-002',
    borrowerName: 'Andrew Nelson',
    loanAmount: 380000,
    loanType: 'FHA',
    status: 'processing',
    expectedCloseDate: '2024-03-15',
    firstPaymentDate: '2024-04-15',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-02-01',
    lastActivity: '2024-02-13',
  },
  {
    id: 'pipe-3',
    clientId: 'CL-2024-003',
    borrowerName: 'Linda & Robert Scott',
    loanAmount: 675000,
    loanType: 'Jumbo',
    status: 'approved',
    expectedCloseDate: '2024-02-28',
    firstPaymentDate: '2024-03-28',
    agentId: 'user-4',
    agentName: 'David Williams',
    createdDate: '2024-01-15',
    lastActivity: '2024-02-12',
  },
  {
    id: 'pipe-4',
    clientId: 'CL-2024-004',
    borrowerName: 'Michelle Carter',
    loanAmount: 295000,
    loanType: 'VA',
    status: 'closing',
    expectedCloseDate: '2024-02-20',
    firstPaymentDate: '2024-03-20',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    createdDate: '2024-01-10',
    lastActivity: '2024-02-15',
  },
  {
    id: 'pipe-5',
    clientId: 'CL-2024-005',
    borrowerName: 'Jason & Amy Phillips',
    loanAmount: 450000,
    loanType: 'Conventional',
    status: 'application',
    expectedCloseDate: '2024-04-01',
    firstPaymentDate: '2024-05-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-02-10',
    lastActivity: '2024-02-14',
  },
  {
    id: 'pipe-6',
    clientId: 'CL-2024-006',
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
  {
    id: 'pipe-7',
    clientId: 'CL-2024-007',
    borrowerName: 'Sarah Mitchell',
    loanAmount: 420000,
    loanType: 'Conventional',
    status: 'funded',
    expectedCloseDate: '2024-02-10',
    firstPaymentDate: '2024-03-10',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    createdDate: '2024-01-05',
    lastActivity: '2024-02-10',
  },
  {
    id: 'pipe-8',
    clientId: 'CL-2024-008',
    borrowerName: 'Kevin & Lisa Anderson',
    loanAmount: 560000,
    loanType: 'Jumbo',
    status: 'processing',
    expectedCloseDate: '2024-03-20',
    firstPaymentDate: '2024-04-20',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    createdDate: '2024-02-05',
    lastActivity: '2024-02-14',
  },
]

// Mock Clients - for client search functionality
export const mockClients: Client[] = [
  {
    id: 'CL-2024-001',
    firstName: 'Thomas',
    lastName: 'Moore',
    status: 'enrolled',
    debtLoad: 52500,
    submittedDate: '2024-01-15',
    enrolledDate: '2024-02-01',
    firstPaymentDate: '2024-03-15',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-002',
    firstName: 'Jennifer',
    lastName: 'Williams',
    status: 'active',
    debtLoad: 38900,
    submittedDate: '2024-01-20',
    enrolledDate: '2024-02-05',
    firstPaymentDate: '2024-03-01',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-003',
    firstName: 'Robert',
    lastName: 'Garcia',
    status: 'submitted',
    debtLoad: 67200,
    submittedDate: '2024-02-10',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-004',
    firstName: 'Maria',
    lastName: 'Martinez',
    status: 'lead',
    debtLoad: 45000,
    agentId: 'user-4',
    agentName: 'David Williams',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-005',
    firstName: 'James',
    lastName: 'Johnson',
    status: 'enrolled',
    debtLoad: 89500,
    submittedDate: '2024-01-08',
    enrolledDate: '2024-01-25',
    firstPaymentDate: '2024-02-25',
    agentId: 'user-4',
    agentName: 'David Williams',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-006',
    firstName: 'Patricia',
    lastName: 'Brown',
    status: 'active',
    debtLoad: 34200,
    submittedDate: '2024-01-12',
    enrolledDate: '2024-01-28',
    firstPaymentDate: '2024-02-28',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    teamId: 'team-2',
  },
  {
    id: 'CL-2024-007',
    firstName: 'Michael',
    lastName: 'Davis',
    status: 'cancelled',
    debtLoad: 28700,
    submittedDate: '2024-01-05',
    enrolledDate: '2024-01-20',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    teamId: 'team-2',
  },
  {
    id: 'CL-2024-008',
    firstName: 'Linda',
    lastName: 'Wilson',
    status: 'completed',
    debtLoad: 41800,
    submittedDate: '2023-10-15',
    enrolledDate: '2023-11-01',
    firstPaymentDate: '2023-12-01',
    agentId: 'user-5',
    agentName: 'Emily Brown',
    teamId: 'team-2',
  },
  {
    id: 'CL-2024-009',
    firstName: 'William',
    lastName: 'Anderson',
    status: 'enrolled',
    debtLoad: 72300,
    submittedDate: '2024-02-01',
    enrolledDate: '2024-02-15',
    firstPaymentDate: '2024-03-15',
    agentId: 'user-4',
    agentName: 'David Williams',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-010',
    firstName: 'Elizabeth',
    lastName: 'Taylor',
    status: 'submitted',
    debtLoad: 55600,
    submittedDate: '2024-02-12',
    agentId: 'user-1',
    agentName: 'Sarah Johnson',
    teamId: 'team-1',
  },
  {
    id: 'CL-2024-011',
    firstName: 'Christopher',
    lastName: 'Thomas',
    status: 'lead',
    debtLoad: 31200,
    agentId: 'user-5',
    agentName: 'Emily Brown',
    teamId: 'team-2',
  },
  {
    id: 'CL-2024-012',
    firstName: 'Susan',
    lastName: 'Jackson',
    status: 'active',
    debtLoad: 48900,
    submittedDate: '2024-01-18',
    enrolledDate: '2024-02-03',
    firstPaymentDate: '2024-03-03',
    agentId: 'user-4',
    agentName: 'David Williams',
    teamId: 'team-1',
  },
]

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Q1 Compliance Training',
    description: 'All agents must complete the updated TRID compliance training module. Access the training through the Knowledge Base section.',
    priority: 'urgent',
    status: 'pending',
    dueDate: '2024-03-31',
    dueTime: '17:00',
    createdDate: '2024-02-15',
    createdById: 'user-3',
    createdByName: 'Jennifer Martinez',
    assignmentType: 'department',
    category: 'compliance',
    completedBy: ['user-1'],
  },
  {
    id: 'task-2',
    title: 'Submit Weekly Pipeline Report',
    description: 'Please submit your weekly pipeline report by end of day Friday. Include all active leads and expected close dates.',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-02-16',
    dueTime: '18:00',
    createdDate: '2024-02-12',
    createdById: 'user-2',
    createdByName: 'Michael Chen',
    assignmentType: 'team',
    assignedToTeamId: 'team-1',
    assignedToTeamName: 'West Coast Team',
    category: 'administrative',
    completedBy: [],
  },
  {
    id: 'task-3',
    title: 'Follow up with Thompson loan',
    description: 'The Thompson loan is pending final docs. Please follow up with the borrower to get the missing W2 forms.',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-02-18',
    dueTime: '12:00',
    createdDate: '2024-02-14',
    createdById: 'user-2',
    createdByName: 'Michael Chen',
    assignmentType: 'individual',
    assignedToId: 'user-1',
    assignedToName: 'Sarah Johnson',
    category: 'sales',
  },
  {
    id: 'task-4',
    title: 'Review new Jumbo product guidelines',
    description: 'Review the new Jumbo Elite product guidelines and be prepared to discuss in the team meeting.',
    priority: 'medium',
    status: 'completed',
    dueDate: '2024-02-10',
    createdDate: '2024-02-05',
    completedDate: '2024-02-09',
    createdById: 'user-3',
    createdByName: 'Jennifer Martinez',
    assignmentType: 'department',
    category: 'training',
    completedBy: ['user-1', 'user-4', 'user-5'],
  },
  {
    id: 'task-5',
    title: 'Update CRM contact records',
    description: 'Ensure all client contact information is up to date in the CRM system.',
    priority: 'low',
    status: 'pending',
    dueDate: '2024-02-28',
    createdDate: '2024-02-10',
    createdById: 'user-6',
    createdByName: 'James Taylor',
    assignmentType: 'team',
    assignedToTeamId: 'team-2',
    assignedToTeamName: 'East Coast Team',
    category: 'administrative',
    completedBy: [],
  },
  {
    id: 'task-6',
    title: 'Call back referral from Garcia loan',
    description: 'Kevin Garcia mentioned his brother is looking to refinance. Please reach out to schedule a consultation.',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-02-20',
    dueTime: '15:00',
    createdDate: '2024-02-14',
    createdById: 'user-6',
    createdByName: 'James Taylor',
    assignmentType: 'individual',
    assignedToId: 'user-5',
    assignedToName: 'Emily Brown',
    category: 'sales',
  },
  {
    id: 'task-7',
    title: 'Attend monthly sales meeting',
    description: 'Mandatory monthly sales meeting to discuss Q1 goals and new product launches.',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-02-22',
    dueTime: '10:00',
    createdDate: '2024-02-01',
    createdById: 'user-3',
    createdByName: 'Jennifer Martinez',
    assignmentType: 'department',
    category: 'training',
    completedBy: [],
  },
]

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'Commission discrepancy on loan #12345',
    description: 'The commission amount for loan #12345 seems incorrect. Expected $2,500 but received $2,200. Please review.',
    category: 'commission',
    priority: 'high',
    status: 'open',
    createdById: 'user-1',
    createdByName: 'Sarah Johnson',
    createdByRole: 'agent',
    createdByTeamId: 'team-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
  },
  {
    id: 'ticket-2',
    title: 'CRM system not loading client data',
    description: 'When I try to access client profiles, the page shows a loading spinner indefinitely. This has been happening since yesterday.',
    category: 'technical',
    priority: 'urgent',
    status: 'in_progress',
    createdById: 'user-5',
    createdByName: 'Emily Brown',
    createdByRole: 'agent',
    createdByTeamId: 'team-2',
    assignedToId: 'user-6',
    assignedToName: 'James Wilson',
    assignedToRole: 'supervisor',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'comment-1',
        ticketId: 'ticket-2',
        authorId: 'user-6',
        authorName: 'James Wilson',
        authorRole: 'supervisor',
        content: 'Looking into this now. Can you try clearing your browser cache in the meantime?',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-3',
    title: 'Request for additional training on new product',
    description: 'Our team would benefit from additional training on the new refinance product that was launched last week.',
    category: 'other',
    priority: 'medium',
    status: 'escalated',
    createdById: 'user-2',
    createdByName: 'Michael Chen',
    createdByRole: 'leadership',
    createdByTeamId: 'team-1',
    escalatedToId: 'user-6',
    escalatedToName: 'James Wilson',
    escalatedToRole: 'supervisor',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'comment-2',
        ticketId: 'ticket-3',
        authorId: 'user-2',
        authorName: 'Michael Chen',
        authorRole: 'leadership',
        content: 'This is affecting the entire team\'s ability to sell the new product effectively.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-4',
    title: 'Client complaint about response time',
    description: 'Client John Smith complained that he hasn\'t received a callback in 3 days. Need guidance on how to handle this.',
    category: 'client',
    priority: 'high',
    status: 'resolved',
    createdById: 'user-1',
    createdByName: 'Sarah Johnson',
    createdByRole: 'agent',
    createdByTeamId: 'team-1',
    assignedToId: 'user-2',
    assignedToName: 'Michael Chen',
    assignedToRole: 'leadership',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'comment-3',
        ticketId: 'ticket-4',
        authorId: 'user-2',
        authorName: 'Michael Chen',
        authorRole: 'leadership',
        content: 'I called the client and resolved the issue. Please make sure to follow up within 24 hours in the future.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-5',
    title: 'PTO request approval needed',
    description: 'Requesting time off from April 20-25 for family vacation. All my clients are handled and assignments are up to date.',
    category: 'hr',
    priority: 'low',
    status: 'open',
    createdById: 'user-4',
    createdByName: 'David Kim',
    createdByRole: 'agent',
    createdByTeamId: 'team-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    comments: [],
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

  // Tier and expected metrics
  const currentTier = unitsEnrolled >= 15 ? 3 : unitsEnrolled >= 10 ? 2 : 1
  const expectedTier = (unitsEnrolled + unitsSubmitted * 0.7) >= 15 ? 3 : (unitsEnrolled + unitsSubmitted * 0.7) >= 10 ? 2 : 1
  const tierCommissionRates = { 1: 0.0125, 2: 0.015, 3: 0.0175 }
  const expectedCommission = totalCommissions + (debtLoadSubmitted * tierCommissionRates[expectedTier as 1 | 2 | 3] * 0.7)

  // Monthly targets
  const monthlyTargetUnits = 15
  const monthlyTargetDebtLoad = 5000000
  const unitsToTarget = Math.min((unitsEnrolled / monthlyTargetUnits) * 100, 100)
  const debtLoadToTarget = Math.min((debtLoadEnrolled / monthlyTargetDebtLoad) * 100, 100)

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
    // Ancillary metrics - count of ancillary sales (units)
    ancillaryRevenue: Math.round(unitsEnrolled * 450), // Keep for backwards compat
    ancillaryRevenueChange: 11.2,
    ancillaryCount: Math.round(unitsEnrolled * 0.65), // 65% of enrolled have ancillary
    ancillaryCountChange: 8.7,
    // Average debt load per file
    avgDebtLoadPerFile: unitsEnrolled > 0 ? Math.round(debtLoadEnrolled / unitsEnrolled) : 0,
    avgDebtLoadPerFileChange: 4.2,
    // Daily averages (based on ~20 working days per month)
    avgDailyEnrolledDebt: Math.round(debtLoadEnrolled / 20),
    avgDailyEnrolledDebtChange: 6.5,
    avgDailyEnrolledUnits: Math.round((unitsEnrolled / 20) * 10) / 10, // One decimal
    avgDailyEnrolledUnitsChange: 5.8,
    // Client metrics
    clientsEnrolled: unitsEnrolled, // Each unit = 1 client
    clientsEnrolledChange: 8.2,
    clientsActive: Math.round(unitsEnrolled * 0.85), // 85% still active
    clientsActiveChange: 4.5,
    clientsCancelled: Math.round(unitsEnrolled * 0.15), // 15% cancelled
    clientsCancelledChange: -2.3,
    // Cancellation % = Clients Cancelled / Clients Enrolled * 100
    cancellationRate: Math.round((Math.round(unitsEnrolled * 0.15) / unitsEnrolled) * 1000) / 10,
    cancellationRateChange: -1.8,
    // EPF metrics
    epfsCollected: Math.round(unitsEnrolled * 0.92), // 92% collection rate
    epfsCollectedChange: 3.2,
    epfsScheduled: Math.round(unitsEnrolled * 1.1), // Some scheduled for future
    epfsScheduledChange: 5.8,
    conversionRate,
    conversionRateChange: 3.5,
    conversionClosed: unitsEnrolled,
    conversionAssigned: totalLeads,
    qualifiedConversionRate,
    qualifiedConversionRateChange: 5.1,
    qualifiedClosed: unitsEnrolled,
    qualifiedAssigned: qualifiedLeads,
    totalCommissions,
    commissionsChange: 15.2,
    totalClawbacks,
    clawbacksChange: -5.3,
    currentTier,
    expectedTier,
    expectedCommission,
    monthlyTargetUnits,
    monthlyTargetDebtLoad,
    unitsToTarget,
    debtLoadToTarget,
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
  
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysPassed = now.getDate()
  const expectedProgressDecimal = daysPassed / daysInMonth

  return teams.map(teamId => {
    const members = mockUsers.filter(u => u.teamId === teamId)
    const metrics = getDashboardMetrics(undefined, teamId)
    const teamLeader = mockLeaderboard.find(l => {
      const user = mockUsers.find(u => u.id === l.agentId)
      return user?.teamId === teamId
    })
    
    // Calculate team pacing
    const teamTargetUnits = metrics.monthlyTargetUnits * members.length
    const teamTargetDebtLoad = metrics.monthlyTargetDebtLoad * members.length
    const expectedUnitsAtThisPoint = teamTargetUnits * expectedProgressDecimal
    const expectedDebtAtThisPoint = teamTargetDebtLoad * expectedProgressDecimal
    
    const pacingUnits = expectedUnitsAtThisPoint > 0 ? (metrics.unitsEnrolled / expectedUnitsAtThisPoint) * 100 : 0
    const pacingDebtLoad = expectedDebtAtThisPoint > 0 ? (metrics.debtLoadEnrolled / expectedDebtAtThisPoint) * 100 : 0
    const pacing = (pacingUnits + pacingDebtLoad) / 2
    
    // Determine performance grade based on pacing
    const getGrade = (p: number): 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' => {
      if (p >= 120) return 'A+'
      if (p >= 110) return 'A'
      if (p >= 100) return 'A-'
      if (p >= 90) return 'B+'
      if (p >= 80) return 'B'
      if (p >= 70) return 'B-'
      if (p >= 60) return 'C+'
      if (p >= 50) return 'C'
      if (p >= 40) return 'C-'
      if (p >= 30) return 'D'
      return 'F'
    }
    
    // Determine trend
    const trend: 'up' | 'down' | 'same' = teamId === 'team-1' ? 'up' : 'same'

    return {
      ...metrics,
      teamId,
      teamName: teamNames[teamId],
      memberCount: members.length,
      topPerformer: teamLeader?.agentName || 'N/A',
      performanceGrade: getGrade(pacing),
      pacing,
      pacingUnits,
      pacingDebtLoad,
      trend,
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
  
  getTeams: (): Team[] => {
    return mockTeams
  },

  getTeamById: (teamId: string): Team | undefined => {
    return mockTeams.find(t => t.id === teamId)
  },

  createTeam: (team: Omit<Team, 'id' | 'createdAt' | 'memberCount'>): Team => {
    const newTeam: Team = {
      ...team,
      id: `team-${randomId()}`,
      memberCount: 0,
      createdAt: new Date().toISOString(),
    }
    mockTeams.push(newTeam)
    return newTeam
  },

  updateTeam: (teamId: string, updates: Partial<Team>): Team | undefined => {
    const team = mockTeams.find(t => t.id === teamId)
    if (team) {
      Object.assign(team, updates)
      // Update team name in users if changed
      if (updates.name) {
        mockUsers.forEach(u => {
          if (u.teamId === teamId) {
            u.teamName = updates.name
          }
          if (u.teamIds?.includes(teamId)) {
            const idx = u.teamIds.indexOf(teamId)
            if (u.teamNames && idx !== -1) {
              u.teamNames[idx] = updates.name!
            }
          }
        })
      }
      return team
    }
    return undefined
  },

  assignTeamLead: (teamId: string, leaderId: string): void => {
    const team = mockTeams.find(t => t.id === teamId)
    const leader = mockUsers.find(u => u.id === leaderId)
    if (team && leader) {
      // Remove old leader's team assignment if different
      if (team.leaderId && team.leaderId !== leaderId) {
        const oldLeader = mockUsers.find(u => u.id === team.leaderId)
        if (oldLeader) {
          oldLeader.teamId = undefined
          oldLeader.teamName = undefined
        }
      }
      // Update team
      team.leaderId = leader.id
      team.leaderName = leader.name
      // Update user
      leader.role = 'leadership'
      leader.teamId = teamId
      leader.teamName = team.name
    }
  },

  assignTeamSupervisor: (teamId: string, supervisorId: string): void => {
    const team = mockTeams.find(t => t.id === teamId)
    const supervisor = mockUsers.find(u => u.id === supervisorId)
    if (team && supervisor) {
      // Update team
      team.supervisorId = supervisor.id
      team.supervisorName = supervisor.name
      // Update supervisor's teamIds
      if (!supervisor.teamIds) supervisor.teamIds = []
      if (!supervisor.teamNames) supervisor.teamNames = []
      if (!supervisor.teamIds.includes(teamId)) {
        supervisor.teamIds.push(teamId)
        supervisor.teamNames.push(team.name)
      }
    }
  },

  removeTeamSupervisor: (teamId: string): void => {
    const team = mockTeams.find(t => t.id === teamId)
    if (team && team.supervisorId) {
      const supervisor = mockUsers.find(u => u.id === team.supervisorId)
      if (supervisor && supervisor.teamIds) {
        const idx = supervisor.teamIds.indexOf(teamId)
        if (idx !== -1) {
          supervisor.teamIds.splice(idx, 1)
          supervisor.teamNames?.splice(idx, 1)
        }
      }
      team.supervisorId = undefined
      team.supervisorName = undefined
    }
  },

  // User CRUD
  createUser: (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${randomId()}`,
    }
    mockUsers.push(newUser)
    // Update team member count if assigned to a team
    if (newUser.teamId) {
      const team = mockTeams.find(t => t.id === newUser.teamId)
      if (team) team.memberCount++
    }
    return newUser
  },

  updateUser: (userId: string, updates: Partial<User>): User | undefined => {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      // Handle team change
      if (updates.teamId !== undefined && updates.teamId !== user.teamId) {
        // Decrease old team count
        if (user.teamId) {
          const oldTeam = mockTeams.find(t => t.id === user.teamId)
          if (oldTeam) oldTeam.memberCount--
        }
        // Increase new team count
        if (updates.teamId) {
          const newTeam = mockTeams.find(t => t.id === updates.teamId)
          if (newTeam) {
            newTeam.memberCount++
            updates.teamName = newTeam.name
          }
        } else {
          updates.teamName = undefined
        }
      }
      Object.assign(user, updates)
      return user
    }
    return undefined
  },

  deleteUser: (userId: string): boolean => {
    const idx = mockUsers.findIndex(u => u.id === userId)
    if (idx !== -1) {
      const user = mockUsers[idx]
      // Update team member count
      if (user.teamId) {
        const team = mockTeams.find(t => t.id === user.teamId)
        if (team) team.memberCount--
      }
      // If user was a team lead, clear that
      const ledTeam = mockTeams.find(t => t.leaderId === userId)
      if (ledTeam) {
        ledTeam.leaderId = undefined
        ledTeam.leaderName = undefined
      }
      // If user was a supervisor, clear from teams
      mockTeams.forEach(t => {
        if (t.supervisorId === userId) {
          t.supervisorId = undefined
          t.supervisorName = undefined
        }
      })
      mockUsers.splice(idx, 1)
      return true
    }
    return false
  },

  // Assign user to team
  assignUserToTeam: (userId: string, teamId: string | null): void => {
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      // Update old team count
      if (user.teamId) {
        const oldTeam = mockTeams.find(t => t.id === user.teamId)
        if (oldTeam) oldTeam.memberCount--
      }
      // Update new team
      if (teamId) {
        const newTeam = mockTeams.find(t => t.id === teamId)
        if (newTeam) {
          user.teamId = teamId
          user.teamName = newTeam.name
          newTeam.memberCount++
        }
      } else {
        user.teamId = undefined
        user.teamName = undefined
      }
    }
  },

  // Get team members
  getTeamMembers: (teamId: string): User[] => {
    return mockUsers.filter(u => u.teamId === teamId)
  },

  // Get supervisors
  getSupervisors: (): User[] => {
    return mockUsers.filter(u => u.role === 'supervisor')
  },

  // Get team leads
  getTeamLeads: (): User[] => {
    return mockUsers.filter(u => u.role === 'leadership')
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
  
  // Leaderboard - returns different rankings based on period
  getLeaderboard: (period: 'mtd' | 'qtd' | 'ytd' = 'mtd'): LeaderboardEntry[] => {
    // Simulate different rankings and values based on period
    const periodMultipliers: Record<string, number> = {
      'mtd': 1,
      'qtd': 2.8,
      'ytd': 11.5,
    }
    
    const multiplier = periodMultipliers[period] || 1
    
    // Current period rankings - determines who is #1, #2, etc for this period
    const periodRankings: Record<string, Record<string, number>> = {
      'mtd': {
        'user-1': 1, 'user-5': 2, 'user-4': 3, 'user-7': 4, 
        'user-8': 5, 'user-9': 6, 'user-10': 7, 'user-11': 8
      },
      'qtd': {
        'user-5': 1, 'user-1': 2, 'user-4': 3, 'user-8': 4,
        'user-7': 5, 'user-9': 6, 'user-10': 7, 'user-11': 8
      },
      'ytd': {
        'user-4': 1, 'user-5': 2, 'user-1': 3, 'user-9': 4,
        'user-8': 5, 'user-7': 6, 'user-10': 7, 'user-11': 8
      },
    }
    
    // Previous period rankings - what the rankings were before
    const previousPeriodRankings: Record<string, Record<string, number>> = {
      'mtd': {
        'user-1': 2, 'user-5': 1, 'user-4': 3, 'user-7': 5,
        'user-8': 4, 'user-9': 7, 'user-10': 6, 'user-11': 8
      },
      'qtd': {
        'user-5': 3, 'user-1': 1, 'user-4': 2, 'user-8': 5,
        'user-7': 4, 'user-9': 6, 'user-10': 8, 'user-11': 7
      },
      'ytd': {
        'user-4': 2, 'user-5': 1, 'user-1': 4, 'user-9': 3,
        'user-8': 6, 'user-7': 5, 'user-10': 7, 'user-11': 8
      },
    }
    
    const currentRanks = periodRankings[period] || periodRankings['mtd']
    const previousRanks = previousPeriodRankings[period] || previousPeriodRankings['mtd']
    
    return mockLeaderboard
      .map(entry => {
        const newRank = currentRanks[entry.agentId] || entry.rank
        const prevRank = previousRanks[entry.agentId] || entry.rank
        
        let trend: 'up' | 'down' | 'same' = 'same'
        if (newRank < prevRank) trend = 'up'
        else if (newRank > prevRank) trend = 'down'
        
        return {
          ...entry,
          rank: newRank,
          unitsClosed: Math.round(entry.unitsClosed * multiplier),
          debtLoadEnrolled: Math.round(entry.debtLoadEnrolled * multiplier),
          unitsEnrolled: Math.round(entry.unitsEnrolled * multiplier),
          totalCommissions: Math.round(entry.totalCommissions * multiplier),
          previousRank: prevRank,
          trend,
        }
      })
      .sort((a, b) => a.rank - b.rank)
  },
  
  // Pipeline
  getPipeline: (userId?: string): PipelineLoan[] => {
    if (userId) {
      return mockPipeline.filter(p => p.agentId === userId)
    }
    return mockPipeline
  },
  
  // Clients - for client search
  getClients: (agentId?: string, teamIds?: string[]): Client[] => {
    if (agentId) {
      // For agents - only their own clients
      return mockClients.filter(c => c.agentId === agentId)
    }
    if (teamIds && teamIds.length > 0) {
      // For supervisors - clients from their teams
      return mockClients.filter(c => teamIds.includes(c.teamId))
    }
    // For executives - all clients
    return mockClients
  },
  
  // Dashboard
  getDashboardMetrics,
  getTeamMetrics,
  
  // Monthly Target Metrics - returns different values based on selected month
  getMonthlyTargetMetrics: (month: string): { unitsEnrolled: number; debtLoadEnrolled: number; monthlyTargetUnits: number; monthlyTargetDebtLoad: number } => {
    // Mock data for different months (format: 'YYYY-MM')
    const monthlyData: Record<string, { unitsEnrolled: number; debtLoadEnrolled: number; monthlyTargetUnits: number; monthlyTargetDebtLoad: number }> = {
      '2026-04': { unitsEnrolled: 8, debtLoadEnrolled: 1850000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }, // Current month - partial
      '2026-03': { unitsEnrolled: 14, debtLoadEnrolled: 2780000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }, // Last month - almost hit
      '2026-02': { unitsEnrolled: 16, debtLoadEnrolled: 3250000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }, // Exceeded targets
      '2026-01': { unitsEnrolled: 12, debtLoadEnrolled: 2450000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }, // Below target
      '2025-12': { unitsEnrolled: 15, debtLoadEnrolled: 3100000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }, // Hit targets
      '2025-11': { unitsEnrolled: 11, debtLoadEnrolled: 2200000, monthlyTargetUnits: 14, monthlyTargetDebtLoad: 2800000 }, // Different targets
      '2025-10': { unitsEnrolled: 13, debtLoadEnrolled: 2650000, monthlyTargetUnits: 14, monthlyTargetDebtLoad: 2800000 },
    }
    
    return monthlyData[month] || { unitsEnrolled: 8, debtLoadEnrolled: 1850000, monthlyTargetUnits: 15, monthlyTargetDebtLoad: 3000000 }
  },
  
  // Dynamic user/team helpers - these update automatically when users change
  getAllTeamIds: (): string[] => {
    const teamIds = new Set<string>()
    mockUsers.forEach(u => {
      if (u.teamId) teamIds.add(u.teamId)
      if (u.teamIds) u.teamIds.forEach(id => teamIds.add(id))
    })
    return Array.from(teamIds)
  },
  
  getTeamLeads: (): User[] => {
    return mockUsers.filter(u => u.role === 'leadership')
  },
  
  getSupervisors: (): User[] => {
    return mockUsers.filter(u => u.role === 'supervisor')
  },
  
  getAgents: (): User[] => {
    return mockUsers.filter(u => u.role === 'agent')
  },
  
  // Agent Performance by Team (for team leaders)
  getAgentPerformanceByTeam: (teamId: string): AgentPerformance[] => {
    const teamAgents = mockUsers.filter(u => u.teamId === teamId && u.role === 'agent')
    const leaderboardData = mockLeaderboard
    
    return teamAgents.map(agent => {
      const leaderboardEntry = leaderboardData.find(l => l.agentId === agent.id)
      const now = new Date()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysPassed = now.getDate()
      const expectedProgress = (daysPassed / daysInMonth) * 100
      
      const unitsEnrolled = leaderboardEntry?.unitsClosed || Math.floor(Math.random() * 10) + 2
      const debtLoadEnrolled = leaderboardEntry?.debtLoadEnrolled || Math.floor(Math.random() * 2000000) + 500000
      const monthlyTargetUnits = 15
      const monthlyTargetDebtLoad = 3000000
      
      // Expected progress at this point in the month (as a decimal, e.g., 0.43 for day 13 of 30)
      const expectedProgressDecimal = daysPassed / daysInMonth
      
      // Calculate expected values at this point
      const expectedUnitsAtThisPoint = monthlyTargetUnits * expectedProgressDecimal
      const expectedDebtAtThisPoint = monthlyTargetDebtLoad * expectedProgressDecimal
      
      // Pacing = actual / expected at this point * 100
      // 100% = on pace, >100% = ahead, <100% = behind
      const pacingUnits = (unitsEnrolled / expectedUnitsAtThisPoint) * 100
      const pacingDebtLoad = (debtLoadEnrolled / expectedDebtAtThisPoint) * 100
      const pacing = (pacingUnits + pacingDebtLoad) / 2
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        avatar: agent.avatar,
        teamId: agent.teamId!,
        teamName: agent.teamName!,
        unitsSubmitted: Math.floor(unitsEnrolled * 1.3),
        debtLoadSubmitted: Math.floor(debtLoadEnrolled * 1.25),
        unitsEnrolled,
        debtLoadEnrolled,
        conversionRate: leaderboardEntry?.conversionRate || Math.floor(Math.random() * 20) + 55,
        ancillaryCount: Math.floor(Math.random() * 8) + 1, // Random ancillary sales 1-8
        performanceGrade: leaderboardEntry?.performanceGrade || 'B',
        monthlyTargetUnits,
        monthlyTargetDebtLoad,
        pacing,
        pacingUnits,
        pacingDebtLoad,
        trend: leaderboardEntry?.trend || 'same',
        // Call queue tier based on performance
        callQueueTier: pacing >= 130 ? 'champion' : pacing >= 115 ? 'titanium' : pacing >= 100 ? 'platinum' : pacing >= 85 ? 'diamond' : pacing >= 70 ? 'gold' : pacing >= 55 ? 'silver' : 'bronze',
      }
    }).sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)
  },
  
  // Agent Performance by Multiple Teams (for supervisors)
  getAgentPerformanceByTeams: (teamIds: string[]): AgentPerformance[] => {
    const allAgents: AgentPerformance[] = []
    teamIds.forEach(teamId => {
      const teamAgents = dataService.getAgentPerformanceByTeam(teamId)
      allAgents.push(...teamAgents)
    })
    return allAgents.sort((a, b) => b.debtLoadEnrolled - a.debtLoadEnrolled)
  },
  
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
  
  // Tasks
  getTasks: (userId?: string, teamId?: string): Task[] => {
    if (!userId) return mockTasks
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) return []
    
    // Role hierarchy: executive > supervisor > leadership > agent
    // Higher roles can see tasks assigned to lower roles in their chain
    const roleHierarchy: Record<string, number> = { executive: 4, supervisor: 3, leadership: 2, agent: 1 }
    const userRoleLevel = roleHierarchy[user.role] || 1
    
    return mockTasks.filter(task => {
      // Department-wide tasks are visible to everyone
      if (task.assignmentType === 'department') return true
      
      // Team tasks
      if (task.assignmentType === 'team') {
        // Executives see all team tasks
        if (user.role === 'executive') return true
        // Supervisors see tasks for their assigned teams
        if (user.role === 'supervisor' && user.teamIds) {
          return user.teamIds.includes(task.assignedToTeamId || '')
        }
        // Leadership/agents only see their own team's tasks
        return task.assignedToTeamId === user.teamId
      }
      
      // Individual tasks - hierarchical visibility
      if (task.assignmentType === 'individual') {
        // If task is assigned to current user, they see it
        if (task.assignedToId === userId) return true
        
        // Get the assigned user to check hierarchy
        const assignedUser = mockUsers.find(u => u.id === task.assignedToId)
        if (!assignedUser) return false
        
        const assignedRoleLevel = roleHierarchy[assignedUser.role] || 1
        
        // Executives can see all individual tasks
        if (user.role === 'executive') return true
        
        // Supervisors can see tasks for agents/leaders in their assigned teams
        if (user.role === 'supervisor' && user.teamIds) {
          return user.teamIds.includes(assignedUser.teamId || '')
        }
        
        // Leadership can see tasks assigned to agents on their team
        if (user.role === 'leadership' && assignedUser.role === 'agent') {
          return assignedUser.teamId === user.teamId
        }
        
        // Agents can only see tasks assigned directly to them (handled above)
        return false
      }
      
      return false
    }).sort((a, b) => {
      // Sort by status (pending/in_progress first), then by due date
      const statusOrder = { overdue: 0, pending: 1, in_progress: 2, completed: 3 }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  },
  
  getTaskById: (taskId: string): Task | undefined => {
    return mockTasks.find(t => t.id === taskId)
  },
  
  createTask: (task: Omit<Task, 'id' | 'createdDate' | 'completedBy'>): Task => {
    const newTask: Task = {
      ...task,
      id: `task-${randomId()}`,
      createdDate: new Date().toISOString(),
      completedBy: [],
    }
    mockTasks.push(newTask)
    return newTask
  },
  
  updateTaskStatus: (taskId: string, status: Task['status'], userId?: string): void => {
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      task.status = status
      if (status === 'completed') {
        task.completedDate = new Date().toISOString()
        if (userId && task.completedBy && !task.completedBy.includes(userId)) {
          task.completedBy.push(userId)
        }
      }
    }
  },
  
  markTaskComplete: (taskId: string, userId: string): void => {
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      if (task.assignmentType === 'individual') {
        task.status = 'completed'
        task.completedDate = new Date().toISOString()
      } else {
        // For team/department tasks, track individual completions
        if (!task.completedBy) task.completedBy = []
        if (!task.completedBy.includes(userId)) {
          task.completedBy.push(userId)
        }
      }
    }
  },

  // Tickets
  // Hierarchy: Agent tickets go to Team Lead, Team Lead tickets go to Supervisor
  // Supervisors have visibility over all tickets from teams they manage
  // Admin has full visibility and control
  getTickets: (userId: string): Ticket[] => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) return []

    return mockTickets.filter(ticket => {
      // User can see tickets they created
      if (ticket.createdById === userId) return true
      
      // User can see tickets assigned to them
      if (ticket.assignedToId === userId) return true
      
      // User can see tickets escalated to them
      if (ticket.escalatedToId === userId) return true
      
      // Leadership (Team Lead) can see tickets from agents on their team
      if (user.role === 'leadership' && ticket.createdByTeamId === user.teamId && ticket.createdByRole === 'agent') return true
      
      // Supervisors can see:
      // 1. Tickets from team leads on teams they manage
      // 2. All tickets from teams they manage (for visibility)
      if (user.role === 'supervisor') {
        // Supervisor sees tickets from teams they manage
        if (user.teamIds?.includes(ticket.createdByTeamId || '')) return true
        // Supervisor sees tickets escalated by team leads
        if (ticket.createdByRole === 'leadership') return true
      }
      
      // Admin can see all tickets
      if (user.role === 'admin') return true
      
      return false
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getTicketById: (ticketId: string): Ticket | undefined => {
    return mockTickets.find(t => t.id === ticketId)
  },

  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Ticket => {
    const newTicket: Ticket = {
      ...ticket,
      id: `ticket-${randomId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    }
    mockTickets.push(newTicket)
    return newTicket
  },

  updateTicketStatus: (ticketId: string, status: TicketStatus): void => {
    const ticket = mockTickets.find(t => t.id === ticketId)
    if (ticket) {
      ticket.status = status
      ticket.updatedAt = new Date().toISOString()
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date().toISOString()
      }
    }
  },

  escalateTicket: (ticketId: string, escalateToId: string): void => {
    const ticket = mockTickets.find(t => t.id === ticketId)
    const escalateTo = mockUsers.find(u => u.id === escalateToId)
    if (ticket && escalateTo) {
      ticket.status = 'escalated'
      ticket.escalatedToId = escalateTo.id
      ticket.escalatedToName = escalateTo.name
      ticket.escalatedToRole = escalateTo.role
      ticket.updatedAt = new Date().toISOString()
    }
  },

  addTicketComment: (ticketId: string, authorId: string, content: string): TicketComment | undefined => {
    const ticket = mockTickets.find(t => t.id === ticketId)
    const author = mockUsers.find(u => u.id === authorId)
    if (ticket && author) {
      const comment: TicketComment = {
        id: `comment-${randomId()}`,
        ticketId,
        authorId,
        authorName: author.name,
        authorRole: author.role,
        content,
        createdAt: new Date().toISOString(),
      }
      ticket.comments.push(comment)
      ticket.updatedAt = new Date().toISOString()
      return comment
    }
    return undefined
  },

  assignTicket: (ticketId: string, assignToId: string): void => {
    const ticket = mockTickets.find(t => t.id === ticketId)
    const assignTo = mockUsers.find(u => u.id === assignToId)
    if (ticket && assignTo) {
      ticket.assignedToId = assignTo.id
      ticket.assignedToName = assignTo.name
      ticket.assignedToRole = assignTo.role
      ticket.status = 'in_progress'
      ticket.updatedAt = new Date().toISOString()
    }
  },

  // Get users available for escalation based on role hierarchy
  // Agent -> Team Lead, Team Lead -> Supervisor/Admin, Supervisor -> Admin
  getEscalationTargets: (userId: string): User[] => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) return []

    const roleHierarchy: Record<UserRole, UserRole[]> = {
      'agent': ['leadership'], // Agents escalate to their team lead
      'leadership': ['supervisor', 'admin'], // Team leads escalate to supervisors or admin
      'supervisor': ['admin'], // Supervisors escalate to admin only
      'executive': [], // Executives don't use tickets
      'admin': [], // Admin is top level
    }

    const targetRoles = roleHierarchy[user.role] || []
    
    // For agents, only show team leads from their team
    if (user.role === 'agent') {
      return mockUsers.filter(u => 
        u.role === 'leadership' && 
        u.teamId === user.teamId && 
        u.status === 'active'
      )
    }
    
    return mockUsers.filter(u => targetRoles.includes(u.role) && u.status === 'active')
  },
}
