import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackButton, LoadingState, SearchInput } from '@/components/ui'
import { getUsersByRole } from '@/features/users/api/users.api'
import { getUsersErrorMessage } from '@/features/users/hooks/useUsers'
import type { User } from '@/features/users/types/user.types'
import { projectTeamRoleLabels, projectTeamRoleOptions } from '../constants/project-team'
import { getProjectsErrorMessage, useAssignEngineer, useProjectEngineers, useProjectSummary } from '../hooks/useProjects'
import type { ProjectEngineerRole } from '../models/project.model'

type SelectableRole = '' | ProjectEngineerRole

export function AddProjectTeamMemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''
  const [selectedRole, setSelectedRole] = useState<SelectableRole>('')
  const [search, setSearch] = useState('')

  const summaryQuery = useProjectSummary(projectId)
  const engineersQuery = useProjectEngineers(projectId)
  const assignMutation = useAssignEngineer()

  const usersQuery = useQuery({
    queryKey: ['project-team', projectId, 'users-by-role', selectedRole],
    queryFn: async (): Promise<User[]> => {
      if (!selectedRole) {
        return []
      }

      const response = await getUsersByRole(selectedRole)
      return response.data ?? []
    },
    enabled: Boolean(selectedRole),
  })

  const project = summaryQuery.data?.project

  const assignedUserIds = useMemo(
    () => new Set((engineersQuery.data ?? []).map((member) => String(member.userId))),
    [engineersQuery.data]
  )

  const availableUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return (usersQuery.data ?? []).filter((user) => {
      if (user.id == null || assignedUserIds.has(String(user.id))) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const searchableText = [user.name, user.email, user.internal_id, user.id, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedSearch)
    })
  }, [assignedUserIds, search, usersQuery.data])

  async function handleAssign(user: User) {
    if (!selectedRole || user.id == null) {
      return
    }

    try {
      await assignMutation.mutateAsync({
        projectId,
        userId: String(user.id),
        role: selectedRole,
      })
      navigate(`/projects/${projectId}/team`)
    } catch {
      return
    }
  }

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
          <svg className="mx-auto mb-3 h-16 w-16 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v6M12 16.5v.1" strokeLinecap="round" />
          </svg>
          <p className="text-lg font-bold text-slate-800">المشروع غير موجود</p>
          <Link to="/projects" className="mt-3 inline-flex text-sm font-semibold text-[#50683f] hover:underline">
            العودة للمشاريع
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <TeamBreadcrumb projectId={projectId} projectName={project.name} />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">إضافة عضو لفريق العمل</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                اختر الدور أولاً، وبعدها سيتم عرض المستخدمين المتاحين لهذا الدور في مشروع: <span className="font-semibold text-slate-800">{project.name}</span>
              </p>
            </div>
            <BackButton to={`/projects/${projectId}/team`} label="العودة لفريق العمل" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">الدور</span>
              <select
                value={selectedRole}
                onChange={(event) => {
                  setSelectedRole(event.target.value as SelectableRole)
                  setSearch('')
                }}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
              >
                <option value="">اختر الدور أولاً</option>
                {projectTeamRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">بحث ضمن المستخدمين المتاحين</span>
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="البحث بالاسم، البريد، أو المعرف..."
                disabled={!selectedRole}
                className="h-12 bg-white"
              />
            </label>
          </div>
        </div>

        {summaryQuery.error ? <InlineError message={getProjectsErrorMessage(summaryQuery.error)} /> : null}
        {engineersQuery.error ? <InlineError message={getProjectsErrorMessage(engineersQuery.error)} /> : null}
        {usersQuery.error ? <InlineError message={getUsersErrorMessage(usersQuery.error)} /> : null}
        {assignMutation.error ? <InlineError message={getProjectsErrorMessage(assignMutation.error)} /> : null}

        <AvailableUsersCard
          selectedRole={selectedRole}
          users={availableUsers}
          totalUsersForRole={usersQuery.data?.length ?? 0}
          isLoading={usersQuery.isLoading || engineersQuery.isLoading}
          isAssigning={assignMutation.isPending}
          onAssign={handleAssign}
        />
      </div>
    </section>
  )
}

interface AvailableUsersCardProps {
  selectedRole: SelectableRole
  users: User[]
  totalUsersForRole: number
  isLoading: boolean
  isAssigning: boolean
  onAssign: (user: User) => void
}

function AvailableUsersCard({ selectedRole, users, totalUsersForRole, isLoading, isAssigning, onAssign }: AvailableUsersCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-extrabold text-slate-900">المستخدمون المتاحون</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {selectedRole ? `يتم عرض المستخدمين بدور: ${projectTeamRoleLabels[selectedRole]}` : 'حدد الدور لعرض المستخدمين المتاحين.'}
        </p>
      </div>

      {!selectedRole ? (
        <EmptyState
          title="اختر الدور أولاً"
          description="بعد اختيار الدور سيتم جلب المستخدمين المطابقين له من تابع عرض المستخدمين."
        />
      ) : null}

      {selectedRole && isLoading ? (
        <div className="p-6">
          <LoadingState label="جاري تحميل المستخدمين المتاحين..." compact className="border-dashed shadow-none" />
        </div>
      ) : null}

      {selectedRole && !isLoading && users.length === 0 ? (
        <EmptyState
          title="لا يوجد مستخدمون متاحون"
          description={totalUsersForRole > 0 ? 'كل المستخدمين بهذا الدور مضافون مسبقاً لفريق العمل أو لا يطابقون البحث.' : 'لا يوجد مستخدمون مسجلون بهذا الدور حالياً.'}
        />
      ) : null}

      {selectedRole && !isLoading && users.length > 0 ? (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserCard key={String(user.id)} user={user} isAssigning={isAssigning} onAssign={onAssign} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function UserCard({ user, isAssigning, onAssign }: { user: User; isAssigning: boolean; onAssign: (user: User) => void }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-[#50683f]/30 hover:bg-white hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#50683f]/10 text-[#50683f]">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">{user.name ?? `مستخدم #${user.id}`}</h3>
          <p className="mt-1 truncate text-xs text-slate-500" dir="ltr">
            {user.email ?? user.internal_id ?? `#${user.id}`}
          </p>
          {user.status ? <StatusBadge status={String(user.status)} /> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAssign(user)}
        disabled={isAssigning}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#50683f] px-4 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400 active:scale-[0.98]"
      >
        {isAssigning ? 'جاري الإضافة...' : 'إضافة لفريق العمل'}
      </button>
    </article>
  )
}

function TeamBreadcrumb({ projectId, projectName }: { projectId: string; projectName: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500" aria-label="مسار الصفحة">
      <Link to="/projects" className="transition hover:text-[#50683f]">المشاريع</Link>
      <ChevronIcon />
      <Link to={`/projects/${projectId}`} className="transition hover:text-[#50683f]">{projectName}</Link>
      <ChevronIcon />
      <Link to={`/projects/${projectId}/team`} className="transition hover:text-[#50683f]">فريق العمل</Link>
      <ChevronIcon />
      <span className="text-slate-800">إضافة عضو</span>
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <svg className="mx-auto mb-3 h-14 w-14 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3.5 20a5.5 5.5 0 0 1 11 0M17 9a3 3 0 1 0 0-6M16 14a4.5 4.5 0 0 1 4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active'

  return (
    <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      {isActive ? 'نشط' : status}
    </span>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</div>
}
