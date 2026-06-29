import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjectDocuments } from '@/features/documents/hooks/useDocuments'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailHeaderCard } from '../components/project-detail/ProjectDetailHeaderCard'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'
import { ProjectDetailSectionsPanel } from '../components/project-detail/ProjectDetailSectionsPanel'
import { ProjectDetailStats, type ProjectDetailStatItem } from '../components/project-detail/ProjectDetailStats'
import { ProjectLifecycleActions } from '../components/project-detail/ProjectLifecycleActions'
import { ProjectLifecycleConfirmDialog, type ProjectLifecycleAction } from '../components/project-detail/ProjectLifecycleConfirmDialog'
import {
  getProjectsErrorMessage,
  useCompleteProject,
  useProjectEngineers,
  useProjectSummary,
  useProjectWeather,
  useStartProject,
} from '../hooks/useProjects'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [lifecycleAction, setLifecycleAction] = useState<ProjectLifecycleAction | null>(null)

  const summaryQuery = useProjectSummary(id)
  const engineersQuery = useProjectEngineers(id)
  const weatherQuery = useProjectWeather(id)
  const documentsQuery = useProjectDocuments(id)
  const startProjectMutation = useStartProject()
  const completeProjectMutation = useCompleteProject()

  const project = summaryQuery.data?.project
  const spaces = summaryQuery.data?.spaces ?? []
  const workItems = summaryQuery.data?.workItems ?? []
  const engineers = engineersQuery.data ?? []
  const documents = documentsQuery.data?.documents ?? []

  const isLifecyclePending = startProjectMutation.isPending || completeProjectMutation.isPending
  const lifecycleError = startProjectMutation.error
    ? getProjectsErrorMessage(startProjectMutation.error)
    : completeProjectMutation.error
      ? getProjectsErrorMessage(completeProjectMutation.error)
      : null

  const tools = useMemo<ProjectDetailStatItem[]>(
    () => {
      const temperature = weatherQuery.isLoading
        ? 'جاري تحميل الطقس...'
        : weatherQuery.isError
          ? 'تعذر تحميل الطقس'
          : weatherQuery.data?.currentWeather?.temperature == null
            ? 'عرض تفاصيل الطقس'
            : `${Number(weatherQuery.data.currentWeather.temperature).toFixed(1)} °C`

      return [
        {
          key: 'weather',
          label: 'الطقس',
          description: 'حالة الطقس الحالية والبحث عن التوقعات بتاريخ محدد للمشروع.',
          to: `/projects/${id}/weather`,
          icon: 'cloud',
          accent: 'cyan',
          meta: temperature,
        },
        {
          key: 'crew-cost',
          label: 'حساب أجرة ورشة',
          description: 'أداة مخصصة لحساب تكلفة الورشة حسب أيام العمل وعدد العمال.',
          to: `/projects/${id}/crew-cost`,
          icon: 'calculator',
          accent: 'green',
          meta: 'قريباً',
        },
        {
          key: 'material-estimate',
          label: 'حساب كمية المواد التقديرية',
          description: 'أداة لتقدير كميات المواد المطلوبة بناءً على مساحات المشروع.',
          to: `/projects/${id}/material-estimate`,
          icon: 'materials',
          accent: 'orange',
          meta: 'قريباً',
        },
      ]
    },
    [id, weatherQuery.data?.currentWeather?.temperature, weatherQuery.isError, weatherQuery.isLoading]
  )

  function openLifecycleDialog(action: ProjectLifecycleAction) {
    startProjectMutation.reset()
    completeProjectMutation.reset()
    setLifecycleAction(action)
  }

  function closeLifecycleDialog() {
    if (isLifecyclePending) {
      return
    }

    setLifecycleAction(null)
  }

  async function confirmLifecycleAction() {
    if (!id || !lifecycleAction) {
      return
    }

    try {
      if (lifecycleAction === 'start') {
        await startProjectMutation.mutateAsync(id)
      } else {
        await completeProjectMutation.mutateAsync(id)
      }

      setLifecycleAction(null)
    } catch {
      return
    }
  }

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return <ProjectDetailErrorState title="المشروع غير موجود" description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب." />
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
          <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى المشاريع
        </Link>

        <ProjectDetailHeaderCard
          project={project}
          editTo={`/projects/${id}/edit`}
          lifecycleActions={
            <ProjectLifecycleActions
              project={project}
              isPending={isLifecyclePending}
              onActionClick={openLifecycleDialog}
            />
          }
        />

        <ProjectDetailStats items={tools} />

        <ProjectDetailSectionsPanel
          projectId={id}
          engineersCount={engineers.length}
          spacesCount={spaces.length}
          workItemsCount={workItems.length}
          documentsCount={documents.length}
        />
      </div>

      <ProjectLifecycleConfirmDialog
        action={lifecycleAction}
        projectName={project.name}
        isSubmitting={isLifecyclePending}
        errorMessage={lifecycleError}
        onCancel={closeLifecycleDialog}
        onConfirm={confirmLifecycleAction}
      />
    </section>
  )
}
