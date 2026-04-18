'use client'

import * as React from 'react'
import { 
  ClipboardCheck, 
  TrendingUp, 
  TrendingDown,
  Users, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  FileText,
  Clock,
  Target,
  Award,
  Minus,
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
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import Link from 'next/link'

export default function QADashboardPage() {
  const { user } = useAuth()
  
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_trainer' || user?.role === 'admin'
  
  const metrics = React.useMemo(() => dataService.getQAMetrics(), [])
  const recentEvaluations = React.useMemo(() => dataService.getEvaluations().slice(0, 5), [])
  const pendingEvaluations = React.useMemo(() => 
    dataService.getEvaluations({ status: 'submitted' }).length + 
    dataService.getEvaluations({ status: 'disputed' }).length
  , [])

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QA Dashboard</h1>
          <p className="text-muted-foreground">Quality assurance metrics and evaluations overview</p>
        </div>
        <div className="flex gap-2">
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
    </div>
  )
}
