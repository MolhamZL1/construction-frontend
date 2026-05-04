import authImage from '@/assets/auth.jpg'

export function AuthHeroPanel() {
  return (
    <section className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:min-h-screen">
      <img src={authImage} alt="واجهة نظام إدارة المشاريع" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[rgba(55,66,43,0.46)]" />

      <div className="relative flex min-h-[260px] items-center px-6 py-10 sm:min-h-[340px] sm:px-12 lg:min-h-screen lg:px-16 xl:px-28" dir="ltr">
        <div className="flex items-end gap-4 text-white sm:gap-6">
          <div className="space-y-2 text-right sm:space-y-3" dir="rtl">
            <h1 className="text-3xl leading-tight font-bold tracking-normal sm:text-4xl xl:text-5xl">نظام إدارة المشاريع</h1>
            <p className="text-xl leading-tight font-light tracking-normal text-white/90 sm:text-2xl xl:text-3xl">
              Construction Management System
            </p>
          </div>

          <div className="mb-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white/15 backdrop-blur-sm sm:h-16 sm:w-16 sm:rounded-[1.5rem] xl:h-20 xl:w-20 xl:rounded-[1.75rem]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white sm:h-8 sm:w-8 xl:h-10 xl:w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="6" y="3" width="12" height="18" rx="2.5" />
              <path d="M9 7h6M9 11h6M9 15h4M4 7h2M4 11h2M4 15h2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
