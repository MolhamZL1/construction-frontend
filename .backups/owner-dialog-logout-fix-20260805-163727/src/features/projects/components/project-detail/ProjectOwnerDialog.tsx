import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { LoadingState, SearchInput } from '@/components/ui'
import { getUsersByRole } from '@/features/users/api/users.api'
import { getUsersErrorMessage } from '@/features/users/hooks/useUsers'
import type { User } from '@/features/users/types/user.types'

import { getProjectsErrorMessage, useAssignEngineer, useRemoveEngineer } from '../../hooks/useProjects'
import type { ProjectOwner } from '../../models/project.model'

interface ProjectOwnerDialogProps {
  projectId: string
  isOpen: boolean
  currentOwner: ProjectOwner | null
  currentOwnerAssignmentId: string | null
  onClose: () => void
}

export function ProjectOwnerDialog({
  projectId,
  isOpen,
  currentOwner,
  currentOwnerAssignmentId,
  onClose,
}: ProjectOwnerDialogProps) {
  const [search, setSearch] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)

  const assignMutation = useAssignEngineer()
  const removeMutation = useRemoveEngineer()

  const usersQuery = useQuery({
    queryKey: ['projects', projectId, 'owner-candidates'],
    queryFn: async (): Promise<User[]> => {
      const response = await getUsersByRole('project_owner')
      return response.data ?? []
    },
    enabled: isOpen,
  })

  const users = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return (usersQuery.data ?? [])
      .filter((user) => {
        if (!normalizedSearch) return true

        const searchableText = [user.name, user.email, user.internal_id, user.id, user.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(normalizedSearch)
      })
      .sort((first, second) => {
        const firstIsCurrent = String(first.id) === currentOwner?.id
        const secondIsCurrent = String(second.id) === currentOwner?.id

        if (firstIsCurrent !== secondIsCurrent) return firstIsCurrent ? -1 : 1
        return String(first.name ?? '').localeCompare(String(second.name ?? ''), 'ar')
      })
  }, [currentOwner?.id, search, usersQuery.data])

  const isBusy = assignMutation.isPending || removeMutation.isPending
  const mutationError = assignMutation.error
    ? getProjectsErrorMessage(assignMutation.error)
    : removeMutation.error
      ? getProjectsErrorMessage(removeMutation.error)
      : null

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setConfirmRemove(false)
      assignMutation.reset()
      removeMutation.reset()
    }
  }, [isOpen])

  function closeDialog() {
    if (isBusy) return
    onClose()
  }

  async function assignOwner(user: User) {
    if (user.id == null) return

    const userId = String(user.id)

    if (currentOwner?.id === userId) {
      onClose()
      return
    }

    try {
      const ownerAssignmentId = currentOwnerAssignmentId ?? currentOwner?.id ?? null

      if (currentOwner && ownerAssignmentId) {
        await removeMutation.mutateAsync({
          projectId,
          engineerId: ownerAssignmentId,
        })
      }

      await assignMutation.mutateAsync({
        projectId,
        userId,
        role: 'project_owner',
      })

      onClose()
    } catch {
      return
    }
  }

  async function removeOwner() {
    const ownerAssignmentId = currentOwnerAssignmentId ?? currentOwner?.id ?? null

    if (!ownerAssignmentId) return

    try {
      await removeMutation.mutateAsync({
        projectId,
        engineerId: ownerAssignmentId,
      })
      onClose()
    } catch {
      return
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-owner-dialog-title"
      dir="rtl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog()
      }}
    >
      <section className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 id="project-owner-dialog-title" className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              {currentOwner ? 'إدارة مالك المشروع' : 'تحديد مالك المشروع'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              اختر مالك المشروع من المستخدمين المسجلين بهذا الدور.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isBusy}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-end">
            <div>
              <span className="mb-2 block text-sm font-bold text-slate-700">الدور</span>
              <div className="flex h-12 items-center gap-2 rounded-xl border border-[rgb(var(--color-brand-gold-rgb)/0.3)] bg-[rgb(var(--color-brand-gold-rgb)/0.08)] px-4 text-sm font-extrabold text-[var(--color-brand-ink)]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3l7 3v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6l7-3Z" />
                  <path d="M9.5 12l1.7 1.7 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                مالك المشروع
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">البحث عن مالك</span>
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="البحث بالاسم، البريد، أو المعرف..."
                className="h-12 bg-white"
              />
            </label>
          </div>

          {currentOwner ? (
            <div className="mt-5 rounded-2xl border border-[rgb(var(--color-brand-gold-rgb)/0.25)] bg-[rgb(var(--color-brand-gold-rgb)/0.06)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-brand-ink)] shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">المالك الحالي</p>
                    <p className="truncate text-base font-extrabold text-slate-900">{currentOwner.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500" dir="ltr">
                      {currentOwner.email ?? currentOwner.internalId ?? `#${currentOwner.id}`}
                    </p>
                  </div>
                </div>

                {!confirmRemove ? (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    disabled={isBusy}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    حذف المالك
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-rose-700">تأكيد الحذف؟</span>
                    <button
                      type="button"
                      onClick={removeOwner}
                      disabled={isBusy}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-3 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                    >
                      {removeMutation.isPending ? 'جاري الحذف...' : 'نعم، احذف'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(false)}
                      disabled={isBusy}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              لم يتم تحديد مالك للمشروع حالياً.
            </div>
          )}

          {usersQuery.error ? <InlineError message={getUsersErrorMessage(usersQuery.error)} /> : null}
          {mutationError ? <InlineError message={mutationError} /> : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-900">مستخدمو دور مالك المشروع</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">اضغط على تحديد لاختيار المالك أو تغييره.</p>
            </div>

            {usersQuery.isLoading ? (
              <div className="p-5">
                <LoadingState label="جاري تحميل المالكين المتاحين..." compact className="border-dashed shadow-none" />
              </div>
            ) : null}

            {!usersQuery.isLoading && users.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-3 text-sm font-bold text-slate-700">لا يوجد مستخدمون مطابقون</p>
                <p className="mt-1 text-xs text-slate-500">تأكد من وجود مستخدم بدور مالك مشروع أو غيّر عبارة البحث.</p>
              </div>
            ) : null}

            {!usersQuery.isLoading && users.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {users.map((user) => {
                  const userId = String(user.id ?? '')
                  const isCurrent = userId === currentOwner?.id

                  return (
                    <article key={userId} className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-extrabold text-slate-900">{user.name ?? `مستخدم #${userId}`}</p>
                            {isCurrent ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                                المالك الحالي
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-500" dir="ltr">
                            {user.email ?? user.internal_id ?? `#${userId}`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => assignOwner(user)}
                        disabled={isBusy || isCurrent || !user.id}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300 active:scale-[0.98]"
                      >
                        {isCurrent ? 'محدد حالياً' : assignMutation.isPending ? 'جاري التحديد...' : currentOwner ? 'تغيير المالك' : 'تحديد المالك'}
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      {message}
    </div>
  )
}
