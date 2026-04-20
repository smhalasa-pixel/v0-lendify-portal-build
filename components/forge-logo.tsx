'use client'

import * as React from 'react'

interface ForgeLogoProps {
  variant?: 'primary' | 'light' | 'icon-dark' | 'icon-gold' | 'icon-light'
  width?: number
  className?: string
  ariaLabel?: string
}

/**
 * Forge brand mark — Mjolnir hammer icon with optional FORGE wordmark +
 * "SALES · FORGED · DAILY" tagline. Used in the sidebar, login page, and
 * any other surface that needs the brand.
 */
export function ForgeLogo({
  variant = 'primary',
  width = 180,
  className = '',
  ariaLabel = 'Forge',
}: ForgeLogoProps) {
  const hammerId = React.useId()
  const isIcon = variant.startsWith('icon-')

  const iconBg =
    variant === 'icon-light'
      ? '#FFFFFF'
      : variant === 'icon-gold'
        ? '#E8B746'
        : '#1A1A1A'

  const HammerSvg = (
    <svg viewBox="-60 -60 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${hammerId}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="50%" stopColor="#909090" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <filter id={`${hammerId}-shadow`}>
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${hammerId}-shadow)`}>
        <rect x="-28" y="-34" width="56" height="24" rx="3" fill={`url(#${hammerId}-metal)`} />
        <line x1="-20" y1="-26" x2="20" y2="-26" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
        <line x1="-14" y1="-18" x2="14" y2="-18" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-18" cy="-22" r="2.2" fill="#3A3A3A" />
        <circle cx="0" cy="-22" r="2.2" fill="#3A3A3A" />
        <circle cx="18" cy="-22" r="2.2" fill="#3A3A3A" />
        <rect x="-6" y="-10" width="12" height="58" rx="1.5" fill="#8B6B4A" />
        <line x1="-4" y1="4" x2="4" y2="4" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="18" x2="4" y2="18" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="-4" y1="32" x2="4" y2="32" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="0" cy="52" rx="8" ry="5" fill={`url(#${hammerId}-metal)`} />
      </g>
    </svg>
  )

  if (isIcon) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg ${className}`}
        style={{ width, height: width, backgroundColor: iconBg }}
        role="img"
        aria-label={ariaLabel || ''}
      >
        <div style={{ width: '72%', height: '72%' }}>{HammerSvg}</div>
      </div>
    )
  }

  const wordmarkColor = variant === 'light' ? '#FFFFFF' : '#FAFAFA'
  const dividerColor = variant === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(250,250,250,0.15)'
  const markSize = width * 0.3

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label={ariaLabel}>
      <div
        className="inline-flex items-center justify-center rounded-lg"
        style={{
          width: markSize,
          height: markSize,
          backgroundColor: '#1A1A1A',
          flexShrink: 0,
        }}
      >
        <div style={{ width: '72%', height: '72%' }}>{HammerSvg}</div>
      </div>
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: `${width * 0.17}px`,
            fontWeight: 700,
            letterSpacing: `${width * 0.03}px`,
            color: wordmarkColor,
            lineHeight: 1,
          }}
        >
          FORGE
        </span>
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: dividerColor,
            marginTop: `${width * 0.025}px`,
            marginBottom: `${width * 0.025}px`,
          }}
        />
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${width * 0.045}px`,
            fontWeight: 700,
            letterSpacing: `${width * 0.009}px`,
            color: '#E8B746',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          SALES · FORGED · DAILY
        </span>
      </div>
    </div>
  )
}
