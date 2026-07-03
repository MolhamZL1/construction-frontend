import { getWorkItemsErrorMessage } from '../../hooks/useWorkItems'
import { useWorkItemSpacesProgress } from '../../hooks/useWorkItemSpacesProgress'
import type { WorkItem } from '../../models/work-item.model'
import { getWorkItemSpaceProgressConfig } from '../../utils/work-item-space-progress-config'
import { FinishedSpaceProgressCard } from './SpaceProgressPhotos'

interface FinishedSpacesProgressSectionProps {
  projectId: string
  item: WorkItem
}

export function FinishedSpacesProgressSection({ projectId, item }: FinishedSpacesProgressSectionProps) {
  const config = getWorkItemSpaceProgressConfig(item.name)
  const spacesProgressQuery = useWorkItemSpacesProgress(projectId, item.id, config.needsSpace)

  if (!config.needsSpace) return null

  const finishedSpaces = config.filterSpaces
    ? (spacesProgressQuery.data?.finished ?? []).filter(config.filterSpaces)
    : (spacesProgressQuery.data?.finished ?? [])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#50683f]">توثيق الفراغات</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">الفراغات المنجزة لهذا البند</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">تظهر الصور المصغرة داخل البطاقة، ويمكن فتح الصورة بالضغط عليها.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{finishedSpaces.length} منجز</span>
      </div>

      {spacesProgressQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {spacesProgressQuery.isError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {getWorkItemsErrorMessage(spacesProgressQuery.error)}
        </div>
      ) : null}

      {!spacesProgressQuery.isLoading && !spacesProgressQuery.isError && finishedSpaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
          لا توجد فراغات منجزة لهذا البند حتى الآن.
        </div>
      ) : null}

      {finishedSpaces.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {finishedSpaces.map((space) => (
            <FinishedSpaceProgressCard key={space.id} space={space} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

