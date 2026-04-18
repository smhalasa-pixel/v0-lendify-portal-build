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
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Flag,
  Shield,
  Save,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import type { ScorecardTemplate, ScorecardCategory, ScorecardCriterion, ScorecardType } from '@/lib/types'

const TYPE_LABELS: Record<ScorecardType, string> = {
  opener: 'Opener Quality Evaluation',
  closer: 'Closer Quality Evaluation',
  account_manager: 'Lendify Account Manager Quality Evaluation',
}

const TYPE_COLORS: Record<ScorecardType, string> = {
  opener: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  closer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  account_manager: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

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
  opening: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  discovery: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  presentation: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  objection_handling: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  closing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  compliance: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  professionalism: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
}

const ALL_CATEGORIES: ScorecardCategory[] = [
  'opening', 'discovery', 'presentation', 'objection_handling', 'closing', 'compliance', 'professionalism'
]

type SortField = 'name' | 'criteria' | 'categories' | 'passingScore' | 'autoFails' | 'redFlags' | 'version' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export default function ScorecardsPage() {
  const { user } = useAuth()
  
  const isQA = user?.role === 'qa_senior' || user?.role === 'qa_trainer' || user?.role === 'admin'
  const canManage = user?.role === 'qa_senior' || user?.role === 'admin'
  
  const [templates, setTemplates] = React.useState<ScorecardTemplate[]>(() => dataService.getAllScorecardTemplates())
  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards')
  const [typeFilter, setTypeFilter] = React.useState<ScorecardType | 'all'>('all')
  const [search, setSearch] = React.useState('')
  const [sortField, setSortField] = React.useState<SortField>('name')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc')
  const [selectedTemplate, setSelectedTemplate] = React.useState<ScorecardTemplate | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<ScorecardTemplate | null>(null)

  // Filter and sort templates
  const filteredTemplates = React.useMemo(() => {
    let results = [...templates]
    
    // Type filter
    if (typeFilter !== 'all') {
      results = results.filter(t => t.type === typeFilter)
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      results = results.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.createdByName.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort
    results.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'criteria':
          comparison = a.criteria.length - b.criteria.length
          break
        case 'categories':
          comparison = a.categories.length - b.categories.length
          break
        case 'passingScore':
          comparison = a.passingScore - b.passingScore
          break
        case 'autoFails':
          comparison = a.criteria.filter(c => c.isRequired).length - b.criteria.filter(c => c.isRequired).length
          break
        case 'redFlags':
          comparison = a.criteria.filter(c => c.isCritical).length - b.criteria.filter(c => c.isCritical).length
          break
        case 'version':
          comparison = a.version - b.version
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    
    return results
  }, [templates, search, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-50" />
    return sortDirection === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
  }

  const handleEdit = (template: ScorecardTemplate) => {
    setEditingTemplate({ ...template, criteria: [...template.criteria], categories: [...template.categories] })
    setIsEditOpen(true)
  }

  const handleDuplicate = (template: ScorecardTemplate) => {
    const newTemplate: ScorecardTemplate = {
      ...template,
      id: `scorecard-${Date.now()}`,
      name: `${template.name} (Copy)`,
      version: 1,
      createdById: user?.id || '',
      createdByName: user?.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTemplates([...templates, newTemplate])
  }

  const handleDelete = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId))
  }

  const handleSaveTemplate = (template: ScorecardTemplate) => {
    if (editingTemplate) {
      // Update existing
      setTemplates(templates.map(t => t.id === template.id ? { ...template, updatedAt: new Date().toISOString(), version: t.version + 1 } : t))
    } else {
      // Create new
      const newTemplate: ScorecardTemplate = {
        ...template,
        id: `scorecard-${Date.now()}`,
        version: 1,
        createdById: user?.id || '',
        createdByName: user?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTemplates([...templates, newTemplate])
    }
    setIsCreateOpen(false)
    setIsEditOpen(false)
    setEditingTemplate(null)
  }

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
          <p className="text-muted-foreground">Manage QA evaluation templates, criteria, and red flag rules</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <TableIcon className="size-4" />
            </Button>
          </div>
          {canManage && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            className="h-10"
          >
            All Templates
            <Badge variant="secondary" className="ml-2 bg-background/50">
              {templates.length}
            </Badge>
          </Button>
          <Button
            variant={typeFilter === 'opener' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('opener')}
            className={cn("h-10", typeFilter === 'opener' && "bg-blue-600 hover:bg-blue-700")}
          >
            Opener Quality Evaluation
            <Badge variant="secondary" className="ml-2 bg-background/50">
              {templates.filter(t => t.type === 'opener').length}
            </Badge>
          </Button>
          <Button
            variant={typeFilter === 'closer' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('closer')}
            className={cn("h-10", typeFilter === 'closer' && "bg-emerald-600 hover:bg-emerald-700")}
          >
            Closer Quality Evaluation
            <Badge variant="secondary" className="ml-2 bg-background/50">
              {templates.filter(t => t.type === 'closer').length}
            </Badge>
          </Button>
          <Button
            variant={typeFilter === 'account_manager' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('account_manager')}
            className={cn("h-10", typeFilter === 'account_manager' && "bg-purple-600 hover:bg-purple-700")}
          >
            Lendify Account Manager Quality Evaluation
            <Badge variant="secondary" className="ml-2 bg-background/50">
              {templates.filter(t => t.type === 'account_manager').length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Red Flag Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <XCircle className="size-3" />
                Auto-Fail
              </Badge>
              <span className="text-sm text-muted-foreground">Score 0 = Entire call fails</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1">
                <Flag className="size-3" />
                Red Flag
              </Badge>
              <span className="text-sm text-muted-foreground">Critical violation requiring review</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1">
                <AlertTriangle className="size-3" />
                Warning
              </Badge>
              <span className="text-sm text-muted-foreground">Below threshold, needs coaching</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id} 
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:border-primary/50",
                template.isActive ? "border-primary/30" : "opacity-60"
              )}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn("text-xs", TYPE_COLORS[template.type])}>
                        {TYPE_LABELS[template.type]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {template.name}
                      {template.isActive ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                          <Edit2 className="size-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}>
                          <Copy className="size-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}>
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
                      <p className="text-2xl font-bold text-rose-400">
                        {template.criteria.filter(c => c.isRequired).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Auto-Fails</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-400">{template.passingScore}%</p>
                      <p className="text-xs text-muted-foreground">Pass Score</p>
                    </div>
                  </div>

                  {/* Red Flags Count */}
                  {template.criteria.filter(c => c.isCritical).length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <Flag className="size-4 text-rose-400" />
                      <span className="text-sm text-rose-400">
                        {template.criteria.filter(c => c.isCritical).length} Red Flag criteria
                      </span>
                    </div>
                  )}

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
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Template Name {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('criteria')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Criteria {getSortIcon('criteria')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('categories')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Categories {getSortIcon('categories')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('passingScore')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Pass Score {getSortIcon('passingScore')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('autoFails')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Auto-Fails {getSortIcon('autoFails')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('redFlags')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Red Flags {getSortIcon('redFlags')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Version {getSortIcon('version')}
                    </div>
                  </TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-2">
                      Last Updated {getSortIcon('updatedAt')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow 
                      key={template.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", TYPE_COLORS[template.type])}>
                          {template.type === 'opener' ? 'Opener' : 
                           template.type === 'closer' ? 'Closer' : 'Account Mgr'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.isActive ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{template.criteria.length}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{template.categories.length}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                          {template.passingScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {template.criteria.filter(c => c.isRequired).length > 0 ? (
                          <Badge variant="destructive">
                            {template.criteria.filter(c => c.isRequired).length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {template.criteria.filter(c => c.isCritical).length > 0 ? (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1">
                            <Flag className="size-3" />
                            {template.criteria.filter(c => c.isCritical).length}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">v{template.version}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {template.createdByName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                                <Eye className="size-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                                <Edit2 className="size-4 mr-2" />
                                Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}>
                                <Copy className="size-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}>
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
                      <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
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
                    <p className="text-3xl font-bold text-amber-400">{selectedTemplate.passingScore}%</p>
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-rose-400">
                      {selectedTemplate.criteria.filter(c => c.isRequired).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Auto-Fail Items</p>
                  </div>
                </div>

                {/* Red Flag Summary */}
                {selectedTemplate.criteria.filter(c => c.isCritical).length > 0 && (
                  <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Flag className="size-5 text-rose-400" />
                      <h4 className="font-semibold text-rose-400">Red Flag Criteria ({selectedTemplate.criteria.filter(c => c.isCritical).length})</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedTemplate.criteria.filter(c => c.isCritical).map(crit => (
                        <div key={crit.id} className="flex items-center justify-between text-sm p-2 rounded bg-background/50">
                          <div>
                            <span className="font-medium">{crit.name}</span>
                            <span className="text-muted-foreground ml-2">({CATEGORY_LABELS[crit.category]})</span>
                          </div>
                          {crit.isRequired && (
                            <Badge variant="destructive" className="text-xs">Auto-Fail</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium">{criterion.name}</p>
                                    {criterion.isRequired && (
                                      <Badge variant="destructive" className="text-xs gap-1">
                                        <XCircle className="size-3" />
                                        Auto-Fail
                                      </Badge>
                                    )}
                                    {criterion.isCritical && !criterion.isRequired && (
                                      <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1">
                                        <Flag className="size-3" />
                                        Red Flag
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

              {canManage && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setSelectedTemplate(null); handleEdit(selectedTemplate); }}>
                    <Edit2 className="size-4 mr-2" />
                    Edit Template
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <TemplateFormDialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false)
            setIsEditOpen(false)
            setEditingTemplate(null)
          }
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  )
}

// Template Form Dialog Component
function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: ScorecardTemplate | null
  onSave: (template: ScorecardTemplate) => void
}) {
  const isEditing = !!template

  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [type, setType] = React.useState<ScorecardType>('opener')
  const [passingScore, setPassingScore] = React.useState(70)
  const [autoFailThreshold, setAutoFailThreshold] = React.useState(50)
  const [isActive, setIsActive] = React.useState(true)
  const [criteria, setCriteria] = React.useState<ScorecardCriterion[]>([])
  const [categories, setCategories] = React.useState<{ category: ScorecardCategory; weight: number; criteria: string[] }[]>([])

  // Initialize form when template changes
  React.useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description)
      setType(template.type)
      setPassingScore(template.passingScore)
      setAutoFailThreshold(template.autoFailThreshold || 50)
      setIsActive(template.isActive)
      setCriteria([...template.criteria])
      setCategories([...template.categories])
    } else {
      setName('')
      setDescription('')
      setType('opener')
      setPassingScore(70)
      setAutoFailThreshold(50)
      setIsActive(true)
      setCriteria([])
      setCategories([])
    }
  }, [template, open])

  const addCriterion = (category: ScorecardCategory) => {
    const newCriterion: ScorecardCriterion = {
      id: `crit-${Date.now()}`,
      name: '',
      description: '',
      category,
      maxPoints: 10,
      weight: 5,
      isRequired: false,
      isCritical: false,
    }
    setCriteria([...criteria, newCriterion])
    
    // Update category criteria list
    const catIndex = categories.findIndex(c => c.category === category)
    if (catIndex >= 0) {
      const newCategories = [...categories]
      newCategories[catIndex].criteria.push(newCriterion.id)
      setCategories(newCategories)
    } else {
      setCategories([...categories, { category, weight: 10, criteria: [newCriterion.id] }])
    }
  }

  const updateCriterion = (id: string, updates: Partial<ScorecardCriterion>) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const removeCriterion = (id: string) => {
    const crit = criteria.find(c => c.id === id)
    if (!crit) return
    
    setCriteria(criteria.filter(c => c.id !== id))
    setCategories(categories.map(cat => ({
      ...cat,
      criteria: cat.criteria.filter(cId => cId !== id)
    })).filter(cat => cat.criteria.length > 0))
  }

  const updateCategoryWeight = (category: ScorecardCategory, weight: number) => {
    setCategories(categories.map(c => c.category === category ? { ...c, weight } : c))
  }

  const handleSave = () => {
    const newTemplate: ScorecardTemplate = {
      id: template?.id || '',
      name,
      description,
      type,
      version: template?.version || 1,
      isActive,
      createdById: template?.createdById || '',
      createdByName: template?.createdByName || '',
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passingScore,
      autoFailThreshold,
      criteria,
      categories,
    }
    onSave(newTemplate)
  }

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the scorecard template and criteria' : 'Create a new QA evaluation scorecard template'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="categories">Categories & Weights</TabsTrigger>
            <TabsTrigger value="criteria">Criteria & Red Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Evaluation Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ScorecardType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opener">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500" />
                      Opener Quality Evaluation
                    </div>
                  </SelectItem>
                  <SelectItem value="closer">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      Closer Quality Evaluation
                    </div>
                  </SelectItem>
                  <SelectItem value="account_manager">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-purple-500" />
                      Lendify Account Manager Quality Evaluation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Call Quality Scorecard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this scorecard evaluates..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Passing Score: {passingScore}%</Label>
                <p className="text-xs text-muted-foreground">Minimum score required to pass evaluation</p>
                <Slider
                  value={[passingScore]}
                  onValueChange={([v]) => setPassingScore(v)}
                  min={50}
                  max={95}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Auto-Fail Threshold: {autoFailThreshold}%</Label>
                <p className="text-xs text-muted-foreground">Score below this = automatic failure</p>
                <Slider
                  value={[autoFailThreshold]}
                  onValueChange={([v]) => setAutoFailThreshold(v)}
                  min={30}
                  max={70}
                  step={5}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Make this template available for evaluations</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">Category Weights</h4>
                <p className="text-sm text-muted-foreground">Define how much each category contributes to the total score</p>
              </div>
              <Badge variant={totalWeight === 100 ? 'outline' : 'destructive'} className="text-lg px-3">
                {totalWeight}% / 100%
              </Badge>
            </div>

            {totalWeight !== 100 && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertTriangle className="size-4 inline mr-2" />
                Category weights must sum to 100%
              </div>
            )}

            <div className="space-y-4">
              {ALL_CATEGORIES.map(cat => {
                const catData = categories.find(c => c.category === cat)
                const weight = catData?.weight || 0
                const criteriaCount = catData?.criteria.length || 0
                
                return (
                  <div key={cat} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex-1">
                      <Badge variant="outline" className={cn("mb-2", CATEGORY_COLORS[cat])}>
                        {CATEGORY_LABELS[cat]}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{criteriaCount} criteria</p>
                    </div>
                    <div className="flex items-center gap-3 w-48">
                      <Slider
                        value={[weight]}
                        onValueChange={([val]) => updateCategoryWeight(cat, val)}
                        min={0}
                        max={50}
                        step={5}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-semibold">{weight}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">Evaluation Criteria</h4>
                <p className="text-sm text-muted-foreground">Define what gets evaluated and flag critical items</p>
              </div>
            </div>

            {/* Add Criterion by Category */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Add criterion to:</span>
              {ALL_CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  onClick={() => addCriterion(cat)}
                  className={cn("text-xs", CATEGORY_COLORS[cat])}
                >
                  <Plus className="size-3 mr-1" />
                  {CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {criteria.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                  No criteria added yet. Click a category button above to add criteria.
                </div>
              ) : (
                criteria.map((crit) => (
                  <div key={crit.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className={cn("mt-1 shrink-0", CATEGORY_COLORS[crit.category])}>
                        {CATEGORY_LABELS[crit.category]}
                      </Badge>
                      <div className="flex-1 space-y-3">
                        <Input
                          value={crit.name}
                          onChange={(e) => updateCriterion(crit.id, { name: e.target.value })}
                          placeholder="Criterion name"
                          className="font-medium"
                        />
                        <Textarea
                          value={crit.description}
                          onChange={(e) => updateCriterion(crit.id, { description: e.target.value })}
                          placeholder="Description of what this criterion evaluates..."
                          rows={2}
                        />
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Max Points:</Label>
                            <Input
                              type="number"
                              value={crit.maxPoints}
                              onChange={(e) => updateCriterion(crit.id, { maxPoints: parseInt(e.target.value) || 10 })}
                              className="w-16 h-8"
                              min={1}
                              max={100}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={crit.isRequired}
                              onCheckedChange={(checked) => updateCriterion(crit.id, { isRequired: checked, isCritical: checked || crit.isCritical })}
                            />
                            <Label className="text-xs flex items-center gap-1">
                              <XCircle className="size-3 text-destructive" />
                              Auto-Fail (0 = fail entire call)
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={crit.isCritical}
                              onCheckedChange={(checked) => updateCriterion(crit.id, { isCritical: checked })}
                            />
                            <Label className="text-xs flex items-center gap-1">
                              <Flag className="size-3 text-rose-400" />
                              Red Flag (requires review)
                            </Label>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(crit.id)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || criteria.length === 0 || totalWeight !== 100}>
            <Save className="size-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
