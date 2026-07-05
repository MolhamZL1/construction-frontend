import { Link, useLocation, useNavigate } from 'react-router-dom'

type ServerUnavailableState = {
  from?: string
} | null

function ServerIcon() {
  return (
    <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v1A2.5 2.5 0 0 1 17.5 11h-11A2.5 2.5 0 0 1 4 8.5v-1Z" />
      <path d="M4 15.5A2.5 2.5 0 0 1 6.5 13h11a2.5 2.5 0 0 1 2.5 2.5v1a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-1Z" />
      <path d="M8 8h.01M8 16h.01M12 8h4M12 16h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getRetryPath(from?: string) {
  if (!from) return '/'
  if (from === '/server-error' || from.startsWith('/server-error?')) return '/'
  return from
}

export function ServerUnavailablePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ServerUnavailableState
  const retryPath = getRetryPath(state?.from)

  function handleRetry() {
    navigate(retryPath, { replace: true })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#eef4eb] px-5 py-8 text-right" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <ServerIcon />
                </span>
                <div>
                  <p className="text-xs font-black text-amber-600">مشكلة اتصال بالسيرفر</p>
                  <h1 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">السيرفر غير متاح حالياً</h1>
                </div>
              </div>

              <span className="rounded-full bg-rose-50 px-4 py-2 text-xs font-black text-rose-600 ring-1 ring-rose-100">
                تعذر الاتصال
              </span>
            </div>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-8">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
              <p className="text-sm font-bold leading-7 text-slate-600">
                لم نتمكن من الوصول إلى الـ API. تأكد أن السيرفر شغّال وأن رابط البيئة مضبوط، ثم أعد المحاولة.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black text-slate-400">1</p>
                  <p className="mt-1 text-sm font-black text-slate-800">شغّل backend</p>
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black text-slate-400">2</p>
                  <p className="mt-1 text-sm font-black text-slate-800">تأكد من VITE_API_BASE_URL</p>
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                  <p className="text-xs font-black text-slate-400">3</p>
                  <p className="mt-1 text-sm font-black text-slate-800">جرّب إعادة المحاولة</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#405633]"
              >
                إعادة المحاولة
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                تحديث الصفحة
              </button>

              <Link
                to="/login"
                replace
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                الذهاب لتسجيل الدخول
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
