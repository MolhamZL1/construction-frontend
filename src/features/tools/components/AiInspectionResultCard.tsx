import type { AiInspectionResult } from '../api/ai-inspection.api'

interface AiInspectionResultCardProps {
  result: AiInspectionResult
  className?: string
}

const statusLabels: Record<string, string> = {
  accepted: 'جودة مقبولة',
  approved: 'جودة مقبولة',
  passed: 'جودة مقبولة',
  pass: 'جودة مقبولة',
  rejected: 'بحاجة إلى معالجة',
  failed: 'بحاجة إلى معالجة',
  fail: 'بحاجة إلى معالجة',
  warning: 'بحاجة إلى مراجعة',
  pending: 'بحاجة إلى مراجعة',
}

function clampPercent(value?: number) {
  const parsed = Number(value ?? 0)
  if (!Number.isFinite(parsed)) return 0
  return Math.min(100, Math.max(0, parsed))
}

function formatPercent(value?: number) {
  return `${new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(clampPercent(value))}%`
}

function getStatusLabel(status?: string) {
  if (!status) return 'اكتمل الفحص'
  return statusLabels[status.toLowerCase()] ?? status
}

function getStatusClasses(status?: string) {
  const normalized = status?.toLowerCase() ?? ''

  if (['accepted', 'approved', 'passed', 'pass'].includes(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (['rejected', 'failed', 'fail'].includes(normalized)) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}

export function AiInspectionResultCard({ result, className = '' }: AiInspectionResultCardProps) {
  const report = result.report

  if (!report) {
    if (!result.message) return null

    return (
      <div className={`rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-600 shadow-sm ${className}`}>
        {result.message}
      </div>
    )
  }

  return (
    <article className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_35px_rgb(var(--color-brand-ink-rgb)/0.08)] ${className}`}>
      <div className="border-b border-slate-100 bg-gradient-to-l from-[rgb(var(--color-brand-gold-rgb)/0.12)] via-white to-white px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-[var(--color-brand-gold)]">نتيجة فحص الجودة</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">{getStatusLabel(report.status)}</h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(report.status)}`}>
            {getStatusLabel(report.status)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {report.score !== undefined || report.confidence !== undefined ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {report.score !== undefined ? <Metric label="جودة التنفيذ" value={report.score} /> : null}
            {report.confidence !== undefined ? <Metric label="درجة الثقة" value={report.confidence} /> : null}
          </div>
        ) : null}

        {report.summary ? (
          <section className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-black text-slate-400">الملخص</p>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{report.summary}</p>
          </section>
        ) : null}

        <ResultList title="العيوب المؤكدة" items={report.confirmed_defects} tone="danger" />
        <ResultList title="الملاحظات المرئية" items={report.visual_observations} />
        <ResultList title="نقاط لم يتم التحقق منها" items={report.unverified_items} tone="warning" />
        <ResultList title="التوصيات" items={report.recommendations} tone="success" />
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  const percent = clampPercent(value)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-slate-500">{label}</span>
        <span className="text-base font-black text-slate-950" dir="ltr">{formatPercent(value)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" dir="ltr">
        <div className="h-full rounded-full bg-[var(--color-brand-gold)] transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function ResultList({
  title,
  items = [],
  tone = 'default',
}: {
  title: string
  items?: string[]
  tone?: 'default' | 'danger' | 'warning' | 'success'
}) {
  const visibleItems = items.map((item) => String(item ?? '').trim()).filter(Boolean)
  if (visibleItems.length === 0) return null

  const dotClass = tone === 'danger'
    ? 'bg-rose-500'
    : tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'success'
        ? 'bg-emerald-500'
        : 'bg-slate-400'

  return (
    <section>
      <h4 className="text-xs font-black text-slate-600">{title}</h4>
      <ul className="mt-2 space-y-2">
        {visibleItems.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-xs font-bold leading-6 text-slate-700">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
