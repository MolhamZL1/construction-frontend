import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Project } from '../../models/project.model'
import { useProjectReview } from '../../hooks/useProjectReviews'
import { ProjectStatusBadge } from '../ProjectStatusBadge'
import { formatMeasurement, formatProjectDate } from '../../utils/projects-formatters'
import { ProjectDetailIcon } from './ProjectDetailIcons'
import { ProjectDetailProgressBar } from './ProjectDetailProgressBar'
import { ProjectOwnerReview } from './ProjectOwnerReview'

interface ProjectDetailHeaderCardProps {
  project: Project
  editTo: string
  lifecycleActions?: ReactNode
  ownerName?: string | null
  onOwnerClick?: () => void
}

export function ProjectDetailHeaderCard({
  project,
  editTo,
  lifecycleActions,
  ownerName,
  onOwnerClick,
}: ProjectDetailHeaderCardProps) {
  const canEditProject = project.status === 'planned'
  const isCompleted = String(project.status).toLowerCase() === 'completed'
  const reviewQuery = useProjectReview(project.id, isCompleted)

  return (
    <article
      dir="rtl"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] sm:p-6 md:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <ProjectDetailProgressBar value={project.progressPercent} compact />

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold leading-9 text-slate-900 sm:text-3xl sm:leading-10">
                  {project.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <ProjectDetailIcon name="location" className="h-4 w-4 text-slate-400" />
                    {project.location || 'لا يوجد موقع محفوظ'}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ProjectDetailIcon name="calendar" className="h-4 w-4 text-slate-400" />
                    تاريخ الإنشاء: {formatProjectDate(project.createdAt)}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ProjectDetailIcon name="ruler" className="h-4 w-4 text-slate-400" />
                    <span>مساحة الشقة:</span>
                    <span dir="ltr">{formatMeasurement(project.apartmentArea)} م²</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ProjectDetailIcon name="building" className="h-4 w-4 text-slate-400" />
                    <span>الارتفاع:</span>
                    <span dir="ltr">{formatMeasurement(project.height)} م</span>
                  </span>

                  {onOwnerClick ? (
                    <button
                      type="button"
                      onClick={onOwnerClick}
                      className="group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-right transition hover:bg-[rgb(var(--color-brand-gold-rgb)/0.08)] hover:text-[var(--color-brand-ink)]"
                      title="تحديد أو تغيير مالك المشروع"
                    >
                      <ProjectDetailIcon name="users" className="h-4 w-4 text-slate-400 transition group-hover:text-[var(--color-brand-ink)]" />
                      <span>المالك:</span>
                      <span className={ownerName ? 'font-bold text-slate-700' : 'font-semibold text-slate-400'}>
                        {ownerName ?? 'لم يتم تحديد مالك للمشروع'}
                      </span>
                      <ProjectDetailIcon name="edit" className="h-3.5 w-3.5 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-1.5 py-1">
                      <ProjectDetailIcon name="users" className="h-4 w-4 text-slate-400" />
                      <span>المالك:</span>
                      <span className={ownerName ? 'font-bold text-slate-700' : 'font-semibold text-slate-400'}>
                        {ownerName ?? 'لم يتم تحديد مالك للمشروع'}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} />

                {canEditProject ? (
                  <Link
                    to={editTo}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)] active:scale-[0.98]"
                  >
                    <ProjectDetailIcon name="edit" className="h-4 w-4" />
                    تعديل
                  </Link>
                ) : null}

                {lifecycleActions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCompleted ? (
        <ProjectOwnerReview
          review={reviewQuery.data ?? null}
          isLoading={reviewQuery.isLoading}
        />
      ) : null}

    </article>
  )
}
