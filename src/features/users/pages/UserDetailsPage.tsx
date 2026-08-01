import { Link, useLocation, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { UserDetailsSummaryCards } from '../components/UserDetailsSummaryCards'
import { UserProfileCard } from '../components/UserProfileCard'
import { UserProjectsSection } from '../components/UserProjectsSection'
import { UsersErrorState } from '../components/UsersErrorState'
import { getUsersErrorMessage } from '../hooks/useUsers'
import { useUserDetails } from '../hooks/useUserDetails'
import { useUserProjectsStatistics } from '../hooks/useUserStatistics'
import type { User, UserProject } from '../types/user.types'

interface UserDetailsLocationState {
  user?: User
}

export function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const location = useLocation()
  const initialUser = (location.state as UserDetailsLocationState | null)?.user

  const userQuery = useUserDetails(userId, initialUser)
  const user = userQuery.data

  const projectsQuery = useUserProjectsStatistics(user?.id)
  const projects = (projectsQuery.data?.projects ?? []) as UserProject[]

  if (userQuery.isLoading) {
    return (
      <section dir="rtl" className="min-h-screen bg-[var(--color-brand-paper)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <LoadingState label="جاري تحميل تفاصيل المستخدم..." />
        </div>
      </section>
    )
  }

  if (userQuery.isError) {
    return (
      <section dir="rtl" className="min-h-screen bg-[var(--color-brand-paper)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <DetailsBackLink />
          <UsersErrorState message={getUsersErrorMessage(userQuery.error)} />
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section dir="rtl" className="min-h-screen bg-[var(--color-brand-paper)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          <DetailsBackLink />
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center text-sm font-semibold text-slate-600 shadow-sm">
            تعذر العثور على بيانات المستخدم
          </div>
        </div>
      </section>
    )
  }

  return (
    <section dir="rtl" className="min-h-screen bg-[var(--color-brand-paper)] px-4 py-6 text-right sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <DetailsBackLink />

        <header className="space-y-2">
         

          <div>
            <h1 className="text-2xl font-bold text-[var(--color-brand-ink)] sm:text-3xl">
              تفاصيل المستخدم
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-brand-stone)]">
              معلومات مفصلة عن المستخدم ومشاريعه
            </p>
          </div>
        </header>

        <div className="space-y-5">
          <UserProfileCard user={user} />

          <UserDetailsSummaryCards projects={projects} />

          <UserProjectsSection
            projects={projects}
            isLoading={projectsQuery.isLoading}
            errorMessage={projectsQuery.isError ? getUsersErrorMessage(projectsQuery.error) : undefined}
          />
        </div>
      </div>
    </section>
  )
}

function DetailsBackLink() {
  return (
    <div className="flex justify-start">
      <Link
        to="/users"
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[var(--color-brand-ink)] shadow-sm transition hover:border-[rgb(var(--color-brand-ink-rgb)/0.4)] hover:bg-[var(--color-brand-paper)]"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>العودة إلى المستخدمين</span>
      </Link>
    </div>
  )
}