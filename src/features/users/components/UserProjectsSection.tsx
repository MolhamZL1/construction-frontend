import { LoadingState } from '@/components/ui'
import type { UserProject } from '../types/user.types'

type UserProjectWithMeta = UserProject & {
  location?: string | null
  city?: string | null
}

interface UserProjectsSectionProps {
  projects: UserProject[]
  isLoading: boolean
  errorMessage?: string
}

export function UserProjectsSection({
  projects,
  isLoading,
  errorMessage,
}: UserProjectsSectionProps) {
  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">المشاريع المشارك فيها</h2>
          <p className="mt-1 text-sm font-medium text-[#637381]">
            قائمة المشاريع المرتبطة بهذا المستخدم
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0EC] text-[#4A5C3F]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16v13H4zM8 7V5h8v2M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 sm:p-6">
          <LoadingState
            label="جاري تحميل مشاريع المستخدم..."
            compact
            className="border-dashed shadow-none"
          />
        </div>
      ) : null}

      {errorMessage ? (
        <p className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:m-6">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && projects.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm font-medium text-[#637381] sm:px-7">
          لا توجد مشاريع مرتبطة بهذا المستخدم
        </p>
      ) : null}

      {!isLoading && !errorMessage && projects.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {projects.map((project, index) => (
            <ProjectRow
              key={`${project.id ?? 'project'}-${index}`}
              project={project as UserProjectWithMeta}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ProjectRow({ project }: { project: UserProjectWithMeta }) {
  const location = project.location ?? project.city

  return (
    <article className="flex flex-col gap-4 px-5 py-5 transition hover:bg-[#F9FAFB] sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0 text-right">
        <h3 className="truncate text-base font-bold text-[#111827] sm:text-lg">
          {project.name ?? '—'}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-[#637381]">
          {project.id ? <span>رقم المشروع: {project.id.toLocaleString('ar-SY')}</span> : null}
          {location ? <span>•</span> : null}
          {location ? <span>{location}</span> : null}
        </div>
      </div>

      <ProjectStatusBadge status={project.status} />
    </article>
  )
}

function ProjectStatusBadge({ status }: { status?: string | null }) {
  const label = getProjectStatusLabel(status)

  return (
    <span className="inline-flex w-fit rounded-full bg-[#00B8D9]/10 px-3 py-1 text-xs font-semibold text-[#00B8D9]">
      {label}
    </span>
  )
}

function getProjectStatusLabel(status?: string | null) {
  if (!status) {
    return '—'
  }

  if (status === 'completed' || status === 'done' || status === 'finished' || status === 'مكتمل') {
    return 'مكتمل'
  }

  if (status === 'planned' || status === 'مخطط') {
    return 'مخطط'
  }

  if (
    status === 'active' ||
    status === 'in_progress' ||
    status === 'started' ||
    status === 'ongoing' ||
    status === 'قيد التنفيذ' ||
    status === 'جاري التنفيذ'
  ) {
    return 'جاري التنفيذ'
  }

  return status
}