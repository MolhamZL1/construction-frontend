import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { LoadingState } from '@/components/ui'
import {
  getProjectsErrorMessage,
  useAssignEngineer,
  useCreateSpace,
  useDeleteSpace,
  useProjectEngineers,
  useProjectSpaces,
  useProjectWeather,
  useProjectWorkItems,
  useRemoveEngineer,
  useUpdateProject,
} from '../hooks/useProjects'
import type { FinishType, Project, ProjectEngineerRole, ProjectStatus, SpaceType, ToiletType } from '../models/project.model'
import { ProjectWeatherCard } from './ProjectWeatherCard'
import { WorkItemsDiagram } from './WorkItemsDiagram'

interface ProjectDetailsPanelProps {
  project: Project
}

const statusLabels: Record<ProjectStatus, string> = {
  planned: 'مخطط',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
}

const statusConfig: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  planned: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  ongoing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

const roleLabels: Record<ProjectEngineerRole, string> = {
  project_manager: 'مدير مشروع',
  assistant: 'مساعد',
  project_owner: 'مالك مشروع',
}

const finishLabels: Record<FinishType, string> = {
  paint: 'دهان',
  ceramic: 'سيراميك',
  gypsum: 'جبس',
  none: 'بدون',
  custom: 'مخصص',
}

const spaceTypeOptions: Array<{ value: SpaceType; label: string }> = [
  { value: 'room', label: 'غرفة' },
  { value: 'salon', label: 'صالون' },
  { value: 'kitchen', label: 'مطبخ' },
  { value: 'bathroom', label: 'حمام' },
  { value: 'toilet', label: 'مرحاض' },
  { value: 'corridor', label: 'ممر' },
  { value: 'entrance', label: 'مدخل' },
  { value: 'shed', label: 'سقيفة' },
  { value: 'storage', label: 'مستودع' },
  { value: 'custom', label: 'مخصص' },
]

const toiletTypeOptions: Array<{ value: ToiletType; label: string }> = [
  { value: 'none', label: 'لا يوجد' },
  { value: 'arabic', label: 'عربي' },
  { value: 'western', label: 'فرنجي' },
]

function isToiletSpace(type: string) {
  return type === 'bathroom' || type === 'toilet'
}

function isShedSpace(type: string) {
  return type === 'shed'
}

function ceilingFinishOptions() {
  return Object.entries(finishLabels)
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'
const buttonClass =
  'rounded-lg bg-[#50683f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400'
const ghostButtonClass =
  'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f]'
const dangerButtonClass =
  'rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50'

export function ProjectDetailsPanel({ project }: ProjectDetailsPanelProps) {
  const engineersQuery = useProjectEngineers(project.id)
  const spacesQuery = useProjectSpaces(project.id)
  const workItemsQuery = useProjectWorkItems(project.id)
  const weatherQuery = useProjectWeather(project.id)
  const updateProjectMutation = useUpdateProject()
  const [isEditing, setIsEditing] = useState(false)

  async function handleUpdateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        name: String(formData.get('name') ?? ''),
        location: project.location,
        apartmentArea: Number(formData.get('apartmentArea')),
        height: Number(formData.get('height')),
        latitude: Number(project.latitude),
        longitude: Number(project.longitude),
        status: project.status,
      })
      setIsEditing(false)
    } catch {
      return
    }
  }

  const sc = statusConfig[project.status]

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {/* Title */}
        <div className="flex flex-wrap items-start gap-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {statusLabels[project.status]}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
              <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {project.location}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
          <InfoCard label="المساحة" value={`${project.apartmentArea} م²`} />
          <InfoCard label="الارتفاع" value={`${project.height} م`} />
          <InfoCard label="المهندسون" value={`${engineersQuery.data?.length ?? 0} مهندس`} />
          <InfoCard label="تاريخ الإنشاء" value={formatDate(project.createdAt) ?? '—'} />
        </div>

        {/* Edit toggle */}
        {!isEditing ? (
          <div className="mt-4 flex justify-end">
            <button className={ghostButtonClass} type="button" onClick={() => setIsEditing(true)}>
              تعديل المشروع
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#50683f]/20 bg-[#50683f]/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">تعديل المشروع</p>
              <button className={ghostButtonClass} type="button" onClick={() => setIsEditing(false)} disabled={updateProjectMutation.isPending}>
                إلغاء
              </button>
            </div>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={handleUpdateProject}>
              <FormField label="اسم المشروع">
                <input className={inputClass} name="name" defaultValue={project.name} placeholder="اسم المشروع" required />
              </FormField>
              <FormField label="المساحة (م²)">
                <input className={inputClass} name="apartmentArea" type="number" step="0.01" min="0" defaultValue={project.apartmentArea} required />
              </FormField>
              <FormField label="الارتفاع (م)">
                <input className={inputClass} name="height" type="number" step="0.01" min="0" defaultValue={project.height} required />
              </FormField>
              <div className="flex items-end md:col-span-3">
                <button className={buttonClass} type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? 'جاري التحديث...' : 'حفظ التعديل'}
                </button>
              </div>
            </form>
            {updateProjectMutation.error ? <ErrorBox error={updateProjectMutation.error} /> : null}
          </div>
        )}
      </div>

      <ProjectWeatherCard weather={weatherQuery.data} isLoading={weatherQuery.isLoading} error={weatherQuery.error} />
      <EngineersSection projectId={project.id} engineers={engineersQuery.data ?? []} isLoading={engineersQuery.isLoading} />
      <SpacesSection projectId={project.id} spaces={spacesQuery.data ?? []} isLoading={spacesQuery.isLoading} />
      <WorkItemsDiagram projectId={project.id} workItems={workItemsQuery.data ?? []} isLoading={workItemsQuery.isLoading} />
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-right">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
    </div>
  )
}

function EngineersSection({ projectId, engineers, isLoading }: { projectId: string; engineers: ReturnType<typeof useProjectEngineers>['data']; isLoading: boolean }) {
  const assignMutation = useAssignEngineer()
  const removeMutation = useRemoveEngineer()

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    try {
      await assignMutation.mutateAsync({
        projectId,
        userId: String(formData.get('userId') ?? ''),
        role: String(formData.get('role')) as ProjectEngineerRole,
      })
      form.reset()
    } catch {
      return
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">مهندسو المشروع</h3>
      <form className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleAssign}>
        <input className={inputClass} name="userId" type="number" min="1" placeholder="معرف المستخدم" required />
        <select className={inputClass} name="role" defaultValue="project_manager">
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className={buttonClass} type="submit" disabled={assignMutation.isPending}>إسناد</button>
      </form>
      {assignMutation.error ? <ErrorBox error={assignMutation.error} /> : null}

      <div className="mt-4 space-y-2">
        {isLoading ? <LoadingState label="جاري تحميل المهندسين..." compact className="border-dashed shadow-none" /> : null}
        {engineers?.map((engineer) => (
          <div key={engineer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{engineer.user?.name ?? `#${engineer.userId}`}</p>
              <p className="mt-0.5 text-xs text-slate-500">{roleLabels[engineer.role]}</p>
            </div>
            <button
              type="button"
              className={dangerButtonClass}
              onClick={() => removeMutation.mutate({ projectId, engineerId: engineer.id })}
              disabled={removeMutation.isPending}
            >
              إزالة
            </button>
          </div>
        ))}
        {!isLoading && engineers?.length === 0 ? <p className="text-sm text-slate-500">لا يوجد مهندسون مسندون.</p> : null}
      </div>
    </section>
  )
}

function SpacesSection({ projectId, spaces, isLoading }: { projectId: string; spaces: ReturnType<typeof useProjectSpaces>['data']; isLoading: boolean }) {
  const createMutation = useCreateSpace()
  const deleteMutation = useDeleteSpace()
  const [selectedSpaceType, setSelectedSpaceType] = useState<SpaceType>('room')
  const [selectedCeilingFinish, setSelectedCeilingFinish] = useState<FinishType>('none')

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const type = String(formData.get('type') ?? 'room') as SpaceType
    const ceilingFinishType = String(formData.get('ceilingFinishType') ?? 'none') as FinishType
    try {
      await createMutation.mutateAsync({
        projectId,
        type,
        wallArea: Number(formData.get('wallArea')),
        wallFinishType: String(formData.get('wallFinishType')) as FinishType,
        ceilingArea: Number(formData.get('ceilingArea')),
        ceilingFinishType,
        toiletType: (isToiletSpace(type) ? String(formData.get('toiletType') ?? 'none') : 'none') as ToiletType,
        isBalconyFloorTiled: isShedSpace(type) && formData.get('isBalconyFloorTiled') === 'on',
      })
      form.reset()
      setSelectedSpaceType('room')
      setSelectedCeilingFinish('none')
    } catch {
      return
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-bold text-slate-900">المساحات</h3>
      <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreate}>
        <FormField label="نوع المساحة" hint="اختر تصنيف المساحة التي تريد إضافتها.">
          <select
            className={inputClass}
            name="type"
            value={selectedSpaceType}
            onChange={(event) => {
              const nextType = event.target.value as SpaceType
              setSelectedSpaceType(nextType)
            }}
            required
          >
            {spaceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </FormField>
        <FormField label="مساحة الجدران" hint="بالمتر المربع.">
          <input className={inputClass} name="wallArea" type="number" min="0" step="0.01" placeholder="0.00" required />
        </FormField>
        <FormField label="تشطيب الجدران">
          <select className={inputClass} name="wallFinishType" defaultValue="paint">
            {Object.entries(finishLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FormField>
        <FormField label="مساحة السقف" hint="بالمتر المربع.">
          <input className={inputClass} name="ceilingArea" type="number" min="0" step="0.01" placeholder="0.00" required />
        </FormField>
        <FormField label="تشطيب السقف">
          <select
            className={inputClass}
            name="ceilingFinishType"
            value={selectedCeilingFinish}
            onChange={(event) => setSelectedCeilingFinish(event.target.value as FinishType)}
          >
            {ceilingFinishOptions().map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FormField>
        {isToiletSpace(selectedSpaceType) ? (
          <FormField label="نوع المرحاض">
            <select className={inputClass} name="toiletType" defaultValue="none">
              {toiletTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
        ) : null}
        {isShedSpace(selectedSpaceType) ? (
          <FormField label="تبليط السقيفة">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-600">
              <input name="isBalconyFloorTiled" type="checkbox" className="accent-[#50683f]" />
              هل السقيفة مبلطة؟
            </label>
          </FormField>
        ) : null}
        <button className={buttonClass} type="submit" disabled={createMutation.isPending}>إضافة مساحة</button>
      </form>
      {createMutation.error ? <ErrorBox error={createMutation.error} /> : null}

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {isLoading ? <LoadingState label="جاري تحميل المساحات..." compact className="border-dashed shadow-none xl:col-span-2" /> : null}
        {spaces?.map((space) => (
          <div key={space.id} className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{space.type}</p>
                <p className="mt-1 text-xs text-slate-500">جدران {space.wallArea} م² · سقف {space.ceilingArea} م²</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  تشطيب الجدران: {finishLabels[space.wallFinishType] ?? space.wallFinishType} · سقف: {finishLabels[space.ceilingFinishType] ?? space.ceilingFinishType}
                </p>
                {isToiletSpace(space.type) ? (
                  <p className="mt-0.5 text-xs text-slate-400">نوع المرحاض: {toiletTypeOptions.find((o) => o.value === space.toiletType)?.label ?? space.toiletType}</p>
                ) : null}
                {isShedSpace(space.type) ? (
                  <p className="mt-0.5 text-xs text-slate-400">السقيفة مبلطة: {space.isBalconyFloorTiled ? 'نعم' : 'لا'}</p>
                ) : null}
              </div>
              <button className={dangerButtonClass} type="button" onClick={() => deleteMutation.mutate(space.id)} disabled={deleteMutation.isPending}>حذف</button>
            </div>
          </div>
        ))}
        {!isLoading && spaces?.length === 0 ? <p className="text-sm text-slate-500">لا توجد مساحات.</p> : null}
      </div>
    </section>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="block space-y-1.5 text-right">
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] leading-5 text-slate-400">{hint}</span> : null}
    </div>
  )
}

function ErrorBox({ error }: { error: unknown }) {
  return <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{getProjectsErrorMessage(error)}</div>
}
