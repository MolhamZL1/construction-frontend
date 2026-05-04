import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/authStore'

interface SidebarLink {
  label: string
  icon: string
  to: string
}

const links: SidebarLink[] = [
  {
    label: 'لوحة التحكم',
    to: '/dashboard',
    icon: 'grid',
  },
  {
    label: 'المستخدمون',
    to: '/users',
    icon: 'users',
  },
  {
    label: 'المعدات',
    to: '/equipments',
    icon: 'equipment',
  },
]

export function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const displayName = user?.name ?? 'حسام زينة'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white px-4 py-4 lg:h-screen lg:w-72 lg:border-b-0 lg:border-l lg:border-slate-200" dir="rtl">
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end
            className={({ isActive }) =>
              cn(
                'flex h-10 shrink-0 items-center justify-start gap-3 rounded-lg px-4 text-sm font-medium text-slate-500 transition lg:h-11',
                isActive
                  ? 'bg-[#50683f] text-white shadow-sm'
                  : 'hover:bg-slate-50 hover:text-[#50683f]'
              )
            }
          >
            <MenuIcon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 hidden rounded-xl bg-slate-50 p-3 lg:flex lg:items-center lg:gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#50683f] text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-xs text-slate-500">مدير المشاريع</p>
        </div>
      </div>
    </aside>
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
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3.5 20a5.5 5.5 0 0 1 11 0M17 9a3 3 0 1 0 0-6M16 14a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'equipment') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h10v8H4zM14 10h4l2 3v2h-6zM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'list') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 7h10M9 12h10M9 17h10M4.5 7l1 1 2-2M4.5 12l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'hammer') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 5l5 5M13 6l-8 8 5 5 8-8M4 20l5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M8.5 12.5l2.3 2.3 4.7-5.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'document') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'alert') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v6M12 16.5v.1" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'box') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'truck') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h10v8H4zM14 10h4l2 3v2h-6zM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'invoice') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h10l2 3v15l-3-2-3 2-3-2-3 2zM10 9h5M10 13h5M10 17h3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === 'nodes') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M9 7h3a3 3 0 0 1 3 3v5" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'folder') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h6l2 2h8v10H4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 19V9M11 19V5M17 19v-7" strokeLinecap="round" />
    </svg>
  )
}
