interface EquipmentPageHeaderProps {
  isCreateOpen: boolean
  onToggleCreate: () => void
}

export function EquipmentPageHeader({ isCreateOpen, onToggleCreate }: EquipmentPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900">إدارة المعدات</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">إضافة وإدارة المعدات الثقيلة والآليات</p>
      </div>

      <button
        type="button"
        onClick={onToggleCreate}
        className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-lg bg-[#50683f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#435834]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        <span>{isCreateOpen ? 'إغلاق الإضافة' : 'معدة جديدة'}</span>
      </button>
    </div>
  )
}
