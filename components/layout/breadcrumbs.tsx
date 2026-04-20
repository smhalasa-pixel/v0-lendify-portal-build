'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { breadcrumbLabels } from '@/lib/breadcrumbs'

export function Breadcrumbs() {
  const pathname = usePathname()
  if (!pathname || pathname === '/' || pathname === '/login') return null

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let acc = ''
  for (const seg of segments) {
    acc += '/' + seg
    const label = breadcrumbLabels[acc] ?? breadcrumbLabels[seg] ?? formatSegment(seg)
    crumbs.push({ label, href: acc })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        Home
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={c.href}>
          <ChevronRight className="size-3" aria-hidden />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

function formatSegment(seg: string) {
  // Drop route group parens, format kebab, uppercase single letters
  if (seg.startsWith('(') && seg.endsWith(')')) return ''
  return seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
