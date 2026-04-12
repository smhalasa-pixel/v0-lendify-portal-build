'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Pin,
  Search,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Announcement } from '@/lib/types'

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  low: { label: 'Low', variant: 'outline' },
  medium: { label: 'Medium', variant: 'secondary' },
  high: { label: 'High', variant: 'default' },
  urgent: { label: 'Urgent', variant: 'destructive' },
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-muted' },
  policy: { label: 'Policy', color: 'bg-chart-1/20' },
  product: { label: 'Product', color: 'bg-chart-2/20' },
  training: { label: 'Training', color: 'bg-chart-3/20' },
  compliance: { label: 'Compliance', color: 'bg-chart-5/20' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateString)
}

export default function AnnouncementsPage() {
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')

  const allAnnouncements = React.useMemo(() => dataService.getAnnouncements(), [])

  const filteredAnnouncements = React.useMemo(() => {
    return allAnnouncements.filter((announcement) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          announcement.title.toLowerCase().includes(query) ||
          announcement.content.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && announcement.category !== categoryFilter) {
        return false
      }

      // Priority filter
      if (priorityFilter !== 'all' && announcement.priority !== priorityFilter) {
        return false
      }

      return true
    })
  }, [allAnnouncements, searchQuery, categoryFilter, priorityFilter])

  // Separate pinned and regular announcements
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned)

  const unreadCount = allAnnouncements.filter(
    (a) => user && !a.readBy.includes(user.id)
  ).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest news and updates
            {unreadCount > 0 && (
              <span className="ml-2">
                <Badge variant="secondary">{unreadCount} unread</Badge>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(priorityConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Pin className="size-4" />
            Pinned Announcements
          </h2>
          <div className="grid gap-4">
            {pinnedAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                userId={user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && regularAnnouncements.length > 0 && (
          <h2 className="text-sm font-medium text-muted-foreground">
            All Announcements
          </h2>
        )}
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No announcements found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {regularAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AnnouncementCard({
  announcement,
  userId,
}: {
  announcement: Announcement
  userId?: string
}) {
  const isUnread = userId && !announcement.readBy.includes(userId)

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <Link href={`/announcements/${announcement.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                {announcement.isPinned && (
                  <Pin className="size-4 text-primary shrink-0" />
                )}
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {announcement.title}
                </CardTitle>
                {isUnread && (
                  <div className="size-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatRelativeDate(announcement.publishedDate)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {announcement.authorName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={priorityConfig[announcement.priority].variant}
              >
                {priorityConfig[announcement.priority].label}
              </Badge>
              <Badge
                variant="outline"
                className={categoryConfig[announcement.category].color}
              >
                {categoryConfig[announcement.category].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-2">
            {announcement.content}
          </p>
          <div className="mt-4 flex items-center text-sm text-primary">
            Read more
            <ChevronRight className="size-4 ml-1" />
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
