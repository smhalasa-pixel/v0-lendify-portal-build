'use client'

import * as React from 'react'
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Shield,
  Users,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  UserPlus,
  Building2,
  Crown,
  Eye,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { User, UserRole, Team, Region } from '@/lib/types'

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'destructive'
    case 'executive':
      return 'default'
    case 'supervisor':
      return 'default'
    case 'leadership':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'executive':
      return 'Executive'
    case 'supervisor':
      return 'Supervisor'
    case 'leadership':
      return 'Team Lead'
    default:
      return 'Sales Agent'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
    case 'inactive':
      return <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
    case 'pending':
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [teamFilter, setTeamFilter] = React.useState<string>('all')
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false)
  const [isTeamManageOpen, setIsTeamManageOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  
  // Form states
  const [newUser, setNewUser] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'agent' as UserRole,
    teamId: '',
    region: '' as Region | '',
  })

  // Data refresh trigger
  const [refreshKey, setRefreshKey] = React.useState(0)
  const refresh = () => setRefreshKey(k => k + 1)

  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              User management is only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get data
  const allUsers = React.useMemo(() => dataService.getUsers(), [refreshKey])
  const teams = React.useMemo(() => dataService.getTeams(), [refreshKey])
  const supervisors = React.useMemo(() => dataService.getSupervisors(), [refreshKey])
  const teamLeads = React.useMemo(() => dataService.getTeamLeads(), [refreshKey])

  // Filter users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    const matchesTeam = teamFilter === 'all' || u.teamId === teamFilter || 
      (teamFilter === 'none' && !u.teamId && !u.teamIds?.length)
    return matchesSearch && matchesRole && matchesStatus && matchesTeam
  })

  // Stats
  const activeCount = allUsers.filter(a => a.status === 'active').length
  const inactiveCount = allUsers.filter(a => a.status === 'inactive').length
  const pendingCount = allUsers.filter(a => a.status === 'pending').length

  // Handle create user
  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) return

    const team = teams.find(t => t.id === newUser.teamId)
    
    dataService.createUser({
      email: newUser.email,
      name: `${newUser.firstName} ${newUser.lastName}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.firstName}`,
      role: newUser.role,
      teamId: newUser.teamId || undefined,
      teamName: team?.name,
      region: newUser.region || undefined,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    })

    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'agent',
      teamId: '',
      region: '',
    })
    setIsAddUserOpen(false)
    refresh()
  }

  // Handle update user
  const handleUpdateUser = () => {
    if (!selectedUser) return

    const team = teams.find(t => t.id === selectedUser.teamId)
    
    dataService.updateUser(selectedUser.id, {
      ...selectedUser,
      teamName: team?.name,
    })

    setIsEditUserOpen(false)
    setSelectedUser(null)
    refresh()
  }

  // Handle deactivate user
  const handleDeactivateUser = (userId: string) => {
    dataService.updateUser(userId, { status: 'inactive' })
    refresh()
  }

  // Handle activate user
  const handleActivateUser = (userId: string) => {
    dataService.updateUser(userId, { status: 'active' })
    refresh()
  }

  // Handle assign team lead
  const handleAssignTeamLead = (teamId: string, leaderId: string) => {
    dataService.assignTeamLead(teamId, leaderId)
    refresh()
  }

  // Handle assign team supervisor
  const handleAssignTeamSupervisor = (teamId: string, supervisorId: string) => {
    dataService.assignTeamSupervisor(teamId, supervisorId)
    refresh()
  }

  // Handle create team
  const [newTeamName, setNewTeamName] = React.useState('')
  const [newTeamLeadId, setNewTeamLeadId] = React.useState('')
  const [newTeamSupervisorId, setNewTeamSupervisorId] = React.useState('')
  const [isCreateTeamOpen, setIsCreateTeamOpen] = React.useState(false)

  const handleCreateTeam = () => {
    if (!newTeamName) return

    const leader = allUsers.find(u => u.id === newTeamLeadId)
    const supervisor = allUsers.find(u => u.id === newTeamSupervisorId)

    const team = dataService.createTeam({
      name: newTeamName,
      leaderId: leader?.id,
      leaderName: leader?.name,
      supervisorId: supervisor?.id,
      supervisorName: supervisor?.name,
    })

    // Assign lead if selected
    if (newTeamLeadId) {
      dataService.assignTeamLead(team.id, newTeamLeadId)
    }

    // Assign supervisor if selected
    if (newTeamSupervisorId) {
      dataService.assignTeamSupervisor(team.id, newTeamSupervisorId)
    }

    setNewTeamName('')
    setNewTeamLeadId('')
    setNewTeamSupervisorId('')
    setIsCreateTeamOpen(false)
    refresh()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, teams, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
            <Button variant="outline" onClick={() => setIsCreateTeamOpen(true)}>
              <Building2 className="size-4 mr-2" />
              Create Team
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team and optionally assign a team lead and supervisor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input 
                    id="teamName" 
                    placeholder="e.g., North Region Team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamLead">Team Lead (Optional)</Label>
                  <Select value={newTeamLeadId} onValueChange={setNewTeamLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Team Lead</SelectItem>
                      {allUsers.filter(u => u.role === 'agent' || u.role === 'leadership').map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({getRoleLabel(u.role)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selected user will be promoted to Team Lead role
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSupervisor">Supervisor (Optional)</Label>
                  <Select value={newTeamSupervisorId} onValueChange={setNewTeamSupervisorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supervisor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Supervisor</SelectItem>
                      {supervisors.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={!newTeamName}>
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <Plus className="size-4 mr-2" />
              Add User
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. They will receive an email invitation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@lendify.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v as UserRole }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Sales Agent</SelectItem>
                        <SelectItem value="leadership">Team Lead</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Select 
                      value={newUser.teamId} 
                      onValueChange={(v) => setNewUser(prev => ({ ...prev, teamId: v }))}
                      disabled={newUser.role === 'executive' || newUser.role === 'admin' || newUser.role === 'supervisor'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Select 
                    value={newUser.region} 
                    onValueChange={(v) => setNewUser(prev => ({ ...prev, region: v as Region | '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Region (sees all)</SelectItem>
                      <SelectItem value="dubai">Dubai</SelectItem>
                      <SelectItem value="jordan">Jordan</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for users who should see all regions
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={!newUser.firstName || !newUser.lastName || !newUser.email}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Users and Teams */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="size-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2">
            <Building2 className="size-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <UserCheck className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCount}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                    <UserX className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inactiveCount}</p>
                    <p className="text-sm text-muted-foreground">Inactive Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Mail className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending Invites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="agent">Sales Agent</SelectItem>
                    <SelectItem value="leadership">Team Lead</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="none">No Team</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                All registered users in the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback className="text-xs">
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)}>
                          {getRoleLabel(u.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.teamName || u.teamNames?.join(', ') || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {u.region || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(u.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(u.hireDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser({ ...u })
                              setIsEditUserOpen(true)
                            }}>
                              <Edit className="size-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="size-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.status === 'active' ? (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeactivateUser(u.id)}
                              >
                                <UserX className="size-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-success"
                                onClick={() => handleActivateUser(u.id)}
                              >
                                <UserCheck className="size-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          {/* Teams Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => {
              const teamMembers = dataService.getTeamMembers(team.id)
              return (
                <Card key={team.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>{team.memberCount} members</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedTeam(team)
                            setIsTeamManageOpen(true)
                          }}>
                            <Edit className="size-4 mr-2" />
                            Manage Team
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="size-4 mr-2" />
                            Add Members
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Team Lead */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crown className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Team Lead</p>
                        <p className="text-sm font-medium truncate">
                          {team.leaderName || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Supervisor */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="size-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <Eye className="size-4 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Supervisor</p>
                        <p className="text-sm font-medium truncate">
                          {team.supervisorName || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Team Members Preview */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                      <div className="flex -space-x-2">
                        {teamMembers.slice(0, 5).map(member => (
                          <Avatar key={member.id} className="size-8 border-2 border-background">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-[10px]">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {teamMembers.length > 5 && (
                          <div className="size-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{teamMembers.length - 5}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details, role, and team assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, role: v as UserRole } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Sales Agent</SelectItem>
                      <SelectItem value="leadership">Team Lead</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedUser.status} 
                    onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, status: v as 'active' | 'inactive' | 'pending' } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select 
                  value={selectedUser.teamId || ''} 
                  onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, teamId: v || undefined } : null)}
                  disabled={selectedUser.role === 'executive' || selectedUser.role === 'admin' || selectedUser.role === 'supervisor'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No team assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Team</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUser.role === 'supervisor' && (
                  <p className="text-xs text-muted-foreground">
                    Supervisors manage teams through team assignments, not direct membership.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select 
                  value={selectedUser.region || ''} 
                  onValueChange={(v) => setSelectedUser(prev => prev ? { ...prev, region: v as Region | undefined } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No region (sees all)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Region (sees all)</SelectItem>
                    <SelectItem value="dubai">Dubai</SelectItem>
                    <SelectItem value="jordan">Jordan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={isTeamManageOpen} onOpenChange={setIsTeamManageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Team: {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Assign team lead and supervisor for this team.
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Team Lead</Label>
                <Select 
                  value={selectedTeam.leaderId || ''} 
                  onValueChange={(v) => {
                    if (v) {
                      handleAssignTeamLead(selectedTeam.id, v)
                      setSelectedTeam(prev => {
                        const leader = allUsers.find(u => u.id === v)
                        return prev ? { ...prev, leaderId: v, leaderName: leader?.name } : null
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter(u => (u.role === 'agent' || u.role === 'leadership') && u.status === 'active')
                      .map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="text-[10px]">
                                {u.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            {u.name}
                            {u.role === 'leadership' && <Badge variant="secondary" className="ml-1 text-[10px]">Lead</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The team lead oversees daily operations and reports directly to the supervisor.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Supervisor</Label>
                <Select 
                  value={selectedTeam.supervisorId || ''} 
                  onValueChange={(v) => {
                    if (v) {
                      handleAssignTeamSupervisor(selectedTeam.id, v)
                      setSelectedTeam(prev => {
                        const supervisor = allUsers.find(u => u.id === v)
                        return prev ? { ...prev, supervisorId: v, supervisorName: supervisor?.name } : null
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.filter(s => s.status === 'active').map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage src={s.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The supervisor manages multiple teams and receives escalations from team leads.
                </p>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <Label>Team Members ({selectedTeam.memberCount})</Label>
                <div className="max-h-40 overflow-y-auto rounded-lg border p-2 space-y-2">
                  {dataService.getTeamMembers(selectedTeam.id).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{getRoleLabel(member.role)}</p>
                        </div>
                      </div>
                      {member.id === selectedTeam.leaderId && (
                        <Badge variant="secondary" className="text-[10px]">Lead</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeamManageOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
