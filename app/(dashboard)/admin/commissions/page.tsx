'use client'

import * as React from 'react'
import {
  Plus,
  DollarSign,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface CommissionPlan {
  id: string
  name: string
  loanType: string
  baseRate: number
  bonusRate: number
  volumeThreshold: number
  isActive: boolean
}

const initialPlans: CommissionPlan[] = [
  { id: '1', name: 'Standard Conventional', loanType: 'Conventional', baseRate: 0.75, bonusRate: 0.25, volumeThreshold: 500000, isActive: true },
  { id: '2', name: 'FHA Program', loanType: 'FHA', baseRate: 0.65, bonusRate: 0.20, volumeThreshold: 400000, isActive: true },
  { id: '3', name: 'VA Specialist', loanType: 'VA', baseRate: 0.70, bonusRate: 0.30, volumeThreshold: 600000, isActive: true },
  { id: '4', name: 'Jumbo Elite', loanType: 'Jumbo', baseRate: 0.50, bonusRate: 0.35, volumeThreshold: 1000000, isActive: false },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminCommissionsPage() {
  const [plans, setPlans] = React.useState<CommissionPlan[]>(initialPlans)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingPlan, setEditingPlan] = React.useState<CommissionPlan | null>(null)
  
  // Form state
  const [formName, setFormName] = React.useState('')
  const [formLoanType, setFormLoanType] = React.useState('')
  const [formBaseRate, setFormBaseRate] = React.useState('')
  const [formBonusRate, setFormBonusRate] = React.useState('')
  const [formThreshold, setFormThreshold] = React.useState('')
  const [formIsActive, setFormIsActive] = React.useState(true)

  const resetForm = () => {
    setFormName('')
    setFormLoanType('')
    setFormBaseRate('')
    setFormBonusRate('')
    setFormThreshold('')
    setFormIsActive(true)
    setEditingPlan(null)
  }

  const handleCreate = () => {
    const newPlan: CommissionPlan = {
      id: `plan-${Date.now()}`,
      name: formName,
      loanType: formLoanType,
      baseRate: parseFloat(formBaseRate),
      bonusRate: parseFloat(formBonusRate),
      volumeThreshold: parseFloat(formThreshold),
      isActive: formIsActive,
    }
    setPlans([...plans, newPlan])
    setCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = (plan: CommissionPlan) => {
    setEditingPlan(plan)
    setFormName(plan.name)
    setFormLoanType(plan.loanType)
    setFormBaseRate(plan.baseRate.toString())
    setFormBonusRate(plan.bonusRate.toString())
    setFormThreshold(plan.volumeThreshold.toString())
    setFormIsActive(plan.isActive)
  }

  const handleUpdate = () => {
    if (!editingPlan) return
    setPlans(
      plans.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: formName,
              loanType: formLoanType,
              baseRate: parseFloat(formBaseRate),
              bonusRate: parseFloat(formBonusRate),
              volumeThreshold: parseFloat(formThreshold),
              isActive: formIsActive,
            }
          : p
      )
    )
    setEditingPlan(null)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)))
  }

  const activePlans = plans.filter((p) => p.isActive).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commission Rules</h1>
          <p className="text-muted-foreground">
            Configure commission structures and bonus tiers
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Commission Plan</DialogTitle>
              <DialogDescription>
                Define a new commission structure
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Standard Conventional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loanType">Loan Type</Label>
                <Input
                  id="loanType"
                  value={formLoanType}
                  onChange={(e) => setFormLoanType(e.target.value)}
                  placeholder="Conventional, FHA, VA, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate (%)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    step="0.01"
                    value={formBaseRate}
                    onChange={(e) => setFormBaseRate(e.target.value)}
                    placeholder="0.75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bonusRate">Bonus Rate (%)</Label>
                  <Input
                    id="bonusRate"
                    type="number"
                    step="0.01"
                    value={formBonusRate}
                    onChange={(e) => setFormBonusRate(e.target.value)}
                    placeholder="0.25"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Volume Threshold ($)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formThreshold}
                  onChange={(e) => setFormThreshold(e.target.value)}
                  placeholder="500000"
                />
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
              <Button onClick={handleCreate} disabled={!formName || !formLoanType}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plans.length}</p>
                <p className="text-sm text-muted-foreground">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="size-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlans}</p>
                <p className="text-sm text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <DollarSign className="size-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(plans.reduce((sum, p) => sum + p.baseRate, 0) / plans.length).toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Base Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Plans</CardTitle>
          <CardDescription>Manage commission structures for different loan types</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Bonus Rate</TableHead>
                <TableHead>Volume Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.loanType}</TableCell>
                  <TableCell>{plan.baseRate}%</TableCell>
                  <TableCell>{plan.bonusRate}%</TableCell>
                  <TableCell>{formatCurrency(plan.volumeThreshold)}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(plan.id)}>
                          {plan.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(plan.id)}
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
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Commission Plan</DialogTitle>
            <DialogDescription>Update commission structure</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Plan Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-loanType">Loan Type</Label>
              <Input
                id="edit-loanType"
                value={formLoanType}
                onChange={(e) => setFormLoanType(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-baseRate">Base Rate (%)</Label>
                <Input
                  id="edit-baseRate"
                  type="number"
                  step="0.01"
                  value={formBaseRate}
                  onChange={(e) => setFormBaseRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bonusRate">Bonus Rate (%)</Label>
                <Input
                  id="edit-bonusRate"
                  type="number"
                  step="0.01"
                  value={formBonusRate}
                  onChange={(e) => setFormBonusRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-threshold">Volume Threshold ($)</Label>
              <Input
                id="edit-threshold"
                type="number"
                value={formThreshold}
                onChange={(e) => setFormThreshold(e.target.value)}
              />
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
