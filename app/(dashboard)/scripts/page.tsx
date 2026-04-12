'use client'

import * as React from 'react'
import {
  Search,
  FileText,
  Star,
  Copy,
  Check,
  Tag,
  MessageSquare,
  Target,
  Lightbulb,
  RefreshCw,
  Users,
} from 'lucide-react'

import { dataService } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Script } from '@/lib/types'

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  objection: {
    label: 'Objection Handling',
    icon: <MessageSquare className="size-4" />,
    color: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  },
  closing: {
    label: 'Closing',
    icon: <Target className="size-4" />,
    color: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  },
  discovery: {
    label: 'Discovery',
    icon: <Lightbulb className="size-4" />,
    color: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  },
  'follow-up': {
    label: 'Follow-Up',
    icon: <RefreshCw className="size-4" />,
    color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  },
  referral: {
    label: 'Referral',
    icon: <Users className="size-4" />,
    color: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  },
}

export default function ScriptsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

  const allScripts = React.useMemo(() => dataService.getScripts(), [])

  // Filter scripts
  const filteredScripts = React.useMemo(() => {
    let scripts = allScripts

    if (searchQuery) {
      scripts = dataService.searchScripts(searchQuery)
    }

    if (selectedCategory !== 'all') {
      scripts = scripts.filter((s) => s.category === selectedCategory)
    }

    return scripts
  }, [allScripts, searchQuery, selectedCategory])

  // Top rated scripts
  const topRatedScripts = React.useMemo(() => {
    return [...allScripts].sort((a, b) => b.rating - a.rating).slice(0, 3)
  }, [allScripts])

  // Most used scripts
  const mostUsedScripts = React.useMemo(() => {
    return [...allScripts].sort((a, b) => b.usageCount - a.usageCount).slice(0, 3)
  }, [allScripts])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales Scripts</h1>
        <p className="text-muted-foreground">
          Proven scripts for every situation - objections, closing, and more
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Search scripts by title, scenario, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allScripts.length}</p>
                <p className="text-sm text-muted-foreground">Total Scripts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Star className="size-6 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(allScripts.reduce((sum, s) => sum + s.rating, 0) / allScripts.length).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Target className="size-6 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allScripts.reduce((sum, s) => sum + s.usageCount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Users className="size-6 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(categoryConfig).length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Scripts
          </TabsTrigger>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
            >
              {config.icon}
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No scripts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or category
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredScripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScriptCard({ script }: { script: Script }) {
  const [copied, setCopied] = React.useState(false)
  const config = categoryConfig[script.category]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={config.color}>
                {config.icon}
                <span className="ml-1.5">{config.label}</span>
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="size-3 fill-chart-3 text-chart-3" />
                <span className="font-medium">{script.rating.toFixed(1)}</span>
              </div>
            </div>
            <CardTitle className="text-lg">{script.title}</CardTitle>
            <CardDescription>{script.scenario}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="size-4 mr-1.5 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Script Content */}
        <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm leading-relaxed">
          {script.content}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>{script.usageCount.toLocaleString()} uses</span>
          <span>By {script.authorName}</span>
        </div>

        {/* Tags */}
        {script.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {script.tags.map((tag) => (
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
    </Card>
  )
}
