import { Link } from 'react-router-dom'
import { SearchInput } from '@/components/ui'
import { isProjectManager } from '@/features/auth/utils/auth-navigation'
import { useAuthStore } from '@/stores/authStore'
import type { WorkItem } from '../models/work-item.model'

interface WorkItemsPageHeaderProps {
  projectId: string
  projectStatus?: string
  search: string
  onSearchChange: (value: string) => void
  items: WorkItem[]
}

const projectStatusLabels: Record<string, string> = {
  planned: 'لم يبدأ',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
}

export function WorkItemsPageHeader({ projectId, projectStatus, search, onSearchChange, items }: WorkItemsPageHeaderProps) {
  const user = useAuthStore((state) => state.user)
  const canViewProgressRequests = isProjectManager(user)
  const activeItems = items.filter((item) => item.isActive)
  const total = activeItems.length
  const completed = activeItems.filter((item) => item.status === 'completed').length
  const ongoing = activeItems.filter((item) => item.status === 'ongoing').length
  const planned = activeItems.filter((item) => item.status === 'planned').length
  const projectProgress = total > 0 ? Math.round(activeItems.reduce((sum, item) => sum + item.progressPercent, 0) / total) : 0
  const canCreate = projectStatus === 'planned'

  return (
    <header className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link to="/projects" className="transition hover:text-[var(--color-brand-ink)]">المشاريع</Link>
            <span className="text-slate-300">←</span>
            <Link to={`/projects/${projectId}`} className="transition hover:text-[var(--color-brand-ink)]">تفاصيل المشروع</Link>
            <span className="text-slate-300">←</span>
            <span className="text-slate-800">بنود العمل</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">بنود العمل</h1>
            {projectStatus ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">حالة المشروع: {projectStatusLabels[projectStatus] ?? projectStatus}</span> : null}
          </div>
         
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canViewProgressRequests ? (
            <Link
              to={`/projects/${projectId}/work-items/pending-updates`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[rgb(var(--color-brand-gold-rgb)/0.22)] bg-[var(--color-brand-gold-surface)] px-4 text-sm font-extrabold text-[var(--color-brand-ink)] transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.45)] hover:bg-[var(--color-brand-paper-hover)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M5 5h14v14H5zM8 9h8M8 13h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              طلبات تحديث الإنجاز
            </Link>
          ) : null}
          <Link
            to={`/projects/${projectId}/work-items/inactive`}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] hover:text-[var(--color-brand-ink)]"
          >
            البنود غير المفعلة
          </Link>
          {canCreate ? (
            <Link
              to={`/projects/${projectId}/work-items/create`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span>
              إضافة بند عمل
            </Link>
          ) : (
            <span title="لا يمكن إضافة أو تعديل تفاصيل بند بعد بدء المشروع." className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-extrabold text-slate-400">
              إضافة بند عمل
            </span>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="إجمالي البنود" value={total} />
        <StatCard label="مخطط" value={planned} tone="amber" />
        <StatCard label="قيد التنفيذ" value={ongoing} tone="cyan" />
        <StatCard label="مكتمل" value={completed} tone="green" />
        <StatCard label="إنجاز المشروع" value={`${projectProgress}%`} tone="green" />
      </div>

      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
        placeholder="البحث في بنود العمل..."
        className="h-12 rounded-2xl bg-slate-50 lg:max-w-2xl"
      />
    </header>
  )
}

function StatCard({ label, value, tone = 'slate' }: { label: string; value: string | number; tone?: 'slate' | 'amber' | 'cyan' | 'green' }) {
  const classes = {
    slate: 'bg-slate-50 text-slate-900',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    green: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className={`rounded-2xl px-4 py-4 ${classes[tone]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-extrabold text-slate-500">{label}</p>
    </div>
  )
}
