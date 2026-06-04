export function UsersEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#637381]">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 21a8 8 0 0 0-16 0" strokeLinecap="round" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </div>
      <p className="mt-3 text-sm font-bold text-[#1A2027]">لا يوجد مستخدمون</p>
      <p className="mt-1 text-xs font-medium text-[#637381]">غيّر التصفية أو أضف مستخدمًا جديدًا</p>
    </div>
  )
}
