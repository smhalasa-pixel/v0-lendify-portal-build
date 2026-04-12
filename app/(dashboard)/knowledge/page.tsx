'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  BookOpen,
  Eye,
  ThumbsUp,
  Calendar,
  Tag,
  ChevronRight,
  FileText,
  Shield,
  Settings,
  GraduationCap,
} from 'lucide-react'

import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { KnowledgeArticle } from '@/lib/types'

const categoryIcons: Record<string, React.ReactNode> = {
  Products: <FileText className="size-5" />,
  Tools: <Settings className="size-5" />,
  Compliance: <Shield className="size-5" />,
  Processes: <GraduationCap className="size-5" />,
}

const categoryColors: Record<string, string> = {
  Products: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  Tools: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Compliance: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  Processes: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const allArticles = React.useMemo(() => dataService.getKnowledgeArticles(), [])

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = [...new Set(allArticles.map((a) => a.category))]
    return cats.map((cat) => ({
      name: cat,
      count: allArticles.filter((a) => a.category === cat).length,
    }))
  }, [allArticles])

  // Filter articles
  const filteredArticles = React.useMemo(() => {
    let articles = allArticles

    if (searchQuery) {
      articles = dataService.searchKnowledgeArticles(searchQuery)
    }

    if (selectedCategory) {
      articles = articles.filter((a) => a.category === selectedCategory)
    }

    return articles
  }, [allArticles, searchQuery, selectedCategory])

  // Popular articles (by views)
  const popularArticles = React.useMemo(() => {
    return [...allArticles].sort((a, b) => b.views - a.views).slice(0, 3)
  }, [allArticles])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find guides, policies, and resources to help you succeed
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search articles, guides, and documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={selectedCategory === null ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
              >
                <BookOpen className="size-4 mr-2" />
                All Articles
                <Badge variant="outline" className="ml-auto">
                  {allArticles.length}
                </Badge>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {categoryIcons[category.name] || <FileText className="size-4" />}
                  <span className="ml-2">{category.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Popular Articles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/knowledge/${article.id}`}
                  className="block group"
                >
                  <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {article.title}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Eye className="size-3" />
                    {article.views.toLocaleString()} views
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {selectedCategory && ` in ${selectedCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            {(selectedCategory || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchQuery('')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No articles found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: KnowledgeArticle }) {
  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <Link href={`/knowledge/${article.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={categoryColors[article.category] || ''}
                >
                  {article.category}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {article.title}
              </CardTitle>
            </div>
            <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {article.content}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Updated {formatDate(article.updatedDate)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {article.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {article.helpful} found helpful
            </span>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {article.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  <Tag className="size-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
