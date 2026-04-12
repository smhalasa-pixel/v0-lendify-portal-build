'use client'

import * as React from 'react'
import {
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Switch } from '@/components/ui/switch'

interface ClawbackPolicy {
  id: string
  name: string
  description: string
  triggerEvent: string
  clawbackPercentage: number
  gracePeriodDays: number
  isActive: boolean
}

const initialPolicies: ClawbackPolicy[] = [
  { 
    id: '1', 
    name: 'Early Payoff', 
    description: 'Applies when loan is paid off within grace period',
    triggerEvent: 'Loan paid off within 6 months',
    clawbackPercentage: 100,
    gracePeriodDays: 180,
    isActive: true 
  },
  { 
    id: '2', 
    name: 'First Payment Default', 
    description: 'Triggered when borrower misses first payment',
    triggerEvent: 'First payment default',
    clawbackPercentage: 100,
    gracePeriodDays: 0,
    isActive: true 
  },
  { 
    id: '3', 
    name: 'Early Refinance', 
    description: 'When borrower refinances within threshold period',
    triggerEvent: 'Refinance within 12 months',
    clawbackPercentage: 50,
    gracePeriodDays: 365,
    isActive: false 
  },
]

export default function AdminClawbacksPage() {
  const [policies, setPolicies] = React.useState<ClawbackPolicy[]>(initialPolicies)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingPolicy, setEditingPolicy] = React.useState<ClawbackPolicy | null>(null)
  
  // Form state
  const [formName, setFormName] = React.useState('')
  const [formDescription, setFormDescription] = React.useState('')
  const [formTrigger, setFormTrigger] = React.useState('')
  const [formPercentage, setFormPercentage] = React.useState('')
  const [formGracePeriod, setFormGracePeriod] = React.useState('')
  const [formIsActive, setFormIsActive] = React.useState(true)

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormTrigger('')
    setFormPercentage('')
    setFormGracePeriod('')
    setFormIsActive(true)
    setEditingPolicy(null)
  }

  const handleCreate = () => {
    const newPolicy: ClawbackPolicy = {
      id: `policy-${Date.now()}`,
      name: formName,
      description: formDescription,
      triggerEvent: formTrigger,
      clawbackPercentage: parseFloat(formPercentage),
      gracePeriodDays: parseInt(formGracePeriod),
      isActive: formIsActive,
    }
    setPolicies([...policies, newPolicy])
    setCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = (policy: ClawbackPolicy) => {
    setEditingPolicy(policy)
    setFormName(policy.name)
    setFormDescription(policy.description)
    setFormTrigger(policy.triggerEvent)
    setFormPercentage(policy.clawbackPercentage.toString())
    setFormGracePeriod(policy.gracePeriodDays.toString())
    setFormIsActive(policy.isActive)
  }

  const handleUpdate = () => {
    if (!editingPolicy) return
    setPolicies(
      policies.map((p) =>
        p.id === editingPolicy.id
          ? {
              ...p,
              name: formName,
              description: formDescription,
              triggerEvent: formTrigger,
              clawbackPercentage: parseFloat(formPercentage),
              gracePeriodDays: parseInt(formGracePeriod),
              isActive: formIsActive,
            }
          : p
      )
    )
    setEditingPolicy(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setPolicies(policies.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }

  const activePolicies = policies.filter((p) => p.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clawback Rules</h1>
          <p className="text-muted-foreground">
            Define clawback policies and thresholds
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Clawback Policy</DialogTitle>
              <DialogDescription>
                Define a new clawback policy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Early Payoff"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="When this policy applies..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Event</Label>
                <Input
                  id="trigger"
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  placeholder="Loan paid off within 6 months"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage">Clawback %</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formPercentage}
                    onChange={(e) => setFormPercentage(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    value={formGracePeriod}
                    onChange={(e) => setFormGracePeriod(e.target.value)}
                    placeholder="180"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formName || !formTrigger}>
                Create Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{policies.length}</p>
                <p className="text-sm text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePolicies}</p>
                <p className="text-sm text-muted-foreground">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clawback Policies</CardTitle>
          <CardDescription>Manage clawback rules and thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Trigger Event</TableHead>
                <TableHead>Clawback %</TableHead>
                <TableHead>Grace Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{policy.name}</span>
                      <p className="text-xs text-muted-foreground">{policy.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{policy.triggerEvent}</TableCell>
                  <TableCell>{policy.clawbackPercentage}%</TableCell>
                  <TableCell>{policy.gracePeriodDays} days</TableCell>
                  <TableCell>
                    <Badge variant={policy.isActive ? 'destructive' : 'secondary'}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(policy)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(policy.id)}>
                          {policy.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(policy.id)}
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clawback Policy</DialogTitle>
            <DialogDescription>Update policy details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Policy Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trigger">Trigger Event</Label>
              <Input
                id="edit-trigger"
                value={formTrigger}
                onChange={(e) => setFormTrigger(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-percentage">Clawback %</Label>
                <Input
                  id="edit-percentage"
                  type="number"
                  value={formPercentage}
                  onChange={(e) => setFormPercentage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gracePeriod">Grace Period (days)</Label>
                <Input
                  id="edit-gracePeriod"
                  type="number"
                  value={formGracePeriod}
                  onChange={(e) => setFormGracePeriod(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
