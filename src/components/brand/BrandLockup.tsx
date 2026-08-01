import { APP_CONFIG } from '@/config/design-system'
import { cn } from '@/utils/cn'

import { BrandLogo } from './BrandLogo'

type BrandLockupTone = 'color' | 'reversed'
type BrandLockupOrientation = 'horizontal' | 'stacked'

interface BrandLockupProps {
  tone?: BrandLockupTone
  orientation?: BrandLockupOrientation
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  decorative?: boolean
}

export function BrandLockup({
  tone = 'color',
  orientation = 'horizontal',
  className,
  markClassName,
  wordmarkClassName,
  decorative = false,
}: BrandLockupProps) {
  const reversed = tone === 'reversed'

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        orientation === 'stacked' ? 'flex-col gap-4' : 'gap-3',
        className,
      )}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : APP_CONFIG.name}
      aria-hidden={decorative || undefined}
    >
      <BrandLogo
        variant={reversed ? 'mark-light' : 'mark'}
        className={cn('shrink-0', markClassName)}
        decorative
      />
      <BrandLogo
        variant={reversed ? 'wordmark-light' : 'wordmark'}
        className={cn('shrink-0', wordmarkClassName)}
        decorative
      />
    </div>
  )
}
