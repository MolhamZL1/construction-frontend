interface UsersHeaderProps {
  onAddUser: () => void
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-right">
        <h1 className="text-3xl font-bold leading-tight text-[var(--color-brand-ink)] sm:text-[34px]">إدارة المستخدمين</h1>
        <p className="mt-1 text-sm font-medium text-[var(--color-brand-stone)]">إضافة وإدارة مستخدمي النظام</p>
      </div>

      <button
        type="button"
        onClick={onAddUser}
        className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] focus:outline-none focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.2)]"
        dir="ltr"
      >
        مستخدم جديد
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  )
}
