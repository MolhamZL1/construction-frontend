import { BudgetIcon } from './BudgetIcon'

interface BudgetDownloadActionsProps {
  sectionLabel: string
}

export function BudgetDownloadActions({ sectionLabel }: BudgetDownloadActionsProps) {
  const buttonClassName =
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 shadow-sm cursor-not-allowed'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled
        className={buttonClassName}
        title={`تحميل ${sectionLabel} بصيغة PDF غير متاح حالياً`}
        aria-label={`تحميل ${sectionLabel} بصيغة PDF غير متاح حالياً`}
      >
        <BudgetIcon name="pdf" className="h-[18px] w-[18px]" />
      </button>

      <button
        type="button"
        disabled
        className={buttonClassName}
        title={`تحميل ${sectionLabel} بصيغة Excel غير متاح حالياً`}
        aria-label={`تحميل ${sectionLabel} بصيغة Excel غير متاح حالياً`}
      >
        <BudgetIcon name="excel" className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
