'use client'

import Link from 'next/link'
import { Pin, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Announcement } from '@/lib/types'

interface AnnouncementsListProps {
  announcements: Announcement[]
  userId?: string
  limit?: number
}

const priorityVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  policy: 'Policy',
  product: 'Product',
  training: 'Training',
  compliance: 'Compliance',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function AnnouncementsList({
  announcements,
  userId,
  limit = 5,
}: AnnouncementsListProps) {
  const displayAnnouncements = announcements.slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Latest updates and news</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/announcements" className="flex items-center gap-1">
            View all
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayAnnouncements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No announcements
            </p>
          ) : (
            displayAnnouncements.map((announcement) => {
              const isUnread = userId && !announcement.readBy.includes(userId)
              return (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    {announcement.isPinned && (
                      <Pin className="size-4 text-primary mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {announcement.title}
                        </h4>
                        {isUnread && (
                          <div className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={priorityVariants[announcement.priority]}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {announcement.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {categoryLabels[announcement.category]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(announcement.publishedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
