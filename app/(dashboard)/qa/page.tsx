'use client'

import * as React from 'react'
import { 
  ClipboardCheck, 
  TrendingUp, 
  TrendingDown,
  Users, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  FileText,
  Clock,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Timer,
  UserCheck,
  ListTodo,
  ChevronRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  X,
  Check,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { QAAnalystWorkload, QAAuditQueue, QASLAMetrics } from '@/lib/types'
import Link from 'next/link'

export default function QADashboardPage() {
  const { user } = useAuth()
  
  const isQASenior = user?.role === 'qa_senior' || user?.role === 'admin'
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_analyst' || user?.role === 'qa_trainer' || user?.role === 'admin'
  
  // State for data that can change
  const [analystWorkloads, setAnalystWorkloads] = React.useState<QAAnalystWorkload[]>([])
  const [slaMetrics, setSlaMetrics] = React.useState<QASLAMetrics | null>(null)
  const [auditQueue, setAuditQueue] = React.useState<QAAuditQueue[]>([])
  const [unassignedAudits, setUnassignedAudits] = React.useState<QAAuditQueue[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)
  const [selectedAuditToAssign, setSelectedAuditToAssign] = React.useState<QAAuditQueue | null>(null)
  const [selectedAnalystId, setSelectedAnalystId] = React.useState<string>('')
  const [isAssigning, setIsAssigning] = React.useState(false)
  
  // Analyst detail modal
  const [isAnalystDetailOpen, setIsAnalystDetailOpen] = React.useState(false)
  const [selectedAnalyst, setSelectedAnalyst] = React.useState<QAAnalystWorkload | null>(null)

  // Static metrics (don't change during session)
  const metrics = React.useMemo(() => dataService.getQAMetrics(), [])
  const recentEvaluations = React.useMemo(() => dataService.getEvaluations().slice(0, 5), [])
  const pendingEvaluations = React.useMemo(() => 
    dataService.getEvaluations({ status: 'submitted' }).length + 
    dataService.getEvaluations({ status: 'disputed' }).length
  , [])

  // Load data function
  const loadData = React.useCallback(() => {
    setAnalystWorkloads(dataService.getQAAnalystWorkloads())
    setSlaMetrics(dataService.getQASLAMetrics())
    setAuditQueue(dataService.getAuditQueue())
    setUnassignedAudits(dataService.getUnassignedAudits())
    setIsLoading(false)
  }, [])

  // Initial load
  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Handle opening assign modal
  const handleOpenAssignModal = (audit: QAAuditQueue) => {
    setSelectedAuditToAssign(audit)
    setSelectedAnalystId('')
    setIsAssignModalOpen(true)
  }

  // Handle assigning audit to analyst
  const handleAssignAudit = () => {
    if (!selectedAuditToAssign || !selectedAnalystId) {
      return
    }

    setIsAssigning(true)

    // Simulate API call delay
    setTimeout(() => {
      dataService.assignAudit(selectedAuditToAssign.id, selectedAnalystId)
      
      // Reload data to reflect changes
      loadData()
      
      setIsAssigning(false)
      setIsAssignModalOpen(false)
      setSelectedAuditToAssign(null)
      setSelectedAnalystId('')
    }, 500)
  }

  // Handle viewing analyst details
  const handleViewAnalystDetails = (analyst: QAAnalystWorkload) => {
    setSelectedAnalyst(analyst)
    setIsAnalystDetailOpen(true)
  }

  // Handle assigning audits to specific analyst
  const handleAssignToAnalyst = (analyst: QAAnalystWorkload) => {
    if (unassignedAudits.length > 0) {
      setSelectedAuditToAssign(unassignedAudits[0])
      setSelectedAnalystId(analyst.analystId)
      setIsAssignModalOpen(true)
    }
  }

  if (!isQA) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              The QA Dashboard is only accessible to Quality Analysts and Trainers.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success'
    if (grade.startsWith('B')) return 'text-info'
    if (grade.startsWith('C')) return 'text-warning'
    return 'text-destructive'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-info/10 text-info border-info/30">Pending Review</Badge>
      case 'acknowledged':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Acknowledged</Badge>
      case 'disputed':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Disputed</Badge>
      case 'resolved':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'high':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">High</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  if (isLoading || !slaMetrics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QA Dashboard</h1>
          <p className="text-muted-foreground">
            {isQASenior ? 'Quality assurance management and team oversight' : 'Quality assurance metrics and evaluations overview'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/qa/evaluate">
              <ClipboardCheck className="size-4 mr-2" />
              New Evaluation
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/qa/scorecards">
              <FileText className="size-4 mr-2" />
              Manage Scorecards
            </Link>
          </Button>
        </div>
      </div>

      {/* Senior QA Overview - SLA & Workload Stats */}
      {isQASenior && (
        <>
          {/* SLA Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className={cn(
              "relative overflow-hidden",
              slaMetrics.overdueAudits > 0 && "border-destructive/50"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue Audits</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      slaMetrics.overdueAudits > 0 ? "text-destructive" : "text-success"
                    )}>
                      {slaMetrics.overdueAudits}
                    </p>
                    {slaMetrics.overdueAudits > 0 && (
                      <p className="text-xs text-destructive mt-1">Requires attention</p>
                    )}
                  </div>
                  <div className={cn(
                    "size-12 rounded-full flex items-center justify-center",
                    slaMetrics.overdueAudits > 0 ? "bg-destructive/10" : "bg-success/10"
                  )}>
                    <AlertCircle className={cn(
                      "size-6",
                      slaMetrics.overdueAudits > 0 ? "text-destructive" : "text-success"
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Due Today</p>
                    <p className="text-3xl font-bold text-warning">{slaMetrics.dueTodayAudits}</p>
                    <p className="text-xs text-muted-foreground mt-1">Needs completion</p>
                  </div>
                  <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Calendar className="size-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pending</p>
                    <p className="text-3xl font-bold">{slaMetrics.totalPendingAudits}</p>
                    <p className="text-xs text-muted-foreground mt-1">In queue</p>
                  </div>
                  <div className="size-12 rounded-full bg-info/10 flex items-center justify-center">
                    <ListTodo className="size-6 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Turnaround</p>
                    <p className="text-3xl font-bold">{slaMetrics.avgTurnaroundTime}h</p>
                    <p className="text-xs text-muted-foreground mt-1">Target: {slaMetrics.slaTarget}h</p>
                  </div>
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Timer className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Compliance</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      slaMetrics.slaComplianceRate >= 90 ? "text-success" : 
                      slaMetrics.slaComplianceRate >= 80 ? "text-warning" : "text-destructive"
                    )}>
                      {slaMetrics.slaComplianceRate}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Team average</p>
                  </div>
                  <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                    <UserCheck className="size-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analyst Workload Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    QA Analyst Workload
                  </CardTitle>
                  <CardDescription>Monitor team capacity, pending audits, and SLA compliance</CardDescription>
                </div>
                <Badge variant="outline" className="text-sm">
                  {unassignedAudits.length} unassigned
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analyst</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Overdue</TableHead>
                    <TableHead className="text-center">Today</TableHead>
                    <TableHead className="text-center">This Week</TableHead>
                    <TableHead className="text-center">Monthly Target</TableHead>
                    <TableHead className="text-center">Avg Turnaround</TableHead>
                    <TableHead className="text-center">SLA %</TableHead>
                    <TableHead className="text-center">Calibration</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analystWorkloads.map((analyst) => {
                    const monthlyProgress = (analyst.completedThisMonth / analyst.monthlyTarget) * 100
                    const weeklyProgress = (analyst.completedThisWeek / analyst.weeklyTarget) * 100
                    
                    return (
                      <TableRow key={analyst.analystId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={analyst.avatar} />
                              <AvatarFallback className="text-xs">
                                {analyst.analystName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{analyst.analystName}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {analyst.role.replace('qa_', '').replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-semibold",
                            analyst.pendingAudits > 15 ? "text-destructive" :
                            analyst.pendingAudits > 10 ? "text-warning" : ""
                          )}>
                            {analyst.pendingAudits}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {analyst.overdueAudits > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {analyst.overdueAudits}
                            </Badge>
                          ) : (
                            <span className="text-success">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{analyst.completedToday}</span>
                          <span className="text-muted-foreground text-xs">/{analyst.dailyTarget}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-medium text-sm">{analyst.completedThisWeek}</span>
                            <Progress 
                              value={Math.min(weeklyProgress, 100)} 
                              className="h-1 w-12"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">
                              {analyst.completedThisMonth}
                              <span className="text-muted-foreground">/{analyst.monthlyTarget}</span>
                            </span>
                            <Progress 
                              value={Math.min(monthlyProgress, 100)} 
                              className={cn(
                                "h-1.5 w-16",
                                monthlyProgress < 50 && "[&>div]:bg-destructive",
                                monthlyProgress >= 50 && monthlyProgress < 80 && "[&>div]:bg-warning"
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium",
                            analyst.avgTurnaroundHours <= 24 ? "text-success" :
                            analyst.avgTurnaroundHours <= 36 ? "text-warning" : "text-destructive"
                          )}>
                            {analyst.avgTurnaroundHours}h
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-semibold",
                            analyst.slaComplianceRate >= 95 ? "text-success" :
                            analyst.slaComplianceRate >= 85 ? "text-warning" : "text-destructive"
                          )}>
                            {analyst.slaComplianceRate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-sm",
                            analyst.calibrationScore >= 95 ? "text-success" :
                            analyst.calibrationScore >= 90 ? "text-warning" : "text-destructive"
                          )}>
                            {analyst.calibrationScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewAnalystDetails(analyst)}>
                                <Eye className="size-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleAssignToAnalyst(analyst)}
                                disabled={unassignedAudits.length === 0}
                              >
                                <UserPlus className="size-4 mr-2" />
                                Assign Audits
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <BarChart3 className="size-4 mr-2" />
                                Performance Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Audit Queue & Unassigned */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Urgent/High Priority Audits */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="size-4 text-warning" />
                    Priority Audits
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/qa/queue">
                      View All
                      <ChevronRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditQueue
                  .filter(a => a.priority !== 'normal' && a.status !== 'completed')
                  .slice(0, 5)
                  .map((audit) => {
                    const isOverdue = new Date(audit.dueDate) < new Date()
                    return (
                      <div 
                        key={audit.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border",
                          isOverdue && "border-destructive/50 bg-destructive/5"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{audit.agentName}</span>
                            {getPriorityBadge(audit.priority)}
                            {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {audit.reason} - {audit.agentTeamName}
                          </p>
                        </div>
                        <div className="text-right">
                          {audit.assignedToName ? (
                            <p className="text-xs text-muted-foreground">{audit.assignedToName}</p>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenAssignModal(audit)}
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                {auditQueue.filter(a => a.priority !== 'normal' && a.status !== 'completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No priority audits pending
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Unassigned Audits */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ListTodo className="size-4 text-info" />
                    Unassigned Audits
                  </CardTitle>
                  <Badge variant="outline">{unassignedAudits.length} pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {unassignedAudits.slice(0, 5).map((audit) => (
                  <div 
                    key={audit.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{audit.agentName}</span>
                        {getPriorityBadge(audit.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {audit.callType} call - {Math.floor(audit.callDuration / 60)}m {audit.callDuration % 60}s
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenAssignModal(audit)}
                    >
                      <UserPlus className="size-3 mr-1" />
                      Assign
                    </Button>
                  </div>
                ))}
                {unassignedAudits.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All audits are assigned
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* QA Performance Metrics - Shown to all QA */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="evaluations">Recent Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg QC Score</p>
                    <p className="text-3xl font-bold">{metrics.avgScore.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metrics.avgScoreChange >= 0 ? (
                        <TrendingUp className="size-3 text-success" />
                      ) : (
                        <TrendingDown className="size-3 text-destructive" />
                      )}
                      <span className={cn(
                        "text-xs",
                        metrics.avgScoreChange >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {metrics.avgScoreChange >= 0 ? '+' : ''}{metrics.avgScoreChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                    <p className="text-3xl font-bold">{metrics.passRate.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metrics.passRateChange >= 0 ? (
                        <TrendingUp className="size-3 text-success" />
                      ) : (
                        <TrendingDown className="size-3 text-destructive" />
                      )}
                      <span className={cn(
                        "text-xs",
                        metrics.passRateChange >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {metrics.passRateChange >= 0 ? '+' : ''}{metrics.passRateChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                    <p className="text-3xl font-bold">{metrics.totalEvaluations}</p>
                    <p className="text-xs text-muted-foreground mt-1">This period</p>
                  </div>
                  <div className="size-12 rounded-full bg-info/10 flex items-center justify-center">
                    <ClipboardCheck className="size-6 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    <p className="text-3xl font-bold">{pendingEvaluations}</p>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
                  </div>
                  <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="size-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Category Scores */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  Category Performance
                </CardTitle>
                <CardDescription>Average scores by evaluation category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.categoryScores.map((cat) => {
                    const categoryLabels: Record<string, string> = {
                      opening: 'Opening',
                      discovery: 'Discovery',
                      presentation: 'Presentation',
                      objection_handling: 'Objection Handling',
                      closing: 'Closing',
                      compliance: 'Compliance',
                      professionalism: 'Professionalism',
                    }
                    return (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{categoryLabels[cat.category]}</span>
                          <span className={cn(
                            "font-semibold",
                            cat.avgScore >= 85 ? "text-success" : cat.avgScore >= 70 ? "text-warning" : "text-destructive"
                          )}>
                            {cat.avgScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={cat.avgScore} 
                          className="h-2"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers & Needs Coaching */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="size-4 text-success" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.topPerformers.slice(0, 3).map((agent, idx) => (
                      <div key={agent.agentId} className="flex items-center gap-3">
                        <div className={cn(
                          "size-6 rounded-full flex items-center justify-center text-xs font-bold",
                          idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                          idx === 1 ? "bg-gray-400/20 text-gray-400" :
                          "bg-orange-500/20 text-orange-500"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.agentName}</p>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          {agent.avgScore.toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="size-4 text-warning" />
                    Needs Coaching
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.needsCoaching.length > 0 ? (
                    <div className="space-y-3">
                      {metrics.needsCoaching.slice(0, 3).map((agent) => (
                        <div key={agent.agentId} className="flex items-center gap-3">
                          <div className="size-6 rounded-full bg-warning/10 flex items-center justify-center">
                            <AlertTriangle className="size-3 text-warning" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{agent.agentName}</p>
                          </div>
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                            {agent.avgScore.toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All agents meeting standards
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evaluations">
          {/* Recent Evaluations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Evaluations</CardTitle>
                  <CardDescription>Latest QC evaluations submitted</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/qa/evaluations">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Call Date</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Evaluator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${evaluation.agentName}`} />
                            <AvatarFallback>{evaluation.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{evaluation.agentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{evaluation.agentTeamName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(evaluation.callDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-semibold",
                          evaluation.totalScore >= 85 ? "text-success" : 
                          evaluation.totalScore >= 70 ? "text-warning" : "text-destructive"
                        )}>
                          {evaluation.totalScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("font-semibold", getGradeColor(evaluation.grade))}>
                          {evaluation.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(evaluation.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{evaluation.evaluatorName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Audit Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Audit</DialogTitle>
            <DialogDescription>
              Select a QA analyst to assign this audit to
            </DialogDescription>
          </DialogHeader>
          
          {selectedAuditToAssign && (
            <div className="space-y-4">
              {/* Audit Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedAuditToAssign.agentName}</span>
                  {getPriorityBadge(selectedAuditToAssign.priority)}
                </div>
                <p className="text-sm text-muted-foreground">{selectedAuditToAssign.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedAuditToAssign.callType} call - {Math.floor(selectedAuditToAssign.callDuration / 60)}m {selectedAuditToAssign.callDuration % 60}s
                </p>
              </div>

              {/* Analyst Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to</label>
                <Select value={selectedAnalystId} onValueChange={setSelectedAnalystId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an analyst" />
                  </SelectTrigger>
                  <SelectContent>
                    {analystWorkloads.map((analyst) => (
                      <SelectItem key={analyst.analystId} value={analyst.analystId}>
                        <div className="flex items-center gap-2">
                          <span>{analyst.analystName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({analyst.pendingAudits} pending)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignAudit}
              disabled={!selectedAnalystId || isAssigning}
            >
              {isAssigning ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check className="size-4 mr-2" />
                  Assign Audit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analyst Detail Modal */}
      <Dialog open={isAnalystDetailOpen} onOpenChange={setIsAnalystDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analyst Details</DialogTitle>
          </DialogHeader>
          
          {selectedAnalyst && (
            <div className="space-y-6">
              {/* Analyst Header */}
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={selectedAnalyst.avatar} />
                  <AvatarFallback>
                    {selectedAnalyst.analystName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedAnalyst.analystName}</h3>
                  <p className="text-muted-foreground capitalize">
                    {selectedAnalyst.role.replace('qa_', '').replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedAnalyst.pendingAudits}</p>
                  <p className="text-xs text-muted-foreground">Pending Audits</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-destructive">{selectedAnalyst.overdueAudits}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedAnalyst.completedToday}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedAnalyst.completedThisWeek}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Target Progress</span>
                    <span className="text-sm font-medium">
                      {selectedAnalyst.completedThisMonth} / {selectedAnalyst.monthlyTarget}
                    </span>
                  </div>
                  <Progress 
                    value={(selectedAnalyst.completedThisMonth / selectedAnalyst.monthlyTarget) * 100} 
                    className="h-2"
                  />
                  
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Turnaround</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        selectedAnalyst.avgTurnaroundHours <= 24 ? "text-success" : 
                        selectedAnalyst.avgTurnaroundHours <= 36 ? "text-warning" : "text-destructive"
                      )}>
                        {selectedAnalyst.avgTurnaroundHours}h
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SLA Compliance</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        selectedAnalyst.slaComplianceRate >= 95 ? "text-success" : 
                        selectedAnalyst.slaComplianceRate >= 85 ? "text-warning" : "text-destructive"
                      )}>
                        {selectedAnalyst.slaComplianceRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calibration Score</p>
                      <p className={cn(
                        "text-lg font-semibold",
                        selectedAnalyst.calibrationScore >= 95 ? "text-success" : 
                        selectedAnalyst.calibrationScore >= 90 ? "text-warning" : "text-destructive"
                      )}>
                        {selectedAnalyst.calibrationScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalystDetailOpen(false)}>
              Close
            </Button>
            {selectedAnalyst && unassignedAudits.length > 0 && (
              <Button onClick={() => {
                setIsAnalystDetailOpen(false)
                handleAssignToAnalyst(selectedAnalyst)
              }}>
                <UserPlus className="size-4 mr-2" />
                Assign Audits
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
