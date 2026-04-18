'use client'

import * as React from 'react'
import { 
  ClipboardCheck, 
  Save,
  Send,
  ChevronLeft,
  Phone,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ScorecardTemplate, ScorecardCriterion, EvaluationScore, ScorecardCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<ScorecardCategory, string> = {
  opening: 'Opening',
  discovery: 'Discovery',
  presentation: 'Presentation',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
  compliance: 'Compliance',
  professionalism: 'Professionalism',
}

const CATEGORY_COLORS: Record<ScorecardCategory, string> = {
  opening: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  discovery: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  presentation: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
  objection_handling: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  closing: 'bg-green-500/10 text-green-500 border-green-500/30',
  compliance: 'bg-red-500/10 text-red-500 border-red-500/30',
  professionalism: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
}

export default function EvaluatePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_trainer' || user?.role === 'admin'
  
  const templates = React.useMemo(() => dataService.getScorecardTemplates(), [])
  const agents = React.useMemo(() => dataService.getAgentsForQA(), [])
  
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('')
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>('')
  const [callId, setCallId] = React.useState('')
  const [callDate, setCallDate] = React.useState('')
  const [callDuration, setCallDuration] = React.useState('')
  const [callType, setCallType] = React.useState<'inbound' | 'outbound' | 'transfer' | 'callback'>('inbound')
  const [clientName, setClientName] = React.useState('')
  
  const [scores, setScores] = React.useState<Record<string, { score: number; notes: string }>>({})
  const [strengths, setStrengths] = React.useState<string[]>([''])
  const [improvements, setImprovements] = React.useState<string[]>([''])
  const [coachingNotes, setCoachingNotes] = React.useState('')
  const [actionItems, setActionItems] = React.useState<string[]>([''])
  
  const selectedTemplate = React.useMemo(() => 
    templates.find(t => t.id === selectedTemplateId)
  , [templates, selectedTemplateId])
  
  const selectedAgent = React.useMemo(() =>
    agents.find(a => a.id === selectedAgentId)
  , [agents, selectedAgentId])

  // Calculate total score
  const { totalScore, grade, hasAutoFail, autoFailReasons } = React.useMemo(() => {
    if (!selectedTemplate) return { totalScore: 0, grade: 'F' as const, hasAutoFail: false, autoFailReasons: [] }
    
    let weightedSum = 0
    let totalWeight = 0
    const autoFailReasons: string[] = []
    let hasAutoFail = false
    
    selectedTemplate.criteria.forEach(criterion => {
      const scoreData = scores[criterion.id]
      const score = scoreData?.score ?? 0
      const percentage = (score / criterion.maxPoints) * 100
      
      // Check for auto-fail on required criteria
      if (criterion.isRequired && score === 0) {
        hasAutoFail = true
        autoFailReasons.push(criterion.name)
      }
      
      weightedSum += percentage * criterion.weight
      totalWeight += criterion.weight
    })
    
    const totalScore = totalWeight > 0 ? weightedSum / totalWeight : 0
    
    let grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F'
    if (hasAutoFail) grade = 'F'
    else if (totalScore >= 95) grade = 'A+'
    else if (totalScore >= 90) grade = 'A'
    else if (totalScore >= 87) grade = 'A-'
    else if (totalScore >= 83) grade = 'B+'
    else if (totalScore >= 80) grade = 'B'
    else if (totalScore >= 77) grade = 'B-'
    else if (totalScore >= 73) grade = 'C+'
    else if (totalScore >= 70) grade = 'C'
    else if (totalScore >= 67) grade = 'C-'
    else if (totalScore >= 60) grade = 'D'
    else grade = 'F'
    
    return { totalScore, grade, hasAutoFail, autoFailReasons }
  }, [selectedTemplate, scores])

  const handleScoreChange = (criterionId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score, notes: prev[criterionId]?.notes || '' }
    }))
  }

  const handleNotesChange = (criterionId: string, notes: string) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], notes, score: prev[criterionId]?.score ?? 0 }
    }))
  }

  const addStrength = () => setStrengths(prev => [...prev, ''])
  const removeStrength = (idx: number) => setStrengths(prev => prev.filter((_, i) => i !== idx))
  const updateStrength = (idx: number, value: string) => setStrengths(prev => prev.map((s, i) => i === idx ? value : s))

  const addImprovement = () => setImprovements(prev => [...prev, ''])
  const removeImprovement = (idx: number) => setImprovements(prev => prev.filter((_, i) => i !== idx))
  const updateImprovement = (idx: number, value: string) => setImprovements(prev => prev.map((s, i) => i === idx ? value : s))

  const addActionItem = () => setActionItems(prev => [...prev, ''])
  const removeActionItem = (idx: number) => setActionItems(prev => prev.filter((_, i) => i !== idx))
  const updateActionItem = (idx: number, value: string) => setActionItems(prev => prev.map((s, i) => i === idx ? value : s))

  const handleSubmit = (isDraft: boolean) => {
    if (!selectedTemplate || !selectedAgent || !user) return

    const evaluationScores: EvaluationScore[] = selectedTemplate.criteria.map(c => ({
      criterionId: c.id,
      score: scores[c.id]?.score ?? 0,
      notes: scores[c.id]?.notes,
      passed: (scores[c.id]?.score ?? 0) > 0 || !c.isRequired,
    }))

    dataService.createEvaluation({
      scorecardTemplateId: selectedTemplate.id,
      scorecardTemplateName: selectedTemplate.name,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      agentTeamId: selectedAgent.teamId || '',
      agentTeamName: selectedAgent.teamName || '',
      evaluatorId: user.id,
      evaluatorName: user.name,
      evaluatorRole: user.role,
      callId,
      callDate: callDate || new Date().toISOString(),
      callDuration: callDuration ? parseInt(callDuration) : undefined,
      callType,
      clientName,
      scores: evaluationScores,
      totalScore,
      grade,
      passed: totalScore >= (selectedTemplate.passingScore || 70) && !hasAutoFail,
      hasAutoFail,
      autoFailReason: autoFailReasons.join(', '),
      strengths: strengths.filter(s => s.trim()),
      areasForImprovement: improvements.filter(s => s.trim()),
      coachingNotes,
      actionItems: actionItems.filter(s => s.trim()),
      status: isDraft ? 'draft' : 'submitted',
      submittedAt: isDraft ? undefined : new Date().toISOString(),
    })

    router.push('/qa/evaluations')
  }

  if (!isQA) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Only Quality Analysts can create evaluations.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/qa">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">New Evaluation</h1>
          <p className="text-muted-foreground">Score an agent call using a quality scorecard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={!selectedTemplate || !selectedAgent}>
            <Save className="size-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={!selectedTemplate || !selectedAgent}>
            <Send className="size-4 mr-2" />
            Submit
          </Button>
        </div>
      </div>

      {/* Score Summary Card */}
      {selectedTemplate && (
        <Card className={cn(
          "border-2",
          hasAutoFail ? "border-destructive/50 bg-destructive/5" :
          totalScore >= 85 ? "border-success/50 bg-success/5" :
          totalScore >= 70 ? "border-warning/50 bg-warning/5" :
          "border-muted"
        )}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold">{totalScore.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <Badge className={cn(
                    "text-xl px-4 py-1",
                    grade.startsWith('A') ? "bg-success/20 text-success" :
                    grade.startsWith('B') ? "bg-info/20 text-info" :
                    grade.startsWith('C') ? "bg-warning/20 text-warning" :
                    "bg-destructive/20 text-destructive"
                  )}>
                    {grade}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Grade</p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  {totalScore >= (selectedTemplate.passingScore || 70) && !hasAutoFail ? (
                    <CheckCircle2 className="size-8 text-success mx-auto" />
                  ) : (
                    <XCircle className="size-8 text-destructive mx-auto" />
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {totalScore >= (selectedTemplate.passingScore || 70) && !hasAutoFail ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
              {hasAutoFail && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  <div>
                    <p className="font-semibold">Auto-Fail Triggered</p>
                    <p className="text-sm">{autoFailReasons.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Setup */}
        <div className="space-y-6">
          {/* Call Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="size-5" />
                Call Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Scorecard Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scorecard..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} ({a.teamName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call ID</Label>
                  <Input 
                    placeholder="CALL-2024-..."
                    value={callId}
                    onChange={(e) => setCallId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Call Type</Label>
                  <Select value={callType} onValueChange={(v) => setCallType(v as typeof callType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="callback">Callback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call Date</Label>
                  <Input 
                    type="date"
                    value={callDate}
                    onChange={(e) => setCallDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (sec)</Label>
                  <Input 
                    type="number"
                    placeholder="600"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input 
                  placeholder="John Smith"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Scoring */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <>
              {/* Criteria by Category */}
              {selectedTemplate.categories.map(cat => (
                <Card key={cat.category}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline" className={CATEGORY_COLORS[cat.category]}>
                          {CATEGORY_LABELS[cat.category]}
                        </Badge>
                        <span className="text-muted-foreground font-normal text-sm">
                          ({cat.weight}% weight)
                        </span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cat.criteria.map(critId => {
                      const criterion = selectedTemplate.criteria.find(c => c.id === critId)
                      if (!criterion) return null
                      
                      const scoreData = scores[criterion.id] || { score: 0, notes: '' }
                      const percentage = (scoreData.score / criterion.maxPoints) * 100
                      
                      return (
                        <div key={criterion.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{criterion.name}</p>
                                {criterion.isRequired && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Badge variant="destructive" className="text-xs">Required</Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Scoring 0 on this criterion results in auto-fail</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {criterion.isCritical && (
                                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{criterion.description}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-2xl font-bold",
                                percentage >= 80 ? "text-success" :
                                percentage >= 60 ? "text-warning" :
                                percentage > 0 ? "text-destructive" :
                                "text-muted-foreground"
                              )}>
                                {scoreData.score}/{criterion.maxPoints}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[scoreData.score]}
                              onValueChange={([v]) => handleScoreChange(criterion.id, v)}
                              max={criterion.maxPoints}
                              step={1}
                              className="flex-1"
                            />
                            <div className="flex gap-1">
                              {Array.from({ length: criterion.maxPoints + 1 }, (_, i) => (
                                <Button
                                  key={i}
                                  variant={scoreData.score === i ? "default" : "outline"}
                                  size="sm"
                                  className="size-8 p-0"
                                  onClick={() => handleScoreChange(criterion.id, i)}
                                >
                                  {i}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <Input
                            placeholder="Add notes for this criterion..."
                            value={scoreData.notes}
                            onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}

              {/* Feedback Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback & Coaching</CardTitle>
                  <CardDescription>Provide constructive feedback for the agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-success" />
                        Strengths
                      </Label>
                      <Button variant="ghost" size="sm" onClick={addStrength}>
                        <Plus className="size-4 mr-1" /> Add
                      </Button>
                    </div>
                    {strengths.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="What did the agent do well?"
                          value={s}
                          onChange={(e) => updateStrength(idx, e.target.value)}
                        />
                        {strengths.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeStrength(idx)}>
                            <Trash2 className="size-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Areas for Improvement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-warning" />
                        Areas for Improvement
                      </Label>
                      <Button variant="ghost" size="sm" onClick={addImprovement}>
                        <Plus className="size-4 mr-1" /> Add
                      </Button>
                    </div>
                    {improvements.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="What could be improved?"
                          value={s}
                          onChange={(e) => updateImprovement(idx, e.target.value)}
                        />
                        {improvements.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeImprovement(idx)}>
                            <Trash2 className="size-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Coaching Notes */}
                  <div className="space-y-2">
                    <Label>Coaching Notes</Label>
                    <Textarea
                      placeholder="Additional notes for coaching session..."
                      value={coachingNotes}
                      onChange={(e) => setCoachingNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Action Items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Action Items</Label>
                      <Button variant="ghost" size="sm" onClick={addActionItem}>
                        <Plus className="size-4 mr-1" /> Add
                      </Button>
                    </div>
                    {actionItems.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="Specific action for improvement..."
                          value={s}
                          onChange={(e) => updateActionItem(idx, e.target.value)}
                        />
                        {actionItems.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeActionItem(idx)}>
                            <Trash2 className="size-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a Scorecard Template</p>
                <p className="text-muted-foreground">Choose a scorecard and agent to begin the evaluation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
