import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { WorkItem, WorkItemQualityLevel } from '../models/work-item.model'
import {
  canStartWorkItem,
  getStartBlockReason,
  isWorkItemOverdue,
  normalizeStatus,
  reorderableWorkItems,
  workItemQualityLabels,
  workItemStatusClasses,
} from '../utils/work-items-formatters'
import { ConfirmDialog } from './ConfirmDialog'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemsTableProps {
  projectId: string
  projectStatus?: string
  items: WorkItem[]
  isLoading?: boolean
  isMutating?: boolean
  onInlineUpdate: (item: WorkItem, payload: { duration_days?: number | null; quality_level?: WorkItemQualityLevel }) => void
  onReorder: (items: Array<{ id: string; sort_order: number }>) => void
  onStart: (item: WorkItem) => void
  onComplete: (item: WorkItem, delayReason?: string) => void
  onDeactivate: (item: WorkItem) => void
  onDelete: (item: WorkItem) => void
  onAddExpense: (item: WorkItem) => void
}

export function WorkItemsTable({
  projectId,
  projectStatus,
  items,
  isLoading = false,
  isMutating = false,
  onInlineUpdate,
  onReorder,
  onStart,
  onComplete,
  onDeactivate,
  onDelete,
  onAddExpense,
}: WorkItemsTableProps) {
  const [completeItem, setCompleteItem] = useState<WorkItem | null>(null)
  const [delayReason, setDelayReason] = useState('')
  const activeItems = items.filter((item) => item.isActive)
  const orderableItems = useMemo(() => reorderableWorkItems(activeItems), [activeItems])
  const canEditProjectWorkItems = projectStatus === 'planned'
  const projectCanRunWork = projectStatus === 'ongoing'

  if (isLoading) {
    return <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">جاري تحميل بنود العمل...</div>
  }

  if (activeItems.length === 0) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500">لا يوجد بنود مفعلة حالياً.</div>
  }

  function handleReorderChange(item: WorkItem, sortOrder: number) {
    const nextItems = orderableItems.map((candidate) => ({
      id: candidate.id,
      sort_order: candidate.id === item.id ? sortOrder : candidate.sortOrder,
    }))
    onReorder(nextItems)
  }

  function confirmComplete() {
    if (!completeItem) return
    onComplete(completeItem, delayReason)
    setCompleteItem(null)
    setDelayReason('')
  }

  return (
    <>
      <div className="overflow-visible border-0 bg-transparent shadow-none lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.07)]">
        <div className="hidden grid-cols-[minmax(240px,2fr)_110px_130px_150px_130px_260px] border-b border-slate-100 bg-slate-50/70 px-5 py-4 text-sm font-black text-slate-700 lg:grid">
          <span>البند</span>
          <span className="text-center">الترتيب</span>
          <span className="text-center">المدة</span>
          <span className="text-center">الجودة</span>
          <span className="text-center">الحالة</span>
          <span className="text-center">الإجراءات</span>
        </div>

        <div className="lg:divide-y lg:divide-slate-100">
          {activeItems.map((item) => (
            <WorkItemRow
              key={item.id}
              projectId={projectId}
              projectCanRunWork={projectCanRunWork}
              canEditProjectWorkItems={canEditProjectWorkItems}
              item={item}
              allItems={activeItems}
              disabled={isMutating}
              onInlineUpdate={onInlineUpdate}
              onReorderChange={handleReorderChange}
              onStart={onStart}
              onRequestComplete={setCompleteItem}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
              onAddExpense={onAddExpense}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(completeItem)}
        title="إنهاء بند العمل"
        description={
          completeItem && isWorkItemOverdue(completeItem)
            ? 'هذا البند متأخر عن مدته المتوقعة. يجب إدخال سبب التأخير قبل الإنهاء، وسيظهر السبب ضمن تفاصيل البند مع طقس يوم الإنهاء عند توفر بياناته من API.'
            : 'سيتم نقل البند إلى حالة مكتمل. إذا كان لهذا البند حجز معدات فعال، راجع صفحة معدات البند لإنهاء الحجز عند الحاجة.'
        }
        confirmLabel="إنهاء البند"
        danger={false}
        isLoading={isMutating}
        onCancel={() => {
          setCompleteItem(null)
          setDelayReason('')
        }}
        onConfirm={confirmComplete}
      >
        {completeItem && isWorkItemOverdue(completeItem) ? (
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">سبب التأخير *</span>
            <textarea
              value={delayReason}
              onChange={(event) => setDelayReason(event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-[var(--color-brand-gold)] focus:bg-white"
              placeholder="مثال: تأخر توريد المواد أو ظروف الطقس..."
            />
          </label>
        ) : null}
      </ConfirmDialog>
    </>
  )
}

interface WorkItemRowProps {
  projectId: string
  projectCanRunWork: boolean
  canEditProjectWorkItems: boolean
  item: WorkItem
  allItems: WorkItem[]
  disabled: boolean
  onInlineUpdate: (item: WorkItem, payload: { duration_days?: number | null; quality_level?: WorkItemQualityLevel }) => void
  onReorderChange: (item: WorkItem, sortOrder: number) => void
  onStart: (item: WorkItem) => void
  onRequestComplete: (item: WorkItem) => void
  onDeactivate: (item: WorkItem) => void
  onDelete: (item: WorkItem) => void
  onAddExpense: (item: WorkItem) => void
}

function WorkItemRow({
  projectId,
  projectCanRunWork,
  canEditProjectWorkItems,
  item,
  allItems,
  disabled,
  onInlineUpdate,
  onReorderChange,
  onStart,
  onRequestComplete,
  onDeactivate,
  onDelete,
  onAddExpense,
}: WorkItemRowProps) {
  const [durationDays, setDurationDays] = useState(item.durationDays?.toString() ?? '')
  const [qualityLevel, setQualityLevel] = useState<WorkItemQualityLevel>(item.qualityLevel)
  const [sortOrder, setSortOrder] = useState(String(item.sortOrder))
  const isStarted = item.status !== 'planned'
  const canEditInline = canEditProjectWorkItems && item.status === 'planned'
  const canReorder = canEditProjectWorkItems && item.status !== 'completed' && item.isActive
  const canStart = projectCanRunWork && canStartWorkItem(item, allItems)
  const startReason = projectCanRunWork ? getStartBlockReason(item, allItems) : 'لا يمكن بدء بند قبل بدء المشروع أو بعد اكتماله.'
  const hasInlineChanges = durationDays !== (item.durationDays?.toString() ?? '') || qualityLevel !== item.qualityLevel
  const hasOrderChanges = Number(sortOrder) !== item.sortOrder
  const isOverdue = isWorkItemOverdue(item)
  const canOpenProgress = projectCanRunWork && item.status === 'ongoing'
  const canDeactivate = !isStarted && canEditProjectWorkItems
  const canDelete = item.isCustom && item.status === 'planned' && canEditProjectWorkItems

  function saveInlineChanges() {
    if (!canEditInline) return
    onInlineUpdate(item, {
      duration_days: durationDays.trim() ? Number(durationDays) : null,
      quality_level: qualityLevel,
    })
  }

  function saveOrder() {
    if (!canReorder) return
    const nextOrder = Number(sortOrder)
    if (!Number.isFinite(nextOrder) || nextOrder < 1) return
    onReorderChange(item, nextOrder)
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-5 lg:py-5 lg:shadow-none lg:grid-cols-[minmax(240px,2fr)_110px_130px_150px_130px_260px] lg:items-center lg:gap-4">
      <div className="min-w-0 pb-1 lg:pb-0">
        <div className="flex items-start gap-3">
          <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${item.status === 'completed' ? 'border-emerald-500 bg-emerald-50' : item.status === 'ongoing' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-400'}`} />
          <div className="min-w-0 flex-1">
            <Link to={`/projects/${projectId}/work-items/${item.id}`} className="block break-words text-base font-black leading-6 text-slate-900 transition hover:text-[var(--color-brand-ink)] lg:truncate">
              {item.name}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              <span>إنجاز: {item.progressPercent}%</span>
              {item.isCustom ? <span className="rounded-full bg-violet-50 px-2 py-1 text-violet-600">مخصص</span> : null}
              {isOverdue ? <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">متأخر</span> : null}
            </div>
          </div>
        </div>
      </div>

      <MobileField label="الترتيب">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:justify-center">
          <input
            type="number"
            min="1"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            disabled={!canReorder || disabled}
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-bold outline-none focus:border-[var(--color-brand-gold)] disabled:bg-slate-50 disabled:text-slate-400 lg:w-20 lg:flex-none"
          />
          {hasOrderChanges && canReorder && !disabled ? (
            <button type="button" onClick={saveOrder} title="حفظ الترتيب" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-brand-ink)] transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.1)]">
              <WorkItemIcon name="save" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </MobileField>

      <MobileField label="المدة">
        <input
          type="number"
          min="1"
          value={durationDays}
          onChange={(event) => setDurationDays(event.target.value)}
          disabled={!canEditInline || disabled}
          className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-bold outline-none focus:border-[var(--color-brand-gold)] disabled:bg-slate-50 disabled:text-slate-400 lg:w-24 lg:flex-none"
        />
      </MobileField>

      <MobileField label="الجودة">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:justify-center">
          <select
            value={qualityLevel}
            onChange={(event) => setQualityLevel(event.target.value as WorkItemQualityLevel)}
            disabled={!canEditInline || disabled}
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[var(--color-brand-gold)] disabled:bg-slate-50 disabled:text-slate-400 lg:flex-none"
          >
            <option value="basic">{workItemQualityLabels.basic}</option>
            <option value="good">{workItemQualityLabels.good}</option>
            <option value="excellent">{workItemQualityLabels.excellent}</option>
          </select>
          {hasInlineChanges && canEditInline && !disabled ? (
            <button type="button" onClick={saveInlineChanges} title="حفظ المدة والجودة" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-brand-ink)] transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.1)]">
              <WorkItemIcon name="save" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </MobileField>

      <MobileField label="الحالة">
        <div className="flex min-w-0 flex-1 lg:justify-center">
          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ${workItemStatusClasses[item.status] ?? 'bg-slate-100 text-slate-500'}`}>
            {normalizeStatus(item.status)}
          </span>
        </div>
      </MobileField>

      <div className="border-t border-slate-100 pt-3 lg:border-0 lg:pt-0">
        <span className="mb-2 block text-xs font-black text-slate-500 lg:hidden">الإجراءات</span>
        <div className="flex flex-wrap items-center gap-2 lg:justify-center">
          <ActionLink to={`/projects/${projectId}/work-items/${item.id}`} icon="info" label="تفاصيل البند" />
          <ActionButton icon="add" label="إضافة تكلفة أو أجرة ورشة" onClick={() => onAddExpense(item)} disabled={disabled} tone="green" />
          <ActionLink to={`/projects/${projectId}/work-items/${item.id}/progress`} icon="reload" label="تحديث الإنجاز" disabled={!canOpenProgress} tone="progress" />
          {item.status === 'ongoing' ? <ActionLink to={`/projects/${projectId}/work-items/${item.id}/equipment`} icon="equipment" label="معدات البند" /> : null}
          {item.status === 'planned' ? <ActionButton icon="play" label="بدء البند" onClick={() => onStart(item)} disabled={!canStart || disabled} disabledReason={startReason} tone="cyan" /> : null}
          {item.status === 'ongoing' ? <ActionButton icon="check" label="إنهاء البند" onClick={() => onRequestComplete(item)} disabled={disabled} tone="green" /> : null}
          {!isStarted ? <ActionButton icon="pause" label="إلغاء التفعيل" onClick={() => onDeactivate(item)} disabled={!canDeactivate || disabled} tone="amber" /> : null}
          {item.isCustom && item.status === 'planned' ? <ActionButton icon="delete" label="حذف البند" onClick={() => onDelete(item)} disabled={!canDelete || disabled} tone="rose" /> : null}
        </div>
      </div>
    </div>
  )
}

function MobileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 border-t border-slate-100 pt-3 lg:flex lg:border-0 lg:pt-0 lg:justify-center">
      <span className="text-xs font-black text-slate-500 lg:hidden">{label}</span>
      {children}
    </div>
  )
}

type IconName = Parameters<typeof WorkItemIcon>[0]['name']

function ActionLink({ to, icon, label, disabled = false, tone = 'default' }: { to: string; icon: IconName; label: string; disabled?: boolean; tone?: 'default' | 'progress' }) {
  if (disabled) return null

  const className = tone === 'progress'
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 sm:h-9 sm:w-9 bg-cyan-50 text-cyan-700 transition hover:border-cyan-200 hover:bg-cyan-100'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 sm:h-9 sm:w-9 text-slate-600 transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] hover:text-[var(--color-brand-ink)]'

  return (
    <Link to={to} title={label} aria-label={label} className={className}>
      <WorkItemIcon name={icon} className="h-4 w-4" />
    </Link>
  )
}

function ActionButton({ icon, label, onClick, disabled = false, tone = 'slate' }: { icon: IconName; label: string; onClick: () => void; disabled?: boolean; disabledReason?: string; tone?: 'slate' | 'cyan' | 'green' | 'amber' | 'rose' }) {
  if (disabled) return null

  const toneClasses = {
    slate: 'text-slate-600 hover:bg-slate-50',
    cyan: 'text-cyan-600 hover:bg-cyan-50',
    green: 'text-emerald-600 hover:bg-emerald-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    rose: 'text-rose-500 hover:bg-rose-50',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-9 sm:w-9 ${toneClasses[tone]}`}
    >
      <WorkItemIcon name={icon} className="h-4 w-4" />
    </button>
  )
}
