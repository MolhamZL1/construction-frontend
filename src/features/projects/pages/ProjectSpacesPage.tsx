import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BackButton, LoadingState } from '@/components/ui'
import { DeleteSpaceDialog } from '../components/spaces/DeleteSpaceDialog'
import { SpaceIcon } from '../components/spaces/SpaceIcon'
import { SpacePageHeader } from '../components/spaces/SpacePageHeader'
import { SpacesGrid } from '../components/spaces/SpacesGrid'
import { finishTypeLabels, spaceTypeLabels, toiletTypeLabels } from '../constants/project-spaces'
import { getProjectsErrorMessage, useDeleteSpace, useProjectSpaces, useProjectSummary } from '../hooks/useProjects'
import type { ProjectSpace } from '../models/project.model'

function spaceMatchesSearch(space: ProjectSpace, search: string) {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) return true

  const searchableText = [
    space.type,
    spaceTypeLabels[space.type],
    space.wallArea,
    space.ceilingArea,
    space.wallFinishType,
    finishTypeLabels[space.wallFinishType],
    space.ceilingFinishType,
    finishTypeLabels[space.ceilingFinishType],
    space.toiletType,
    toiletTypeLabels[space.toiletType],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchableText.includes(normalizedSearch)
}

export function ProjectSpacesPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ?? ''
  const [search, setSearch] = useState('')
  const [spaceToDelete, setSpaceToDelete] = useState<ProjectSpace | null>(null)

  const summaryQuery = useProjectSummary(projectId)
  const spacesQuery = useProjectSpaces(projectId)
  const deleteMutation = useDeleteSpace()

  const project = summaryQuery.data?.project
  const spaces = spacesQuery.data ?? summaryQuery.data?.spaces ?? []
  const canManage = project?.status === 'planned'

  const filteredSpaces = useMemo(() => spaces.filter((space) => spaceMatchesSearch(space, search)), [search, spaces])

  if (!id) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المشروع غير صحيح.
        </div>
      </section>
    )
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white px-5 py-7 text-center" dir="rtl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
            <SpaceIcon name="warning" className="h-9 w-9" />
          </span>
          <p className="text-lg font-black text-slate-800">المشروع غير موجود</p>
          <Link to="/projects" className="mt-3 inline-flex text-sm font-bold text-[#50683f] hover:underline">
            العودة للمشاريع
          </Link>
        </div>
      </section>
    )
  }

  function confirmDelete() {
    if (!spaceToDelete || !canManage) return

    deleteMutation.mutate(spaceToDelete.id, {
      onSuccess: () => setSpaceToDelete(null),
    })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <BackButton to={`/projects/${projectId}`} label="العودة لتفاصيل المشروع" />
        </div>

        <SpacePageHeader
          projectId={projectId}
          projectName={project.name}
          search={search}
          onSearchChange={setSearch}
          spacesCount={spaces.length}
          canManage={canManage}
        />

        {summaryQuery.error ? <InlineError message={getProjectsErrorMessage(summaryQuery.error)} /> : null}
        {spacesQuery.error ? <InlineError message={getProjectsErrorMessage(spacesQuery.error)} /> : null}

        {spacesQuery.isLoading ? (
          <LoadingState label="جاري تحميل فراغات المشروع..." />
        ) : (
          <SpacesGrid
            projectId={projectId}
            spaces={filteredSpaces}
            canManage={canManage}
            isFiltering={Boolean(search.trim())}
            isDeleting={deleteMutation.isPending}
            onDelete={(space) => canManage && setSpaceToDelete(space)}
          />
        )}
      </div>

      <DeleteSpaceDialog
        isOpen={Boolean(spaceToDelete)}
        space={spaceToDelete}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteMutation.error ? getProjectsErrorMessage(deleteMutation.error) : null}
        onClose={() => (deleteMutation.isPending ? undefined : setSpaceToDelete(null))}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}
