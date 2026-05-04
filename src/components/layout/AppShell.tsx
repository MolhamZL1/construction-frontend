import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/stores/authStore'

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row" dir="rtl">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] sm:px-6" dir="ltr">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4eb] text-[#50683f] transition hover:bg-[#e1ebdc]"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 sm:flex"
              aria-label="الإعدادات"
              title="الإعدادات"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path d="M19 12a7.5 7.5 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.9-1.1L14.3 3h-4l-.4 2.9A8 8 0 0 0 8 7L5.6 6l-2 3.4 2 1.5A7.5 7.5 0 0 0 5.5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4L8 17a8 8 0 0 0 1.9 1.1l.4 2.9h4l.4-2.9a8 8 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 sm:flex"
              aria-label="الإشعارات"
              title="الإشعارات"
            >
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mx-3 flex max-w-[580px] flex-1 items-center rounded-xl bg-slate-100 px-4 text-slate-500 sm:mx-6" dir="rtl">
            <input
              type="search"
              className="h-10 min-w-0 flex-1 bg-transparent text-right text-sm outline-none placeholder:text-slate-400"
              placeholder="ابحث في المشاريع، البنود، الورش..."
            />
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </div>
        </header>

        <main className="min-h-0 flex-1 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
