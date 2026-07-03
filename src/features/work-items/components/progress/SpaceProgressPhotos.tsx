import type { SyntheticEvent } from 'react'
import { spaceTypeLabels } from '@/features/projects/constants/project-spaces'
import type { WorkItemProgressPhoto, WorkItemProgressSpace } from '../../models/work-item-space-progress.model'
import { getProgressPhotoDirectUrl, getProgressPhotoUrl } from '../../utils/progress-photo-url'

function formatArea(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return String(value)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(parsed)
}

function getSpaceLabel(space: WorkItemProgressSpace) {
  return spaceTypeLabels[space.type] ?? space.type
}

function handlePhotoError(event: SyntheticEvent<HTMLImageElement>, filePath: string) {
  const fallbackUrl = getProgressPhotoDirectUrl(filePath)

  if (fallbackUrl && event.currentTarget.src !== fallbackUrl) {
    event.currentTarget.src = fallbackUrl
  }
}

export function SpaceMeta({ space }: { space: WorkItemProgressSpace }) {
  return (
    <p className="mt-1 text-xs font-bold opacity-80">
      جدران {formatArea(space.wallArea)} م² • سقف {formatArea(space.ceilingArea)} م²
    </p>
  )
}

export function SpaceProgressPhotoGrid({ photos }: { photos: WorkItemProgressPhoto[] }) {
  if (photos.length === 0) {
    return <p className="mt-3 text-xs font-bold text-slate-400">لا توجد صور مرفقة لهذا الفراغ.</p>
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {photos.map((photo) => {
        const imageUrl = getProgressPhotoUrl(photo.filePath)

        return (
          <a
            key={photo.id || photo.filePath}
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            title={photo.originalName ?? 'فتح الصورة'}
            className="group block h-16 w-16 overflow-hidden rounded-xl border border-white bg-white shadow-sm ring-1 ring-emerald-100 transition hover:scale-[1.03] hover:ring-2 hover:ring-emerald-300"
          >
            <img
              src={imageUrl}
              alt={photo.originalName ?? 'صورة إنجاز الفراغ'}
              loading="lazy"
              onError={(event) => handlePhotoError(event, photo.filePath)}
              className="h-full w-full object-cover transition group-hover:opacity-90"
            />
          </a>
        )
      })}
    </div>
  )
}

export function FinishedSpaceProgressCard({ space }: { space: WorkItemProgressSpace }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-right text-emerald-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black">{getSpaceLabel(space)}</p>
          <SpaceMeta space={space} />
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-100">منجز</span>
      </div>
      <SpaceProgressPhotoGrid photos={space.progressPhotos} />
    </div>
  )
}

