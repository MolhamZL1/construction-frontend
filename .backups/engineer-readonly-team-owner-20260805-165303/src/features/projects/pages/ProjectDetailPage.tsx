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
import { ProjectOwnerDialog } from '../components/project-detail/ProjectOwnerDialog'
import {
  ProjectLifecycleConfirmDialog,
  type ProjectLifecycleAction,
} from '../components/project-detail/ProjectLifecycleConfirmDialog'
import {
  getProjectsErrorMessage,
  useCompleteProject,
  useProjectEngineers,
  useProjects,
  useProjectSummary,
  useProjectWeather,
  useProjectWorkItems,
  useStartProject,
} from '../hooks/useProjects'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [lifecycleAction, setLifecycleAction] = useState<ProjectLifecycleAction | null>(null)
  const [isOwnerDialogOpen, setIsOwnerDialogOpen] = useState(false)

  const summaryQuery = useProjectSummary(id)
  const projectsQuery = useProjects()
  const workItemsQuery = useProjectWorkItems(id)
  const engineersQuery = useProjectEngineers(id)
  const weatherQuery = useProjectWeather(id)
  const documentsQuery = useProjectDocuments(id)
  const startProjectMutation = useStartProject()
  const completeProjectMutation = useCompleteProject()

  const project = summaryQuery.data?.project
  const spaces = summaryQuery.data?.spaces ?? []
  const workItems = workItemsQuery.data ?? summaryQuery.data?.workItems ?? []
  const projectMembers = engineersQuery.data ?? []
  const ownerAssignment = projectMembers.find((member) => member.role === 'project_owner') ?? null
  const engineers = projectMembers.filter((member) => member.role !== 'project_owner')
  const projectFromList = projectsQuery.data?.find((item) => item.id === id)
  const owner = project?.owner ?? projectFromList?.owner ?? (ownerAssignment?.user
    ? {
        id: ownerAssignment.user.id,
        name: ownerAssignment.user.name,
        email: ownerAssignment.user.email ?? null,
        internalId: ownerAssignment.user.internalId ?? null,
        status: ownerAssignment.user.status ?? null,
      }
    : null)
  const documents = documentsQuery.data?.documents ?? []

  const isLifecyclePending = startProjectMutation.isPending || completeProjectMutation.isPending
  const lifecycleError = startProjectMutation.error
    ? getProjectsErrorMessage(startProjectMutation.error)
    : completeProjectMutation.error
      ? getProjectsErrorMessage(completeProjectMutation.error)
      : null

  const tools = useMemo<ProjectDetailStatItem[]>(() => {
    const temperature = weatherQuery.isLoading
      ? 'جاري التحميل'
      : weatherQuery.isError
        ? 'غير متاح'
        : weatherQuery.data?.currentWeather?.temperature == null
          ? 'تفاصيل الطقس'
          : `${Number(weatherQuery.data.currentWeather.temperature).toFixed(1)} °C`

    return [
      {
        key: 'ai-visualizations',
        label: 'التصاميم الذكية',
        description: 'توليد وتعديل تصاميم الإكساء.',
        to: `/projects/${id}/ai-visualizations`,
        icon: 'home',
        accent: 'purple',
        meta: 'AI',
      },
     
      {
        key: 'crew-cost',
        label: 'حساب أجور الورش',
        description: 'حساب أجور اللياسة والدهان والبلاط.',
        to: `/projects/${id}/crew-cost`,
        icon: 'calculator',
        accent: 'green',
        meta: 'حساب',
      },

      {
        key: 'budget',
        label: 'تقدير الميزانية',
        description: 'تقدير المواد وأجور الورش والتكلفة الكلية.',
        to: `/projects/${id}/budget`,
        icon: 'materials',
        accent: 'orange',
        meta: 'تقدير',
      }, {
        key: 'timeline-analysis',
        label: 'التحليل الزمني',
        description: 'مخططات التنفيذ والتأخير المتوقع.',
        to: `/projects/${id}/timeline-analysis`,
        icon: 'timeline',
        accent: 'blue',
        meta: 'مخططات',
      },
      {
        key: 'weather',
        label: 'طقس المشروع',
        description: 'حالة الطقس وتأثيرها على العمل.',
        to: `/projects/${id}/weather`,
        icon: 'cloud',
        accent: 'cyan',
        meta: temperature,
      },
    ]
  }, [id, weatherQuery.data?.currentWeather?.temperature, weatherQuery.isError, weatherQuery.isLoading])

  function openLifecycleDialog(action: ProjectLifecycleAction) {
    startProjectMutation.reset()
    completeProjectMutation.reset()
    setLifecycleAction(action)
  }

  function closeLifecycleDialog() {
    if (isLifecyclePending) return

    setLifecycleAction(null)
  }

  async function confirmLifecycleAction() {
    if (!id || !lifecycleAction) return

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
    return (
      <ProjectDetailErrorState
        title="رابط المشروع غير صحيح"
        description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي."
      />
    )
  }

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-8 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return (
      <ProjectDetailErrorState
        title="المشروع غير موجود"
        description="قد يكون المشروع محذوفاً أو أن صلاحيات العرض غير متاحة لهذا الحساب."
      />
    )
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[var(--color-brand-ink)]"
          >
            <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
            العودة إلى المشاريع
          </Link>
        </div>

        <ProjectDetailHeaderCard
          project={project}
          editTo={`/projects/${id}/edit`}
          ownerName={owner?.name ?? null}
          onOwnerClick={() => setIsOwnerDialogOpen(true)}
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

      <ProjectOwnerDialog
        projectId={id}
        isOpen={isOwnerDialogOpen}
        currentOwner={owner ?? null}
        currentOwnerAssignmentId={ownerAssignment?.id ?? null}
        onClose={() => setIsOwnerDialogOpen(false)}
      />
    </section>
  )
}
