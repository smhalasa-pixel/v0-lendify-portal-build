'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  Tag,
  Share2,
  Printer,
} from 'lucide-react'

import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const categoryColors: Record<string, string> = {
  Products: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  Tools: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Compliance: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  Processes: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function KnowledgeArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isHelpful, setIsHelpful] = React.useState(false)

  const allArticles = React.useMemo(() => dataService.getKnowledgeArticles(), [])
  const article = allArticles.find((a) => a.id === id)

  const relatedArticles = React.useMemo(() => {
    if (!article) return []
    return allArticles
      .filter(
        (a) =>
          a.id !== article.id &&
          (a.category === article.category ||
            a.tags.some((tag) => article.tags.includes(tag)))
      )
      .slice(0, 3)
  }, [allArticles, article])

  if (!article) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Article not found</p>
            <Button variant="outline" onClick={() => router.push('/knowledge')}>
              Back to Knowledge Base
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/knowledge">
            <ArrowLeft className="size-4 mr-2" />
            Back to Knowledge Base
          </Link>
        </Button>

        {/* Main Content */}
        <Card className="mt-4">
          <CardHeader className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={categoryColors[article.category] || ''}
              >
                {article.category}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {article.authorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                Updated {formatDate(article.updatedDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" />
                {article.views.toLocaleString()} views
              </span>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="size-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article.content}
              </p>

              {/* Placeholder for more content */}
              <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-muted-foreground text-center text-sm">
                  Full article content would appear here. This is a demo with truncated content.
                </p>
              </div>
            </div>

            {/* Actions */}
            <Separator className="my-6" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Was this article helpful?
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isHelpful ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsHelpful(true)}
                    disabled={isHelpful}
                  >
                    <ThumbsUp className="size-4 mr-2" />
                    {isHelpful ? 'Thanks!' : 'Yes, helpful'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {article.helpful + (isHelpful ? 1 : 0)} found this helpful
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="size-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="size-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Card
                  key={related.id}
                  className="group hover:border-primary/50 transition-colors"
                >
                  <Link href={`/knowledge/${related.id}`}>
                    <CardContent className="p-4">
                      <Badge
                        variant="outline"
                        className={`${categoryColors[related.category] || ''} mb-2`}
                      >
                        {related.category}
                      </Badge>
                      <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {related.content}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
