import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../models/project.model'
import { ProjectStatusBadge } from '../ProjectStatusBadge'
import { formatMeasurement, formatProjectDate } from '../../utils/projects-formatters'
import { ProjectDetailIcon } from './ProjectDetailIcons'
import { ProjectDetailMetricBox } from './ProjectDetailMetricBox'
import { ProjectDetailProgressBar } from './ProjectDetailProgressBar'

interface ProjectDetailHeaderCardProps {
  project: Project
  editTo: string
  lifecycleActions?: ReactNode
}

export function ProjectDetailHeaderCard({
  project,
  editTo,
  lifecycleActions,
}: ProjectDetailHeaderCardProps) {
  const canEditProject = project.status === 'planned'

  return (
    <article
      dir="rtl"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgba(15,23,42,0.07)] sm:p-6 md:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#50683f]/10 text-[#50683f] sm:h-16 sm:w-16">
            <ProjectDetailIcon name="building" className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

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
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.status} />
                {canEditProject ? (
                  <Link
                    to={editTo}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-[#50683f] active:scale-[0.98]"
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

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:gap-4">
          <ProjectDetailMetricBox icon="ruler" label="مساحة الشقة" value={`${formatMeasurement(project.apartmentArea)} م²`} />
          <ProjectDetailMetricBox icon="building" label="الارتفاع" value={`${formatMeasurement(project.height)} م`} />
        </div>

        <div className="flex shrink-0 items-center justify-center rounded-3xl border border-[#50683f]/10 bg-[#50683f]/5 px-5 py-4 lg:w-56">
          <ProjectDetailProgressBar value={project.progressPercent} />
        </div>
      </div>
    </article>
  )
}
