import { useMemo, useState } from 'react'

import { isProjectManager } from '@/features/auth/utils/auth-navigation'
import { EngineerProjectRequestsPanels, useProjectRequests } from '@/features/project-requests'
import { useAuthStore } from '@/stores/authStore'

import { ProjectsGrid } from '../components/ProjectsGrid'
import { ProjectsPageHeader } from '../components/ProjectsPageHeader'
import { ProjectsToolbar } from '../components/ProjectsToolbar'
import type { ProjectStatusFilter } from '../components/ProjectsToolbar'
import { getProjectsErrorMessage, useProjects } from '../hooks/useProjects'
import { projectMatchesSearch } from '../utils/projects-formatters'

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatusFilter>('all')
  const user = useAuthStore((state) => state.user)
  const canReviewRequests = isProjectManager(user)
  const requestsQuery = useProjectRequests(canReviewRequests)
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []

  const stats = useMemo(
    () => ({
      total: projects.length,
      planned: projects.filter((project) => project.status === 'planned').length,
      ongoing: projects.filter((project) => project.status === 'ongoing').length,
      completed: projects.filter((project) => project.status === 'completed').length,
    }),
    [projects],
  )

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = status === 'all' || project.status === status
      const matchesSearch = projectMatchesSearch(project, search)

      return matchesStatus && matchesSearch
    })
  }, [projects, search, status])

  const hasFilters = Boolean(search.trim()) || status !== 'all'

  function clearFilters() {
    setSearch('')
    setStatus('all')
  }

  return (
    <section className="min-h-screen space-y-6 bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <ProjectsPageHeader />

      {canReviewRequests ? (
        <EngineerProjectRequestsPanels
          data={requestsQuery.data}
          isLoading={requestsQuery.isLoading}
          isError={requestsQuery.isError}
        />
      ) : null}

      <ProjectsToolbar
        search={search}
        selectedStatus={status}
        stats={stats}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        onStatusChange={setStatus}
      />

      {projectsQuery.error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {getProjectsErrorMessage(projectsQuery.error)}
        </div>
      ) : null}

      <ProjectsGrid
        projects={filteredProjects}
        isLoading={projectsQuery.isLoading}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
    </section>
  )
}
