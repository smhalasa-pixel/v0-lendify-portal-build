'use client'

import * as React from 'react'

interface ForgeLogoProps {
  variant?: 'primary' | 'light' | 'icon-dark' | 'icon-gold' | 'icon-light'
  width?: number
  className?: string
  ariaLabel?: string
}

function Mjolnir({ id }: { id: string }) {
  return (
    <svg viewBox="-60 -60 120 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C5C5C5" />
          <stop offset="50%" stopColor="#929292" />
          <stop offset="100%" stopColor="#5F5F5F" />
        </linearGradient>
      </defs>
      <rect x="-28" y="-34" width="56" height="24" rx="3" fill={`url(#${id}-metal)`} />
      <line x1="-20" y1="-26" x2="20" y2="-26" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
      <line x1="-14" y1="-18" x2="14" y2="-18" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-18" cy="-22" r="2.2" fill="#3A3A3A" />
      <circle cx="0" cy="-22" r="2.2" fill="#3A3A3A" />
      <circle cx="18" cy="-22" r="2.2" fill="#3A3A3A" />
      <rect x="-6" y="-10" width="12" height="58" rx="1.5" fill="#8B6B4A" />
      <line x1="-4" y1="4" x2="4" y2="4" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="-4" y1="18" x2="4" y2="18" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="-4" y1="32" x2="4" y2="32" stroke="#5A4232" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="0" cy="52" rx="8" ry="5" fill={`url(#${id}-metal)`} />
    </svg>
  )
}

export function ForgeLogo({
  variant = 'primary',
  width = 180,
  className = '',
  ariaLabel = 'Forge',
}: ForgeLogoProps) {
  const id = React.useId().replace(/:/g, '')
  const isIcon = variant.startsWith('icon-')

  if (isIcon) {
    const bg = variant === 'icon-light' ? '#FFFFFF' : variant === 'icon-gold' ? '#E8B746' : '#0A0A0B'
    return (
      <div
        className={`inline-flex items-center justify-center rounded-lg ${className}`}
        style={{ width: `${width}px`, height: `${width}px`, backgroundColor: bg }}
        role="img"
        aria-label={ariaLabel || ''}
      >
        <div style={{ width: '72%', height: '72%' }}>
          <Mjolnir id={id} />
        </div>
      </div>
    )
  }

  const em = width / 12
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label={ariaLabel}>
      <div style={{ width: `${em * 3.2}px`, height: `${em * 3.2}px`, flexShrink: 0 }}>
        <Mjolnir id={id} />
      </div>
      <div className="flex flex-col justify-center">
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: `${em * 2.4}px`,
            fontWeight: 700,
            letterSpacing: `${em * 0.45}px`,
            color: variant === 'light' ? '#FFFFFF' : '#FAFAFA',
            lineHeight: 1,
          }}
        >
          FORGE
        </span>
        <div
          style={{
            height: '1px',
            backgroundColor: variant === 'light' ? 'rgba(255,255,255,0.25)' : 'rgba(250,250,250,0.15)',
            margin: `${em * 0.4}px 0`,
          }}
        />
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${em * 0.7}px`,
            fontWeight: 700,
            letterSpacing: `${em * 0.18}px`,
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
