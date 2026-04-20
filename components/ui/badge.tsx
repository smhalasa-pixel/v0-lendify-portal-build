import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Forge Badge — outline-first. Status badges use a border + tinted text on a
 * transparent background so they read calm and enterprise, not sticker-like.
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 tabular-nums gap-1 [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground bg-transparent',
        muted: 'border-border text-muted-foreground bg-transparent',
        success: 'border-emerald-500/40 text-emerald-400 bg-transparent',
        warning: 'border-amber-500/40 text-amber-400 bg-transparent',
        destructive: 'border-red-500/40 text-red-400 bg-transparent',
        info: 'border-blue-500/40 text-blue-400 bg-transparent',
        accent: 'border-[color:var(--accent)]/50 text-[color:var(--accent)] bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
