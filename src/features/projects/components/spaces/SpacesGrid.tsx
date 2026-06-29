import type { ProjectSpace } from '../../models/project.model'
import { SpaceCard } from './SpaceCard'
import { SpaceIcon } from './SpaceIcon'

interface SpacesGridProps {
  projectId: string
  spaces: ProjectSpace[]
  canManage: boolean
  isFiltering: boolean
  isDeleting?: boolean
  onDelete: (space: ProjectSpace) => void
}

export function SpacesGrid({ projectId, spaces, canManage, isFiltering, isDeleting = false, onDelete }: SpacesGridProps) {
  if (spaces.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
          <SpaceIcon name="home" className="h-9 w-9" />
        </span>
        <h2 className="mt-4 text-lg font-black text-slate-800">
          {isFiltering ? 'لا توجد فراغات مطابقة للبحث' : 'لا توجد فراغات بعد'}
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {isFiltering ? 'جرّب البحث بنوع فراغ أو نوع تشطيب آخر.' : 'ابدأ بإضافة فراغات المشروع قبل مرحلة التنفيذ.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          projectId={projectId}
          space={space}
          canManage={canManage}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
