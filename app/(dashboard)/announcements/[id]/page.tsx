'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pin,
  Calendar,
  User,
  Clock,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  low: { label: 'Low Priority', variant: 'outline' },
  medium: { label: 'Medium Priority', variant: 'secondary' },
  high: { label: 'High Priority', variant: 'default' },
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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params.id as string

  const announcements = React.useMemo(() => dataService.getAnnouncements(), [])
  const announcement = announcements.find((a) => a.id === id)

  // Mark as read when viewed
  React.useEffect(() => {
    if (announcement && user && !announcement.readBy.includes(user.id)) {
      dataService.markAnnouncementRead(announcement.id, user.id)
    }
  }, [announcement, user])

  if (!announcement) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Announcement not found</p>
            <Button variant="outline" onClick={() => router.push('/announcements')}>
              Back to Announcements
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/announcements">
          <ArrowLeft className="size-4 mr-2" />
          Back to Announcements
        </Link>
      </Button>

      {/* Main Content */}
      <Card>
        <CardHeader className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {announcement.isPinned && (
              <Badge variant="default" className="gap-1">
                <Pin className="size-3" />
                Pinned
              </Badge>
            )}
            <Badge variant={priorityConfig[announcement.priority].variant}>
              {priorityConfig[announcement.priority].label}
            </Badge>
            <Badge
              variant="outline"
              className={categoryConfig[announcement.category].color}
            >
              {categoryConfig[announcement.category].label}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight">
            {announcement.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {announcement.authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(announcement.publishedDate)}
            </span>
            {announcement.expiresDate && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Expires: {formatDate(announcement.expiresDate)}
              </span>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Announcements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Related Announcements</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {announcements
            .filter(
              (a) =>
                a.id !== announcement.id &&
                a.category === announcement.category
            )
            .slice(0, 2)
            .map((related) => (
              <Card
                key={related.id}
                className="group hover:border-primary/50 transition-colors"
              >
                <Link href={`/announcements/${related.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {related.isPinned && (
                        <Pin className="size-4 text-primary shrink-0 mt-0.5" />
                      )}
                      <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {related.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.content}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
