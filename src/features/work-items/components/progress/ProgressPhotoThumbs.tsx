import { env } from '@/config/env'

export interface ProgressPhotoLike {
  id?: string
  filePath?: string | null
  url?: string | null
  originalName?: string | null
}

interface ProgressPhotoThumbsProps {
  photos: ProgressPhotoLike[]
}

function getBackendOrigin() {
  return env.API_BASE_URL
    .replace(/\/api(?:\/v\d+)?\/?$/i, '')
    .replace(/\/$/, '')
}

export function resolveProgressPhotoUrl(path?: string | null) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path

  const normalizedPath = path.replace(/^\/+/, '')
  const storagePath = normalizedPath.startsWith('storage/') ? normalizedPath : `storage/${normalizedPath}`

  return `${getBackendOrigin()}/${storagePath}`
}

function getPhotoUrl(photo: ProgressPhotoLike) {
  return photo.url || resolveProgressPhotoUrl(photo.filePath)
}

export function ProgressPhotoThumbs({ photos }: ProgressPhotoThumbsProps) {
  const visiblePhotos = photos.filter((photo) => getPhotoUrl(photo))

  if (visiblePhotos.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visiblePhotos.map((photo, index) => {
        const url = getPhotoUrl(photo)
        const label = photo.originalName || `صورة إنجاز ${index + 1}`

        return (
          <a
            key={photo.id || `${url}-${index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            title="اضغط لفتح الصورة"
            className="group relative block h-14 w-14 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition hover:scale-105 hover:ring-2 hover:ring-[#50683f] focus:outline-none focus:ring-2 focus:ring-[#50683f]"
          >
            <img src={url} alt={label} loading="lazy" className="h-full w-full object-cover transition group-hover:brightness-95" />
          </a>
        )
      })}
    </div>
  )
}
