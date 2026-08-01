import { Link } from 'react-router-dom'
import type { ProjectSpace } from '../../models/project.model'
import { finishTypeLabels, isBathroomSpace, isShedSpace, isToiletOnlySpace, spaceTypeLabels, toiletTypeLabels } from '../../constants/project-spaces'
import { SpaceIcon, type SpaceIconName } from './SpaceIcon'

interface SpaceCardProps {
  projectId: string
  space: ProjectSpace
  canManage: boolean
  isDeleting?: boolean
  onDelete: (space: ProjectSpace) => void
}

const typeStyle: Record<string, { icon: SpaceIconName; badge: string }> = {
  room: { icon: 'room', badge: 'bg-slate-100 text-slate-700' },
  salon: { icon: 'home', badge: 'bg-purple-100 text-purple-700' },
  kitchen: { icon: 'kitchen', badge: 'bg-orange-100 text-orange-700' },
  bathroom: { icon: 'bathroom', badge: 'bg-blue-100 text-blue-700' },
  toilet: { icon: 'toilet', badge: 'bg-cyan-100 text-cyan-700' },
  corridor: { icon: 'home', badge: 'bg-emerald-100 text-emerald-700' },
  entrance: { icon: 'home', badge: 'bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]' },
  shed: { icon: 'shed', badge: 'bg-amber-100 text-amber-700' },
  storage: { icon: 'home', badge: 'bg-slate-100 text-slate-700' },
}

function formatArea(value: string | number | null | undefined) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) return '—'

  return numberValue.toFixed(2)
}

export function SpaceCard({ projectId, space, canManage, isDeleting = false, onDelete }: SpaceCardProps) {
  const style = typeStyle[space.type] ?? typeStyle.room
  const title = spaceTypeLabels[space.type] ?? space.type
  const showToiletType = isBathroomSpace(space.type) || isToiletOnlySpace(space.type)
  const isShed = isShedSpace(space.type)

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(var(--color-brand-ink-rgb)/0.09)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {canManage ? (
            <>
              <Link
                to={`/projects/${projectId}/spaces/${space.id}/edit`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-brand-ink)] transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.1)]"
                title="تعديل الفراغ"
                aria-label="تعديل الفراغ"
              >
                <SpaceIcon name="edit" className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete(space)}
                disabled={isDeleting}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                title="حذف الفراغ"
                aria-label="حذف الفراغ"
              >
                <SpaceIcon name="delete" className="h-5 w-5" />
              </button>
            </>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400" title="التعديل مقفل">
              <SpaceIcon name="lock" className="h-5 w-5" />
            </span>
          )}
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${style.badge}`}>
          <SpaceIcon name={style.icon} className="h-4 w-4" />
          {title}
        </div>
      </div>

      <div className="space-y-3 text-sm font-semibold text-slate-700">
        <InfoRow icon="area" label="مساحة الجدران" value={`${formatArea(space.wallArea)} م²`} />
        <InfoRow icon="area" label="مساحة السقف" value={`${formatArea(space.ceilingArea)} م²`} />
        <InfoRow icon="finish" label="تشطيب الجدران" value={finishTypeLabels[space.wallFinishType] ?? space.wallFinishType} />
        <InfoRow icon="ceiling" label="تشطيب السقف" value={finishTypeLabels[space.ceilingFinishType] ?? space.ceilingFinishType} />
        {showToiletType ? <InfoRow icon="toilet" label="نوع المرحاض" value={toiletTypeLabels[space.toiletType] ?? space.toiletType} /> : null}
        {isShed ? <InfoRow icon="shed" label="الأرضية مبلطة" value={space.isShedFloorTiled || space.isBalconyFloorTiled ? 'نعم' : 'لا'} /> : null}
      </div>
    </article>
  )
}

function InfoRow({ icon, label, value }: { icon: SpaceIconName; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <SpaceIcon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <p className="min-w-0 leading-6">
        <span className="text-slate-500">{label}: </span>
        <span className="text-slate-900">{value}</span>
      </p>
    </div>
  )
}
