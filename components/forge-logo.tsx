'use client'

import * as React from 'react'

interface ForgeLogoProps {
  variant?: 'primary' | 'light' | 'icon-dark' | 'icon-gold' | 'icon-light'
  width?: number
  className?: string
  ariaLabel?: string
}

export function ForgeLogo({
  variant = 'primary',
  width = 180,
  className = '',
  ariaLabel = 'Forge',
}: ForgeLogoProps) {
  const hammerId = React.useId()
  const isIcon = variant.startsWith('icon-')

  if (isIcon) {
    const iconBg =
      variant === 'icon-light' ? '#FFFFFF' : variant === 'icon-gold' ? '#E8B746' : '#1A1A1A'
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg ${className}`}
        style={{
          width: `${width}px`,
          height: `${width}px`,
          backgroundColor: iconBg,
        }}
        role="img"
        aria-label={ariaLabel || ''}
      >
        <svg
          viewBox="-60 -60 120 120"
          style={{ width: '70%', height: '70%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${hammerId}-metal`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8B8B8" />
              <stop offset="50%" stopColor="#909090" />
              <stop offset="100%" stopColor="#6A6A6A" />
            </linearGradient>
            <filter id={`${hammerId}-shadow`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter={`url(#${hammerId}-shadow)`}>
            <rect
              x="-28"
              y="-34"
              width="56"
              height="24"
              rx="3"
              fill={`url(#${hammerId}-metal)`}
            />
            <line
              x1="-20"
              y1="-26"
              x2="20"
              y2="-26"
              stroke="#5A5A5A"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="-14"
              y1="-18"
              x2="14"
              y2="-18"
              stroke="#5A5A5A"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="-18" cy="-22" r="2.5" fill="#4A4A4A" />
            <circle cx="0" cy="-22" r="2.5" fill="#4A4A4A" />
            <circle cx="18" cy="-22" r="2.5" fill="#4A4A4A" />
            <rect x="-6" y="-10" width="12" height="58" rx="1.5" fill="#7A5C42" />
            <line
              x1="-4"
              y1="0"
              x2="4"
              y2="0"
              stroke="#5A4232"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="12"
              x2="4"
              y2="12"
              stroke="#5A4232"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="24"
              x2="4"
              y2="24"
              stroke="#5A4232"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="-4"
              y1="36"
              x2="4"
              y2="36"
              stroke="#5A4232"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <ellipse cx="0" cy="52" rx="8" ry="6" fill={`url(#${hammerId}-metal)`} />
            <path d="M -4,52 Q 0,60 4,52 Z" fill="#5A5A5A" />
          </g>
        </svg>
      </div>
    )
  }

  const em = width / 12
  return (
    <div className={`inline-flex items-center gap-[${em * 1.2}px] ${className}`} role="img" aria-label={ariaLabel}>
      <svg
        viewBox="-60 -60 120 120"
        style={{ width: `${em * 3.5}px`, height: `${em * 3.5}px`, flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${hammerId}-metal`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8B8B8" />
            <stop offset="50%" stopColor="#909090" />
            <stop offset="100%" stopColor="#6A6A6A" />
          </linearGradient>
          <filter id={`${hammerId}-shadow`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>
        <g filter={`url(#${hammerId}-shadow)`}>
          <rect x="-28" y="-34" width="56" height="24" rx="3" fill={`url(#${hammerId}-metal)`} />
          <line x1="-20" y1="-26" x2="20" y2="-26" stroke="#5A5A5A" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="-14" y1="-18" x2="14" y2="-18" stroke="#5A5A5A" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="-18" cy="-22" r="2.5" fill="#4A4A4A" />
          <circle cx="0" cy="-22" r="2.5" fill="#4A4A4A" />
          <circle cx="18" cy="-22" r="2.5" fill="#4A4A4A" />
          <rect x="-6" y="-10" width="12" height="58" rx="1.5" fill="#7A5C42" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-4" y1="12" x2="4" y2="12" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-4" y1="24" x2="4" y2="24" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-4" y1="36" x2="4" y2="36" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="0" cy="52" rx="8" ry="6" fill={`url(#${hammerId}-metal)`} />
          <path d="M -4,52 Q 0,60 4,52 Z" fill="#5A5A5A" />
        </g>
      </svg>
      <div className="flex flex-col gap-[${em * 0.5}px]">
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: `${em * 2.8}px`,
            fontWeight: 700,
            letterSpacing: `${em * 0.52}px`,
            color: variant === 'light' ? '#FFFFFF' : '#FAFAFA',
            lineHeight: 1,
          }}
        >
          FORGE
        </span>
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: variant === 'light' ? 'rgba(255,255,255,0.3)' : 'rgba(250,250,250,0.15)',
            marginTop: `${em * 0.3}px`,
            marginBottom: `${em * 0.3}px`,
          }}
        />
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${em * 0.7}px`,
            fontWeight: 700,
            letterSpacing: `${em * 0.15}px`,
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
