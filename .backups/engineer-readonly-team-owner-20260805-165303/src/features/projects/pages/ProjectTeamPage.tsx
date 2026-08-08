import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton, LoadingState, SearchInput } from '@/components/ui'
import {
  getProjectsErrorMessage,
  useProjectEngineers,
  useProjectSummary,
  useRemoveEngineer,
} from '../hooks/useProjects'
import type { ProjectEngineer, ProjectEngineerRole } from '../models/project.model'
import { projectTeamRoleLabels } from '../constants/project-team'

export function ProjectTeamPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const summaryQuery = useProjectSummary(projectId)
  const engineersQuery = useProjectEngineers(projectId)
  const removeMutation = useRemoveEngineer()

  const project = summaryQuery.data?.project
  const members = (engineersQuery.data ?? []).filter((member) => member.role !== 'project_owner')

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return members
    }

    return members.filter((member) => {
      const user = member.user
      const searchableText = [
        user?.name,
        user?.email,
        user?.internalId,
        member.userId,
        projectTeamRoleLabels[member.role],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [members, search])

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-7 text-center" dir="rtl">
        <div>
          <svg
            className="mx-auto mb-3 h-16 w-16 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v6M12 16.5v.1" strokeLinecap="round" />
          </svg>

          <p className="text-lg font-bold text-slate-800">المشروع غير موجود</p>

          <Link to="/projects" className="mt-3 inline-flex text-sm font-semibold text-[var(--color-brand-ink)] hover:underline">
            العودة للمشاريع
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}`} label="العودة لتفاصيل المشروع" />
        </div>

        <TeamBreadcrumb projectId={projectId} projectName={project.name} current="فريق العمل" />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                فريق العمل
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                إدارة أعضاء فريق العمل المعينين لمشروع:{' '}
                <span className="font-semibold text-slate-800">{project.name}</span>
              </p>
            </div>

            <Link
              to={`/projects/${projectId}/team/create`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              إضافة عضو
            </Link>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="البحث بالاسم، البريد، أو المعرف..."
            className="mt-5 h-12 bg-white lg:max-w-2xl"
          />
        </div>

        {summaryQuery.error ? <InlineError message={getProjectsErrorMessage(summaryQuery.error)} /> : null}
        {engineersQuery.error ? <InlineError message={getProjectsErrorMessage(engineersQuery.error)} /> : null}
        {removeMutation.error ? <InlineError message={getProjectsErrorMessage(removeMutation.error)} /> : null}

        <TeamMembersTable
          members={filteredMembers}
          isLoading={engineersQuery.isLoading}
          hasMembers={members.length > 0}
          isFiltered={Boolean(search.trim())}
          isRemoving={removeMutation.isPending}
          onOpenUser={(userId) => navigate(`/users/${userId}`)}
          onRemove={(memberId) => removeMutation.mutate({ projectId, engineerId: memberId })}
        />
      </div>
    </section>
  )
}

interface TeamMembersTableProps {
  members: ProjectEngineer[]
  isLoading: boolean
  hasMembers: boolean
  isFiltered: boolean
  isRemoving: boolean
  onOpenUser: (userId: string) => void
  onRemove: (memberId: string) => void
}

function TeamMembersTable({
  members,
  isLoading,
  hasMembers,
  isFiltered,
  isRemoving,
  onOpenUser,
  onRemove,
}: TeamMembersTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgb(var(--color-brand-ink-rgb)/0.08)]">
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(160px,1fr)_minmax(160px,1fr)_120px] border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-bold text-slate-700 md:grid">
        <span>عضو الفريق</span>
        <span className="text-center">الدور</span>
        <span className="text-center">تاريخ التعيين</span>
        <span className="text-center">الإجراءات</span>
      </div>

      {isLoading ? (
        <div className="p-6">
          <LoadingState label="جاري تحميل فريق العمل..." compact className="border-dashed shadow-none" />
        </div>
      ) : null}

      {!isLoading && members.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <svg
            className="mx-auto mb-3 h-14 w-14 text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3.5 20a5.5 5.5 0 0 1 11 0M17 9a3 3 0 1 0 0-6M16 14a4.5 4.5 0 0 1 4.5 4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="text-sm font-semibold text-slate-700">
            {isFiltered && hasMembers ? 'لا يوجد أعضاء مطابقون للبحث.' : 'لا يوجد أعضاء مضافون لفريق العمل بعد.'}
          </p>
        </div>
      ) : null}

      {!isLoading && members.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <TeamMemberRow key={member.id} member={member} isRemoving={isRemoving} onOpenUser={onOpenUser} onRemove={onRemove} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function TeamMemberRow({
  member,
  isRemoving,
  onOpenUser,
  onRemove,
}: {
  member: ProjectEngineer
  isRemoving: boolean
  onOpenUser: (userId: string) => void
  onRemove: (memberId: string) => void
}) {
  const statusLabel = getMemberStatusLabel(member.user?.status)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenUser(member.userId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenUser(member.userId)
        }
      }}
      className="grid cursor-pointer gap-4 px-6 py-5 transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-ink-rgb)/0.3)] md:grid-cols-[minmax(0,2fr)_minmax(160px,1fr)_minmax(160px,1fr)_120px] md:items-center"
      aria-label={`فتح معلومات ${member.user?.name ?? `مستخدم #${member.userId}`}`}
      title="فتح معلومات المستخدم"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <div className="min-w-0">
          <p className="truncate text-base font-bold text-slate-900">
            {member.user?.name ?? `مستخدم #${member.userId}`}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500" dir="ltr">
            {member.user?.email ?? member.user?.internalId ?? `#${member.userId}`}
          </p>

          {statusLabel ? (
            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
              {statusLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="md:text-center">
        <RoleBadge role={member.role} />
      </div>

      <div className="text-sm font-medium text-slate-600 md:text-center">
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {formatTeamDate(member.assignedAt)}
        </span>
      </div>

      <div className="md:text-center">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove(member.id)
          }}
          disabled={isRemoving}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="إزالة العضو من فريق العمل"
          title="إزالة"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function TeamBreadcrumb({
  projectId,
  projectName,
  current,
}: {
  projectId: string
  projectName: string
  current: string
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500" aria-label="مسار الصفحة">
      <Link to="/projects" className="transition hover:text-[var(--color-brand-ink)]">
        المشاريع
      </Link>

      <ChevronIcon />

      <Link to={`/projects/${projectId}`} className="transition hover:text-[var(--color-brand-ink)]">
        {projectName}
      </Link>

      <ChevronIcon />

      <span className="text-slate-800">{current}</span>
    </nav>
  )
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RoleBadge({ role }: { role: ProjectEngineerRole }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.1)] px-3 py-1.5 text-xs font-bold text-[var(--color-brand-ink)]">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6l7-3Z" />
        <path d="M9.5 12l1.7 1.7 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {projectTeamRoleLabels[role] ?? role}
    </span>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      {message}
    </div>
  )
}

function formatTeamDate(dateStr?: string) {
  if (!dateStr) return 'غير محدد'

  return new Date(dateStr).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getMemberStatusLabel(status?: string | null) {
  if (!status) return null

  const normalizedStatus = status.trim().toLowerCase()

  if (normalizedStatus === 'active') return 'نشط'
  if (normalizedStatus === 'inactive') return 'غير نشط'
  if (normalizedStatus === 'pending') return 'معلّق'

  return status
}
