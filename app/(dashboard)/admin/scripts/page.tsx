'use client'

import * as React from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  MoreHorizontal,
  Star,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Script } from '@/lib/types'

const categoryOptions = [
  { value: 'objection-handling', label: 'Objection Handling' },
  { value: 'product-pitch', label: 'Product Pitch' },
  { value: 'closing', label: 'Closing' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'follow-up', label: 'Follow-up' },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AdminScriptsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scripts, setScripts] = React.useState<Script[]>([])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingScript, setEditingScript] = React.useState<Script | null>(null)
  
  // Form state
  const [formTitle, setFormTitle] = React.useState('')
  const [formDescription, setFormDescription] = React.useState('')
  const [formCategory, setFormCategory] = React.useState('objection-handling')
  const [formContent, setFormContent] = React.useState('')

  React.useEffect(() => {
    setScripts(dataService.getScripts())
  }, [])

  const filteredScripts = React.useMemo(() => {
    if (!searchQuery) return scripts
    const query = searchQuery.toLowerCase()
    return scripts.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    )
  }, [scripts, searchQuery])

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormCategory('objection-handling')
    setFormContent('')
    setEditingScript(null)
  }

  const handleCreate = () => {
    const newScript: Script = {
      id: `script-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      category: formCategory as Script['category'],
      sections: [
        {
          id: `section-${Date.now()}`,
          title: 'Main Content',
          content: formContent,
          order: 1,
        }
      ],
      authorId: user?.id || 'unknown',
      authorName: user?.name || 'Unknown',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      usageCount: 0,
    }
    setScripts([newScript, ...scripts])
    setCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = (script: Script) => {
    setEditingScript(script)
    setFormTitle(script.title)
    setFormDescription(script.description)
    setFormCategory(script.category)
    setFormContent(script.sections[0]?.content || '')
  }

  const handleUpdate = () => {
    if (!editingScript) return
    setScripts(
      scripts.map((s) =>
        s.id === editingScript.id
          ? {
              ...s,
              title: formTitle,
              description: formDescription,
              category: formCategory as Script['category'],
              sections: [
                {
                  ...s.sections[0],
                  content: formContent,
                }
              ],
              updatedDate: new Date().toISOString(),
            }
          : s
      )
    )
    setEditingScript(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setScripts(scripts.filter((s) => s.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Script Manager</h1>
          <p className="text-muted-foreground">
            Create and manage call scripts
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Script</DialogTitle>
              <DialogDescription>
                Add a new call script for the team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Script title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Script Content</Label>
                <Textarea
                  id="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write your script content..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formTitle || !formContent}>
                Create Script
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search scripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Scripts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            All Scripts
          </CardTitle>
          <CardDescription>
            {filteredScripts.length} script{filteredScripts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{script.title}</span>
                      <p className="text-xs text-muted-foreground">{script.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{script.category.replace('-', ' ')}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(script.updatedDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-muted-foreground" />
                      {script.usageCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(script)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(script.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredScripts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No scripts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingScript} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Script</DialogTitle>
            <DialogDescription>
              Update script details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Script title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Script Content</Label>
              <Textarea
                id="edit-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your script content..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!formTitle || !formContent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
