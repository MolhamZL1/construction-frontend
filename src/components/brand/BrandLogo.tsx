import { cn } from '@/utils/cn'

import { APP_CONFIG, BRAND_ASSETS } from '@/config/design-system'

type BrandLogoVariant =
  | 'horizontal'
  | 'horizontal-reversed'
  | 'stacked'
  | 'stacked-reversed'
  | 'wordmark'
  | 'wordmark-light'
  | 'mark'
  | 'mark-ink'
  | 'mark-paper'
  | 'mark-light'
  | 'light'

interface BrandLogoProps {
  variant?: BrandLogoVariant
  className?: string
  decorative?: boolean
}

const sources: Record<BrandLogoVariant, string> = {
  horizontal: BRAND_ASSETS.horizontal,
  'horizontal-reversed': BRAND_ASSETS.horizontalReversed,
  stacked: BRAND_ASSETS.stacked,
  'stacked-reversed': BRAND_ASSETS.stackedReversed,
  wordmark: BRAND_ASSETS.wordmark,
  'wordmark-light': BRAND_ASSETS.wordmarkLight,
  mark: BRAND_ASSETS.icon,
  'mark-ink': BRAND_ASSETS.iconInk,
  'mark-paper': BRAND_ASSETS.iconPaper,
  'mark-light': BRAND_ASSETS.iconLight,
  light: BRAND_ASSETS.horizontalReversed,
}

export function BrandLogo({ variant = 'horizontal', className, decorative = false }: BrandLogoProps) {
  return (
    <img
      src={sources[variant]}
      alt={decorative ? '' : APP_CONFIG.name}
      aria-hidden={decorative || undefined}
      className={cn('block h-auto max-w-full select-none object-contain', className)}
      draggable={false}
    />
  )
}
