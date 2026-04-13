'use client'

import Link from 'next/link'
import { Pin, ChevronRight, Megaphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Announcement } from '@/lib/types'

interface AnnouncementsListProps {
  announcements: Announcement[]
  userId?: string
  limit?: number
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-500/20', text: 'text-slate-300' },
  medium: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-300' },
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
    <Card className="glass-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Megaphone className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-foreground">Announcements</CardTitle>
            <CardDescription>Latest updates and news</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
          <Link href="/announcements" className="flex items-center gap-1">
            View all
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {displayAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Megaphone className="size-8 mb-2 opacity-50" />
              <p>No announcements</p>
            </div>
          ) : (
            displayAnnouncements.map((announcement) => {
              const isUnread = userId && !announcement.readBy.includes(userId)
              const config = priorityConfig[announcement.priority] || priorityConfig.low
              return (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block"
                >
                  <div className={`
                    relative flex items-start gap-3 p-3 rounded-lg 
                    hover:bg-muted/30 transition-colors
                    ${announcement.isPinned ? 'border border-primary/20' : ''}
                  `}>
                    {isUnread && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />
                    )}
                    
                    {announcement.isPinned && (
                      <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Pin className="size-3 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {announcement.title}
                        </h4>
                        {isUnread && (
                          <div className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`${config.bg} ${config.text} border-current/20 text-[10px] px-1.5 py-0`}
                        >
                          {announcement.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {categoryLabels[announcement.category]}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
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
