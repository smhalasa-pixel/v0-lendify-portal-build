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

const priorityConfig: Record<string, { bg: string; text: string; glow: string }> = {
  low: { bg: 'bg-slate-500/20', text: 'text-slate-300', glow: '' },
  medium: { bg: 'bg-blue-500/20', text: 'text-blue-300', glow: '' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-300', glow: 'shadow-orange-500/20' },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-300', glow: 'shadow-red-500/30 animate-pulse' },
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
    <Card className="glass-card border-purple-500/20 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center">
            <Megaphone className="size-4 text-purple-300" />
          </div>
          <div>
            <CardTitle className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Announcements
            </CardTitle>
            <CardDescription className="text-purple-300/60">Latest updates and news</CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-500/20" asChild>
          <Link href="/announcements" className="flex items-center gap-1">
            View all
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {displayAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-purple-300/50">
              <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <Megaphone className="size-5 opacity-50" />
              </div>
              <p>No announcements</p>
            </div>
          ) : (
            displayAnnouncements.map((announcement, index) => {
              const isUnread = userId && !announcement.readBy.includes(userId)
              const config = priorityConfig[announcement.priority] || priorityConfig.low
              return (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`
                    relative flex items-start gap-3 p-3 rounded-xl 
                    bg-purple-500/5 hover:bg-purple-500/15 
                    border border-transparent hover:border-purple-500/20
                    transition-all duration-300
                    ${announcement.isPinned ? 'ring-1 ring-purple-500/20' : ''}
                  `}>
                    {/* Unread indicator glow */}
                    {isUnread && (
                      <div className="absolute -left-px top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50" />
                    )}
                    
                    {announcement.isPinned && (
                      <div className="size-6 rounded-md bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Pin className="size-3 text-purple-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-white/90 truncate group-hover:text-purple-200 transition-colors">
                          {announcement.title}
                        </h4>
                        {isUnread && (
                          <div className="size-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shrink-0 shadow-lg shadow-purple-500/50" />
                        )}
                      </div>
                      <p className="text-xs text-purple-200/50 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`${config.bg} ${config.text} border-current/20 text-[10px] px-1.5 py-0 shadow-sm ${config.glow}`}
                        >
                          {announcement.priority}
                        </Badge>
                        <span className="text-[10px] text-purple-300/50 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          {categoryLabels[announcement.category]}
                        </span>
                        <span className="text-[10px] text-purple-300/40 ml-auto">
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
