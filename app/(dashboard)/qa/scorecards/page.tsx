'use client'

import * as React from 'react'
import { 
  FileText, 
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import Link from 'next/link'
import type { ScorecardTemplate, ScorecardCategory } from '@/lib/types'

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

export default function ScorecardsPage() {
  const { user } = useAuth()
  
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_trainer' || user?.role === 'admin'
  const canManage = user?.role === 'qa_senior' || user?.role === 'admin'
  
  const templates = React.useMemo(() => dataService.getAllScorecardTemplates(), [])
  const [selectedTemplate, setSelectedTemplate] = React.useState<ScorecardTemplate | null>(null)

  if (!isQA) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Scorecard templates are only accessible to Quality Analysts.
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
          <h1 className="text-2xl font-bold">Scorecard Templates</h1>
          <p className="text-muted-foreground">Manage QA evaluation templates and criteria</p>
        </div>
        {canManage && (
          <Button>
            <Plus className="size-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card 
            key={template.id} 
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              template.isActive ? "border-primary/30" : "opacity-60"
            )}
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {template.isActive ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {template.description}
                  </CardDescription>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                        <Eye className="size-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit2 className="size-4 mr-2" />
                        Edit Template
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{template.criteria.length}</p>
                    <p className="text-xs text-muted-foreground">Criteria</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{template.categories.length}</p>
                    <p className="text-xs text-muted-foreground">Categories</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{template.passingScore}%</p>
                    <p className="text-xs text-muted-foreground">Pass Score</p>
                  </div>
                </div>

                {/* Categories Preview */}
                <div className="flex flex-wrap gap-1.5">
                  {template.categories.map(cat => (
                    <Badge 
                      key={cat.category} 
                      variant="outline" 
                      className={cn("text-xs", CATEGORY_COLORS[cat.category])}
                    >
                      {CATEGORY_LABELS[cat.category]} ({cat.weight}%)
                    </Badge>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>v{template.version}</span>
                  <span>By {template.createdByName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedTemplate.name}</DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTemplate.isActive ? (
                      <Badge className="bg-success/20 text-success">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                    <Badge variant="outline">v{selectedTemplate.version}</Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{selectedTemplate.criteria.length}</p>
                    <p className="text-sm text-muted-foreground">Total Criteria</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedTemplate.categories.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warning">{selectedTemplate.passingScore}%</p>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-destructive">
                      {selectedTemplate.criteria.filter(c => c.isRequired).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Auto-Fail Items</p>
                  </div>
                </div>

                {/* Category Weight Distribution */}
                <div>
                  <h4 className="font-semibold mb-3">Category Weights</h4>
                  <div className="space-y-3">
                    {selectedTemplate.categories.map(cat => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className={CATEGORY_COLORS[cat.category]}>
                            {CATEGORY_LABELS[cat.category]}
                          </Badge>
                          <span className="font-medium">{cat.weight}%</span>
                        </div>
                        <Progress value={cat.weight} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Criteria by Category */}
                <div>
                  <h4 className="font-semibold mb-4">Evaluation Criteria</h4>
                  <div className="space-y-6">
                    {selectedTemplate.categories.map(cat => (
                      <div key={cat.category}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={cn("text-sm", CATEGORY_COLORS[cat.category])}>
                            {CATEGORY_LABELS[cat.category]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({cat.criteria.length} criteria, {cat.weight}% weight)
                          </span>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                          {cat.criteria.map(critId => {
                            const criterion = selectedTemplate.criteria.find(c => c.id === critId)
                            if (!criterion) return null
                            return (
                              <div key={criterion.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{criterion.name}</p>
                                    {criterion.isRequired && (
                                      <Badge variant="destructive" className="text-xs">
                                        <AlertTriangle className="size-3 mr-1" />
                                        Auto-Fail
                                      </Badge>
                                    )}
                                    {criterion.isCritical && (
                                      <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                        Critical
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{criterion.description}</p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-bold">{criterion.maxPoints} pts</p>
                                  <p className="text-xs text-muted-foreground">{criterion.weight}% weight</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <p>Created by {selectedTemplate.createdByName}</p>
                  <p>Last updated {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
