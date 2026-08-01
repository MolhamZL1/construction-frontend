export type ProjectLifecycleAction = 'start' | 'complete'

interface ProjectLifecycleConfirmDialogProps {
  action: ProjectLifecycleAction | null
  projectName: string
  isSubmitting?: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}

const actionContent: Record<
  ProjectLifecycleAction,
  {
    title: string
    description: string
    warning: string
    confirmLabel: string
    confirmClassName: string
  }
> = {
  start: {
    title: 'تأكيد بدء المشروع',
    description: 'سيتم تغيير حالة المشروع إلى قيد التنفيذ وبدء تتبع العمل عليه.',
    warning: 'بعد بدء المشروع لن تتمكن من تعديل تفاصيله الأساسية مثل الاسم، الموقع، المساحة والارتفاع.',
    confirmLabel: 'نعم، ابدأ المشروع',
    confirmClassName: 'bg-[var(--color-brand-ink)] text-white hover:bg-[var(--color-brand-ink)]',
  },
  complete: {
    title: 'تأكيد إنهاء المشروع',
    description: 'سيتم تغيير حالة المشروع إلى مكتمل وتسجيل تاريخ الإنهاء.',
    warning: 'بعد إنهاء المشروع لن تتمكن من الرجوع لتعديله أو متابعة تغييرات التنفيذ عليه من هذه الصفحة.',
    confirmLabel: 'نعم، أنهِ المشروع',
    confirmClassName: 'bg-slate-900 text-white hover:bg-slate-800',
  },
}

export function ProjectLifecycleConfirmDialog({
  action,
  projectName,
  isSubmitting = false,
  errorMessage,
  onCancel,
  onConfirm,
}: ProjectLifecycleConfirmDialogProps) {
  if (!action) {
    return null
  }

  const content = actionContent[action]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-right shadow-[0_24px_80px_rgb(var(--color-brand-ink-rgb)/0.25)]" dir="rtl">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <WarningIcon />
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-black text-slate-900">{content.title}</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                المشروع: <span className="font-extrabold text-slate-800">{projectName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold leading-7 text-slate-600">{content.description}</p>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-7 text-amber-800">
            {content.warning}
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-6 text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-extrabold shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-400 ${content.confirmClassName}`}
          >
            {isSubmitting ? 'جاري التنفيذ...' : content.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function WarningIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 3 2.8 19a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v5M12 17.5v.1" strokeLinecap="round" />
    </svg>
  )
}
