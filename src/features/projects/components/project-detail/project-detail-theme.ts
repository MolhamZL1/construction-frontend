export type ProjectDetailAccent = 'blue' | 'cyan' | 'emerald' | 'green' | 'orange' | 'pink' | 'purple'

export const projectDetailAccentClasses: Record<
  ProjectDetailAccent,
  {
    text: string
    iconBox: string
    softBox: string
    border: string
  }
> = {
  blue: {
    text: 'text-blue-600',
    iconBox: 'bg-blue-100 text-blue-600',
    softBox: 'bg-blue-50 text-blue-600',
    border: 'hover:border-blue-200',
  },
  cyan: {
    text: 'text-cyan-600',
    iconBox: 'bg-cyan-100 text-cyan-600',
    softBox: 'bg-cyan-50 text-cyan-600',
    border: 'hover:border-cyan-200',
  },
  emerald: {
    text: 'text-emerald-600',
    iconBox: 'bg-emerald-100 text-emerald-600',
    softBox: 'bg-emerald-50 text-emerald-600',
    border: 'hover:border-emerald-200',
  },
  green: {
    text: 'text-[#50683f]',
    iconBox: 'bg-[#50683f]/10 text-[#50683f]',
    softBox: 'bg-[#50683f]/5 text-[#50683f]',
    border: 'hover:border-[#50683f]/30',
  },
  orange: {
    text: 'text-orange-600',
    iconBox: 'bg-orange-100 text-orange-600',
    softBox: 'bg-orange-50 text-orange-600',
    border: 'hover:border-orange-200',
  },
  pink: {
    text: 'text-pink-600',
    iconBox: 'bg-pink-100 text-pink-600',
    softBox: 'bg-pink-50 text-pink-600',
    border: 'hover:border-pink-200',
  },
  purple: {
    text: 'text-purple-600',
    iconBox: 'bg-purple-100 text-purple-600',
    softBox: 'bg-purple-50 text-purple-600',
    border: 'hover:border-purple-200',
  },
}
