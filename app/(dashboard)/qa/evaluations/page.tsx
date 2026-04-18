'use client'

import * as React from 'react'
import { 
  ClipboardCheck, 
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  MoreHorizontal,
  Phone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService, mockTeams } from '@/lib/mock-data'
import Link from 'next/link'
import type { QAEvaluation } from '@/lib/types'

export default function EvaluationsListPage() {
  const { user } = useAuth()
  
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_analyst' || user?.role === 'qa_trainer' || user?.role === 'admin'
  
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [teamFilter, setTeamFilter] = React.useState<string>('all')
  const [selectedEvaluation, setSelectedEvaluation] = React.useState<QAEvaluation | null>(null)
  
  const evaluations = React.useMemo(() => {
    let results = dataService.getEvaluations()
    
    if (statusFilter !== 'all') {
      results = results.filter(e => e.status === statusFilter)
    }
    if (teamFilter !== 'all') {
      results = results.filter(e => e.agentTeamId === teamFilter)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(e => 
        e.agentName.toLowerCase().includes(searchLower) ||
        e.callId?.toLowerCase().includes(searchLower) ||
        e.clientName?.toLowerCase().includes(searchLower)
      )
    }
    
    return results
  }, [statusFilter, teamFilter, search])

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success bg-success/10 border-success/30'
    if (grade.startsWith('B')) return 'text-info bg-info/10 border-info/30'
    if (grade.startsWith('C')) return 'text-warning bg-warning/10 border-warning/30'
    return 'text-destructive bg-destructive/10 border-destructive/30'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-muted">Draft</Badge>
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isQA) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              The Evaluations page is only accessible to Quality Analysts.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Evaluations</h1>
          <p className="text-muted-foreground">View and manage all QC evaluations</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/qa/evaluate">
              <ClipboardCheck className="size-4 mr-2" />
              New Evaluation
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by agent, call ID, or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Pending Review</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {mockTeams.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Call Details</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Pass/Fail</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Evaluator</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No evaluations found
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow 
                    key={evaluation.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEvaluation(evaluation)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${evaluation.agentName}`} />
                          <AvatarFallback>{evaluation.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{evaluation.agentName}</p>
                          <p className="text-xs text-muted-foreground">{evaluation.agentTeamName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="size-3 text-muted-foreground" />
                          <span className="capitalize">{evaluation.callType}</span>
                          <span className="text-muted-foreground">|</span>
                          <Clock className="size-3 text-muted-foreground" />
                          <span>{formatDuration(evaluation.callDuration)}</span>
                        </div>
                        {evaluation.clientName && (
                          <p className="text-xs text-muted-foreground">Client: {evaluation.clientName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-bold text-lg",
                        evaluation.totalScore >= 85 ? "text-success" : 
                        evaluation.totalScore >= 70 ? "text-warning" : "text-destructive"
                      )}>
                        {evaluation.totalScore}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("font-bold", getGradeColor(evaluation.grade))}>
                        {evaluation.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {evaluation.hasAutoFail ? (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="size-3" />
                          Auto-Fail
                        </Badge>
                      ) : evaluation.passed ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
                          <CheckCircle2 className="size-3" />
                          Pass
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                          <XCircle className="size-3" />
                          Fail
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(evaluation.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {evaluation.evaluatorName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(evaluation.callDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedEvaluation(evaluation); }}>
                            <Eye className="size-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="size-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evaluation Detail Dialog */}
      <Dialog open={!!selectedEvaluation} onOpenChange={(open) => !open && setSelectedEvaluation(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedEvaluation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEvaluation.agentName}`} />
                    <AvatarFallback>{selectedEvaluation.agentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedEvaluation.agentName}</p>
                    <p className="text-sm font-normal text-muted-foreground">{selectedEvaluation.scorecardTemplateName}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Score Summary */}
                <div className="flex items-center justify-around p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className={cn(
                      "text-4xl font-bold",
                      selectedEvaluation.totalScore >= 85 ? "text-success" : 
                      selectedEvaluation.totalScore >= 70 ? "text-warning" : "text-destructive"
                    )}>
                      {selectedEvaluation.totalScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    <Badge className={cn("text-xl px-4 py-1", getGradeColor(selectedEvaluation.grade))}>
                      {selectedEvaluation.grade}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">Grade</p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    {selectedEvaluation.passed && !selectedEvaluation.hasAutoFail ? (
                      <CheckCircle2 className="size-10 text-success mx-auto" />
                    ) : (
                      <XCircle className="size-10 text-destructive mx-auto" />
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedEvaluation.passed && !selectedEvaluation.hasAutoFail ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>

                {selectedEvaluation.hasAutoFail && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-5" />
                    <div>
                      <p className="font-semibold">Auto-Fail Triggered</p>
                      <p className="text-sm">{selectedEvaluation.autoFailReason}</p>
                    </div>
                  </div>
                )}

                {/* Call Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Call Type</p>
                    <p className="font-medium capitalize">{selectedEvaluation.callType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(selectedEvaluation.callDuration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Call Date</p>
                    <p className="font-medium">{new Date(selectedEvaluation.callDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium">{selectedEvaluation.clientName || '-'}</p>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-success" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {selectedEvaluation.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-success mt-1">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <AlertTriangle className="size-4 text-warning" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {selectedEvaluation.areasForImprovement.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-warning mt-1">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Coaching Notes */}
                {selectedEvaluation.coachingNotes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">Coaching Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvaluation.coachingNotes}</p>
                  </div>
                )}

                {/* Action Items */}
                {selectedEvaluation.actionItems && selectedEvaluation.actionItems.length > 0 && (
                  <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                    <h4 className="font-semibold mb-3">Action Items</h4>
                    <ul className="space-y-2">
                      {selectedEvaluation.actionItems.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="size-5 rounded bg-info/20 text-info flex items-center justify-center text-xs shrink-0">
                            {i + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dispute Section */}
                {selectedEvaluation.status === 'disputed' && selectedEvaluation.disputeReason && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <h4 className="font-semibold flex items-center gap-2 mb-2 text-warning">
                      <AlertTriangle className="size-4" />
                      Dispute Reason
                    </h4>
                    <p className="text-sm">{selectedEvaluation.disputeReason}</p>
                  </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <p>Evaluated by {selectedEvaluation.evaluatorName}</p>
                  <p>Submitted {selectedEvaluation.submittedAt ? new Date(selectedEvaluation.submittedAt).toLocaleString() : '-'}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
