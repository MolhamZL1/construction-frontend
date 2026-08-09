import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { BrandLogo } from '@/components/brand/BrandLogo'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

interface SidebarLink {
  label: string
  icon: string
  to: string
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const links: SidebarLink[] = [
  { label: 'لوحة التحكم', to: '/dashboard', icon: 'grid' },
  { label: 'المشاريع', to: '/projects', icon: 'projects' },
  { label: 'المستخدمون', to: '/users', icon: 'users' },
  { label: 'المعدات', to: '/equipments', icon: 'equipment' },
  { label: 'المواد', to: '/materials', icon: 'box' },
]

export function Sidebar({
  mobileOpen = false,
  onMobileClose = () => undefined,
}: SidebarProps) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [logoRotation, setLogoRotation] = useState(0)

  function handleDesktopLogoClick() {
    setLogoRotation((currentRotation) => currentRotation + 360)
    toggleSidebar()
  }

  return (
    <>
      <button
        type="button"
        onClick={onMobileClose}
        className={cn(
          'fixed inset-0 z-[80] bg-[rgb(var(--color-brand-ink-deep-rgb)/0.42)] backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
          mobileOpen
            ? 'visible pointer-events-auto opacity-100'
            : 'invisible pointer-events-none opacity-0',
        )}
        aria-label="إغلاق القائمة الرئيسية"
        tabIndex={mobileOpen ? 0 : -1}
      />

      <aside
        id="app-sidebar"
        className={cn(
          'fixed right-0 top-0 z-[90] flex h-dvh w-[min(20rem,88vw)] flex-col border-l border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white px-4 py-4 shadow-[-18px_0_55px_rgb(var(--color-brand-ink-deep-rgb)/0.18)] transition-transform duration-300 ease-out',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:border-l lg:px-3 lg:py-5 lg:shadow-[0_1px_4px_rgb(var(--color-brand-ink-rgb)/0.04)] lg:transition-[width,padding] lg:duration-300',
          sidebarOpen ? 'lg:w-72 lg:px-5' : 'lg:w-20 lg:px-3',
        )}
        dir="rtl"
      >
        <div
          className={cn(
            'mb-5 flex min-h-[68px] items-center rounded-2xl border border-[rgb(var(--color-brand-gold-rgb)/0.2)] bg-[var(--color-brand-paper)] px-3 shadow-[0_10px_26px_rgb(var(--color-brand-ink-rgb)/0.05)] transition-[min-height,padding,border-color,background-color,box-shadow] duration-300 hover:border-[rgb(var(--color-brand-gold-rgb)/0.45)] hover:bg-[var(--color-brand-paper-hover)] lg:mb-6',
            sidebarOpen ? 'lg:justify-between lg:gap-4' : 'lg:justify-center lg:min-h-[68px] lg:px-2',
          )}
        >
          <div
            className={cn(
              'min-w-0 flex-1 text-right transition-opacity duration-200',
              !sidebarOpen && 'lg:hidden',
            )}
          >
            <BrandLogo variant="wordmark" className="mr-0 w-[104px]" />
          </div>

          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--color-brand-ink-rgb)/0.1)] bg-white text-[var(--color-brand-ink)] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-gold-rgb)/0.45)] lg:hidden"
            aria-label="إغلاق القائمة الرئيسية"
            title="إغلاق القائمة"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDesktopLogoClick}
            className="group hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--color-brand-gold-rgb)/0.22)] bg-white/85 shadow-sm transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.58)] hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-gold-rgb)/0.45)] lg:flex"
            aria-label={sidebarOpen ? 'تصغير القائمة الجانبية' : 'توسيع القائمة الجانبية'}
            title={sidebarOpen ? 'تصغير القائمة الجانبية' : 'توسيع القائمة الجانبية'}
          >
            <span
              className="flex transform-gpu items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `rotate(${logoRotation}deg)` }}
            >
              <BrandLogo variant="mark" className="h-6 w-6" decorative />
            </span>
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto pb-3"
          aria-label="القائمة الرئيسية"
        >
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  'group flex h-12 w-full shrink-0 items-center justify-start gap-3 rounded-xl px-4 text-sm font-bold transition lg:h-11',
                  !sidebarOpen && 'lg:justify-center lg:px-0',
                  isActive
                    ? 'bg-[var(--color-brand-ink)] text-white shadow-[0_10px_24px_rgb(var(--color-brand-ink-rgb)/0.18)]'
                    : 'text-[var(--color-brand-stone)] hover:bg-[var(--color-brand-gold-surface)] hover:text-[var(--color-brand-ink)]',
                )
              }
            >
              <MenuIcon name={link.icon} />
              <span className={cn('truncate', !sidebarOpen && 'lg:hidden')}>
                {link.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

function MenuIcon({ name }: { name: string }) {
  const className = 'h-5 w-5 shrink-0'

  if (name === 'grid') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </svg>
    )
  }

  if (name === 'projects') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 21v-3a6 6 0 0 1 12 0v3M16 8a3 3 0 0 1 0 6M17 16a5 5 0 0 1 4 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'equipment') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17h16M7 17V8h10v9M9 8V5h6v3M9 21h.01M15 21h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 8 8-4 8 4-8 4-8-4Z" strokeLinejoin="round" />
      <path d="M4 8v8l8 4 8-4V8M12 12v8" strokeLinejoin="round" />
    </svg>
  )
}
