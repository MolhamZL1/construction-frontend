import { useAuthStore } from '@/stores/authStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name?.split(' ')[0] ?? 'حسام'

  return (
    <section className="min-h-[calc(100vh-4rem)] px-6 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">مرحبا، {firstName}</h1>
        <p className="mt-2 text-base leading-7 text-slate-500">هنا ملخص شامل لأداء المشاريع والأنشطة الحالية</p>
      </div>
    </section>
  )
}
