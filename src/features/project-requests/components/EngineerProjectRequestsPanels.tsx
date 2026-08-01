import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { describeProgressRequestPayload } from '@/features/work-items/models/work-item-progress-request.model'

import type {
  ProjectDurationExtensionRequest,
  ProjectProgressRequest,
  ProjectRequestsOverview,
} from '../models/project-requests.model'

interface EngineerProjectRequestsPanelsProps {
  data?: ProjectRequestsOverview
  isLoading: boolean
  isError: boolean
}

const dateFormatter = new Intl.DateTimeFormat('ar-SY', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

function formatDate(value?: string | null) {
  if (!value) return 'الآن'

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'الآن' : dateFormatter.format(date)
}

function initials(name?: string | null) {
  return (name ?? 'مستخدم')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export function EngineerProjectRequestsPanels({ data, isLoading, isError }: EngineerProjectRequestsPanelsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <RequestsSkeleton />
        <RequestsSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
        تعذر تحميل الطلبات المعلقة حالياً. قائمة المشاريع ما زالت متاحة.
      </div>
    )
  }

  return (
    <section aria-label="الطلبات المعلقة" className="space-y-3">
     

      <div className="grid gap-4 xl:grid-cols-2">
        <ProgressRequestsPanel requests={data?.progressRequests ?? []} />
        <DurationRequestsPanel requests={data?.durationExtensions ?? []} />
      </div>
    </section>
  )
}

function PanelShell({
  title,
  subtitle,
  count,
  icon,
  children,
}: {
  title: string
  subtitle: string
  count: number
  icon: 'progress' | 'clock'
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.045)]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-ink)]">
            <RequestIcon name={icon} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-slate-950">{title}</h3>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-black text-slate-700">
          {count}
        </span>
      </header>
      {children}
    </section>
  )
}

function ProgressRequestsPanel({ requests }: { requests: ProjectProgressRequest[] }) {
  return (
    <PanelShell
      title="طلبات تحديث الإنجاز"
      subtitle="طلبات المساعدين التي تنتظر قرارك"
      count={requests.length}
      icon="progress"
    >
      {requests.length === 0 ? (
        <EmptyRequests label="ما في طلبات تحديث إنجاز معلقة." />
      ) : (
        <div className="max-h-[290px] divide-y divide-slate-100 overflow-y-auto">
          {requests.slice(0, 8).map((request) => (
            <Link
              key={request.id}
              to={`/projects/${request.projectId}/work-items/${request.workItemId}`}
              className="group flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-600">
                {initials(request.requester?.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <strong className="text-sm font-black text-slate-900">{request.workItemName}</strong>
                  <span className="text-xs font-bold text-[var(--color-brand-gold-deep)]">{request.projectName}</span>
                </span>
                <span className="mt-1 block line-clamp-1 text-xs font-semibold leading-6 text-slate-500">
                  {describeProgressRequestPayload(request)}
                </span>
                <span className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <RequestIcon name="calendar" className="h-3.5 w-3.5" />
                  {formatDate(request.createdAt ?? request.updatedAt)}
                </span>
              </span>
              <RequestIcon name="arrow" className="mt-3 h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-[var(--color-brand-ink)]" />
            </Link>
          ))}
        </div>
      )}
    </PanelShell>
  )
}

function DurationRequestsPanel({ requests }: { requests: ProjectDurationExtensionRequest[] }) {
  return (
    <PanelShell
      title="طلبات تمديد الوقت"
      subtitle="تمديدات البنود التي تنتظر قرارك"
      count={requests.length}
      icon="clock"
    >
      {requests.length === 0 ? (
        <EmptyRequests label="ما في طلبات تمديد وقت معلقة." />
      ) : (
        <div className="max-h-[290px] divide-y divide-slate-100 overflow-y-auto">
          {requests.slice(0, 8).map((request) => (
            <Link
              key={request.id}
              to={`/projects/${request.projectId}/work-items/${request.workItemId}/duration-extensions`}
              className="group flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50"
            >
              <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 px-2 text-xs font-black text-amber-700">
                +{request.requestedDays}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <strong className="text-sm font-black text-slate-900">
                    {request.workItem?.name ?? `بند #${request.workItemId}`}
                  </strong>
                  <span className="text-xs font-bold text-[var(--color-brand-gold-deep)]">{request.projectName}</span>
                </span>
                <span className="mt-1 block line-clamp-1 text-xs font-semibold leading-6 text-slate-500">
                  {request.reason || 'طلب تمديد مدة تنفيذ البند'}
                </span>
                <span className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <RequestIcon name="calendar" className="h-3.5 w-3.5" />
                  {formatDate(request.requestedAt ?? request.createdAt ?? request.updatedAt)}
                </span>
              </span>
              <RequestIcon name="arrow" className="mt-3 h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-[var(--color-brand-ink)]" />
            </Link>
          ))}
        </div>
      )}
    </PanelShell>
  )
}

function EmptyRequests({ label }: { label: string }) {
  return (
    <div className="flex min-h-[150px] flex-col items-center justify-center px-5 py-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <RequestIcon name="check" />
      </span>
      <p className="mt-3 text-sm font-black text-slate-800">{label}</p>
    </div>
  )
}

function RequestsSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="h-10 w-10 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-36 rounded bg-slate-200" />
          <div className="h-3 w-56 rounded bg-slate-100" />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="h-14 rounded-2xl bg-slate-100" />
        <div className="h-14 rounded-2xl bg-slate-100" />
      </div>
    </div>
  )
}

type RequestIconName = 'progress' | 'clock' | 'calendar' | 'arrow' | 'check'

function RequestIcon({ name, className = 'h-5 w-5' }: { name: RequestIconName; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }

  if (name === 'progress') {
    return <svg {...common}><path d="M4 19V9M10 19V5M16 19v-7M3 19h18" strokeLinecap="round" /><path d="m5 7 4-3 4 3 6-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'clock') {
    return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'calendar') {
    return <svg {...common}><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  if (name === 'check') {
    return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  }

  return <svg {...common}><path d="M8 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
