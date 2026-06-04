import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { ProjectLocationMap } from '../components/ProjectLocationMap'
import { ProjectWeatherCard } from '../components/ProjectWeatherCard'
import { WorkItemsDiagram } from '../components/WorkItemsDiagram'
import {
  getProjectsErrorMessage,
  useAssignEngineer,
  useCreateSpace,
  useDeleteSpace,
  useProjectEngineers,
  useProjectSpaces,
  useProjectSummary,
  useProjectWeather,
  useProjectWorkItems,
  useRemoveEngineer,
  useUpdateProject,
  useUpdateSpace,
} from '../hooks/useProjects'
import type { FinishType, Project, ProjectEngineerRole, ProjectSpace, ProjectStatus, SpaceType, ToiletType } from '../models/project.model'

type TabKey = 'spaces' | 'workItems' | 'engineers'

const tabList: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'spaces', label: 'المساحات', icon: 'spaces' },
  { key: 'workItems', label: 'بنود العمل', icon: 'workItems' },
  { key: 'engineers', label: 'المهندسون', icon: 'engineers' },
]

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

function allowsCeilingCeramic(type: string) {
  return type === 'kitchen' || type === 'bathroom' || type === 'toilet' || type === 'shed'
}

function ceilingFinishOptions(type: string) {
  return Object.entries(finishLabels).filter(([value]) => value !== 'ceramic' || allowsCeilingCeramic(type))
}

function normalizeCeilingFinish(type: string, finish: FinishType) {
  return finish === 'ceramic' && !allowsCeilingCeramic(type) ? 'none' : finish
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10'
const buttonClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#50683f] px-5 text-sm font-semibold text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-400 active:scale-[0.98]'
const ghostButtonClass =
  'rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f]'
const dangerButtonClass =
  'rounded-xl border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50'

function formatDate(dateStr?: string) {
  if (!dateStr) return 'غير محدد'
  return new Date(dateStr).toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabKey>('spaces')

  const summaryQuery = useProjectSummary(id)
  const engineersQuery = useProjectEngineers(id)
  const spacesQuery = useProjectSpaces(id)
  const workItemsQuery = useProjectWorkItems(id)
  const weatherQuery = useProjectWeather(id)

  const project = summaryQuery.data?.project

  if (summaryQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
        <LoadingState label="جاري تحميل بيانات المشروع..." />
      </section>
    )
  }

  if (!project) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center" dir="rtl">
        <div className="text-center">
          <svg className="mx-auto mb-3 h-16 w-16 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v6M12 16.5v.1" strokeLinecap="round" />
          </svg>
          <p className="text-lg font-semibold text-slate-700">المشروع غير موجود</p>
          <Link to="/projects" className="mt-3 inline-block text-sm font-medium text-[#50683f] hover:underline">
            العودة للمشاريع
          </Link>
        </div>
      </section>
    )
  }

  const sc = statusConfig[project.status]

  return (
    <section className="min-h-[calc(100vh-4rem)] px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
      {/* Back button */}
      <Link
        to="/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#50683f]"
      >
        <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        العودة للمشاريع
      </Link>

      {/* Header + Map Row */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-2xl font-bold text-slate-900">{project.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${sc.bg} ${sc.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                  {statusLabels[project.status]}
                </span>
              </div>
              <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <span>{project.location || 'لا يوجد موقع محفوظ'}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">معلومات المشروع</h2>
                <p className="mt-1 text-xs text-slate-400">عرض سريع للبيانات الأساسية المحفوظة للمشروع.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <InfoCard label="مساحة الشقة" value={`${project.apartmentArea} م²`} />
              <InfoCard label="الارتفاع" value={`${project.height} م`} />
              <InfoCard label="تاريخ الإنشاء" value={formatDate(project.createdAt)} />
              <InfoCard label="آخر تحديث" value={formatDate(project.updatedAt)} />
            </div>
          </div>

          {/* Update Form */}
          <ProjectUpdateForm project={project} />
        </div>

        {/* Map */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-700">موقع المشروع</h3>
              <span className="text-xs text-slate-400" dir="ltr">
                {project.latitude}, {project.longitude}
              </span>
            </div>
            <ProjectLocationMap
              latitude={Number(project.latitude)}
              longitude={Number(project.longitude)}
              projectName={project.name}
              height="300px"
            />
          </div>

          <ProjectWeatherCard weather={weatherQuery.data} isLoading={weatherQuery.isLoading} error={weatherQuery.error} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-[#50683f] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#50683f]/30 hover:text-[#50683f]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'spaces' ? (
          <SpacesTab projectId={id!} spaces={spacesQuery.data ?? []} isLoading={spacesQuery.isLoading} />
        ) : activeTab === 'workItems' ? (
          <WorkItemsDiagram projectId={id!} workItems={workItemsQuery.data ?? []} isLoading={workItemsQuery.isLoading} />
        ) : (
          <EngineersTab projectId={id!} engineers={engineersQuery.data ?? []} isLoading={engineersQuery.isLoading} />
        )}
      </div>
    </section>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function InfoCard({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-right shadow-sm">
      <p className="text-[11px] font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-900" dir={dir}>{value}</p>
    </div>
  )
}

function ProjectUpdateForm({ project }: { project: Project }) {
  const mutation = useUpdateProject()
  const [isEditing, setIsEditing] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    try {
      await mutation.mutateAsync({
        id: project.id,
        name: String(fd.get('name')),
        location: project.location,
        apartmentArea: Number(fd.get('apartmentArea')),
        height: Number(fd.get('height')),
        latitude: Number(project.latitude),
        longitude: Number(project.longitude),
        status: project.status,
      })
      setIsEditing(false)
    } catch {
      return
    }
  }

  if (!isEditing) {
    return (
      <div className="mt-5 flex justify-end">
        <button className={ghostButtonClass} type="button" onClick={() => setIsEditing(true)}>
          تعديل معلومات المشروع
        </button>
      </div>
    )
  }

  return (
    <form className="mt-5 rounded-2xl border border-[#50683f]/20 bg-[#50683f]/[0.03] p-4" onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">تعديل معلومات المشروع</h3>
          <p className="mt-0.5 text-xs text-slate-400">التعديل متاح للاسم والمساحة والارتفاع فقط. الموقع والحالة والإحداثيات تبقى كما هي.</p>
        </div>
        <button className={ghostButtonClass} type="button" onClick={() => setIsEditing(false)} disabled={mutation.isPending}>
          إلغاء
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <FormField label="اسم المشروع">
          <input className={inputClass} name="name" defaultValue={project.name} placeholder="اسم المشروع" required />
        </FormField>
        <FormField label="مساحة الشقة">
          <input className={inputClass} name="apartmentArea" type="number" step="0.01" min="0" defaultValue={project.apartmentArea} required />
        </FormField>
        <FormField label="الارتفاع">
          <input className={inputClass} name="height" type="number" step="0.01" min="0" defaultValue={project.height} placeholder="الارتفاع" required />
        </FormField>
        <div className="flex items-end">
          <button className={buttonClass} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'جاري التحديث...' : 'حفظ التعديل'}
          </button>
        </div>
      </div>
      {mutation.error ? <ErrorBox error={mutation.error} /> : null}
    </form>
  )
}

function EngineersTab({
  projectId,
  engineers,
  isLoading,
}: {
  projectId: string
  engineers: ReturnType<typeof useProjectEngineers>['data']
  isLoading: boolean
}) {
  const assignMutation = useAssignEngineer()
  const removeMutation = useRemoveEngineer()

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    try {
      await assignMutation.mutateAsync({
        projectId,
        userId: String(fd.get('userId')),
        role: String(fd.get('role')) as ProjectEngineerRole,
      })
      form.reset()
    } catch {
      return
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">مهندسو المشروع</h3>

      <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleAssign}>
        <input className={inputClass} name="userId" type="number" min="1" placeholder="معرف المستخدم" required />
        <select className={inputClass} name="role" defaultValue="project_manager">
          {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className={buttonClass} type="submit" disabled={assignMutation.isPending}>إسناد</button>
      </form>
      {assignMutation.error ? <ErrorBox error={assignMutation.error} /> : null}

      <div className="mt-5 space-y-3">
        {isLoading ? <LoadingState label="جاري تحميل المهندسين..." compact className="border-dashed shadow-none" /> : null}
        {engineers?.map((eng) => (
          <div key={eng.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{eng.user?.name ?? `#${eng.userId}`}</p>
              <p className="mt-0.5 text-xs text-slate-500">{roleLabels[eng.role]}</p>
            </div>
            <button className={dangerButtonClass} type="button" onClick={() => removeMutation.mutate({ projectId, engineerId: eng.id })} disabled={removeMutation.isPending}>
              إزالة
            </button>
          </div>
        ))}
        {!isLoading && engineers?.length === 0 ? <p className="text-sm text-slate-500">لا يوجد مهندسون مسندون.</p> : null}
      </div>
    </div>
  )
}

function SpacesTab({
  projectId,
  spaces,
  isLoading,
}: {
  projectId: string
  spaces: ReturnType<typeof useProjectSpaces>['data']
  isLoading: boolean
}) {
  const createMutation = useCreateSpace()
  const updateMutation = useUpdateSpace()
  const deleteMutation = useDeleteSpace()
  const [selectedSpaceType, setSelectedSpaceType] = useState<SpaceType>('room')
  const [selectedCeilingFinish, setSelectedCeilingFinish] = useState<FinishType>('none')
  const [editingSpace, setEditingSpace] = useState<{ id: string; type: SpaceType; ceilingFinish: FinishType } | null>(null)

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    const type = String(fd.get('type') ?? 'room') as SpaceType
    const ceilingFinishType = String(fd.get('ceilingFinishType') ?? 'none') as FinishType

    try {
      await createMutation.mutateAsync({
        projectId,
        type,
        wallArea: Number(fd.get('wallArea')),
        wallFinishType: String(fd.get('wallFinishType')) as FinishType,
        ceilingArea: Number(fd.get('ceilingArea')),
        ceilingFinishType: normalizeCeilingFinish(type, ceilingFinishType),
        toiletType: (isToiletSpace(type) ? String(fd.get('toiletType') ?? 'none') : 'none') as ToiletType,
        isBalconyFloorTiled: isShedSpace(type) && fd.get('isBalconyFloorTiled') === 'on',
      })
      form.reset()
      setSelectedSpaceType('room')
      setSelectedCeilingFinish('none')
    } catch {
      return
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, spaceId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    const type = String(fd.get('type') ?? 'room') as SpaceType
    const ceilingFinishType = String(fd.get('ceilingFinishType') ?? 'none') as FinishType

    try {
      await updateMutation.mutateAsync({
        id: spaceId,
        type,
        wallArea: Number(fd.get('wallArea')),
        wallFinishType: String(fd.get('wallFinishType')) as FinishType,
        ceilingArea: Number(fd.get('ceilingArea')),
        ceilingFinishType: normalizeCeilingFinish(type, ceilingFinishType),
        toiletType: (isToiletSpace(type) ? String(fd.get('toiletType') ?? 'none') : 'none') as ToiletType,
        isBalconyFloorTiled: isShedSpace(type) && fd.get('isBalconyFloorTiled') === 'on',
      })
      setEditingSpace(null)
    } catch {
      return
    }
  }

  function startEditing(space: ProjectSpace) {
    setEditingSpace({
      id: space.id,
      type: space.type,
      ceilingFinish: normalizeCeilingFinish(space.type, space.ceilingFinishType),
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">المساحات</h3>

      <form className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreate}>
        <FormField label="نوع المساحة" hint="اختر تصنيف المساحة التي تريد إضافتها.">
          <select
            className={inputClass}
            name="type"
            value={selectedSpaceType}
            onChange={(event) => {
              const nextType = event.target.value as SpaceType
              setSelectedSpaceType(nextType)
              if (selectedCeilingFinish === 'ceramic' && !allowsCeilingCeramic(nextType)) {
                setSelectedCeilingFinish('none')
              }
            }}
            required
          >
            {spaceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </FormField>
        <FormField label="مساحة الجدران" hint="المساحة المحسوبة لتشطيب الجدران بالمتر المربع.">
          <input className={inputClass} name="wallArea" type="number" min="0" step="0.01" placeholder="0.00" required />
        </FormField>
        <FormField label="تشطيب الجدران" hint="نوع التشطيب المستخدم للجدران فقط.">
          <select className={inputClass} name="wallFinishType" defaultValue="paint">
            {Object.entries(finishLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <FormField label="مساحة السقف" hint="المساحة المحسوبة لتشطيب السقف بالمتر المربع.">
          <input className={inputClass} name="ceilingArea" type="number" min="0" step="0.01" placeholder="0.00" required />
        </FormField>
        <FormField label="تشطيب السقف" hint="نوع التشطيب المستخدم للسقف فقط.">
          <select
            className={inputClass}
            name="ceilingFinishType"
            value={selectedCeilingFinish}
            onChange={(event) => setSelectedCeilingFinish(event.target.value as FinishType)}
          >
            {ceilingFinishOptions(selectedSpaceType).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        {isToiletSpace(selectedSpaceType) ? (
          <FormField label="نوع المرحاض" hint="يظهر فقط عند اختيار حمام أو مرحاض.">
            <select className={inputClass} name="toiletType" defaultValue="none">
              {toiletTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </FormField>
        ) : null}
        {isShedSpace(selectedSpaceType) ? (
          <FormField label="تبليط السقيفة" hint="يظهر فقط عند اختيار نوع المساحة سقيفة.">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm text-slate-600">
              <input name="isBalconyFloorTiled" type="checkbox" className="accent-[#50683f]" />
              هل السقيفة مبلطة؟
            </label>
          </FormField>
        ) : null}
        <button className={buttonClass} type="submit" disabled={createMutation.isPending}>إضافة مساحة</button>
      </form>
      {createMutation.error ? <ErrorBox error={createMutation.error} /> : null}
      {updateMutation.error ? <ErrorBox error={updateMutation.error} /> : null}

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {isLoading ? <LoadingState label="جاري تحميل المساحات..." compact className="border-dashed shadow-none xl:col-span-2" /> : null}
        {spaces?.map((space) => (
          <div key={space.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
            {editingSpace?.id === space.id ? (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => handleUpdate(event, space.id)}>
                <FormField label="نوع المساحة">
                  <select
                    className={inputClass}
                    name="type"
                    value={editingSpace.type}
                    onChange={(event) => {
                      const nextType = event.target.value as SpaceType
                      setEditingSpace({
                        ...editingSpace,
                        type: nextType,
                        ceilingFinish: normalizeCeilingFinish(nextType, editingSpace.ceilingFinish),
                      })
                    }}
                    required
                  >
                    {spaceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </FormField>
                <FormField label="مساحة الجدران">
                  <input className={inputClass} name="wallArea" type="number" min="0" step="0.01" defaultValue={space.wallArea} required />
                </FormField>
                <FormField label="تشطيب الجدران">
                  <select className={inputClass} name="wallFinishType" defaultValue={space.wallFinishType}>
                    {Object.entries(finishLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </FormField>
                <FormField label="مساحة السقف">
                  <input className={inputClass} name="ceilingArea" type="number" min="0" step="0.01" defaultValue={space.ceilingArea} required />
                </FormField>
                <FormField label="تشطيب السقف">
                  <select
                    className={inputClass}
                    name="ceilingFinishType"
                    value={editingSpace.ceilingFinish}
                    onChange={(event) => setEditingSpace({ ...editingSpace, ceilingFinish: event.target.value as FinishType })}
                  >
                    {ceilingFinishOptions(editingSpace.type).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </FormField>
                {isToiletSpace(editingSpace.type) ? (
                  <FormField label="نوع المرحاض">
                    <select className={inputClass} name="toiletType" defaultValue={space.toiletType}>
                      {toiletTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </FormField>
                ) : null}
                {isShedSpace(editingSpace.type) ? (
                  <FormField label="تبليط السقيفة">
                    <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
                      <input name="isBalconyFloorTiled" type="checkbox" defaultChecked={space.isBalconyFloorTiled} className="accent-[#50683f]" />
                      هل السقيفة مبلطة؟
                    </label>
                  </FormField>
                ) : null}
                <div className="flex items-end gap-2 sm:col-span-2">
                  <button className={buttonClass} type="submit" disabled={updateMutation.isPending}>حفظ التعديل</button>
                  <button className={ghostButtonClass} type="button" onClick={() => setEditingSpace(null)}>إلغاء</button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{space.type}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    جدران {space.wallArea} م² · سقف {space.ceilingArea} م²
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    تشطيب الجدران: {finishLabels[space.wallFinishType] ?? space.wallFinishType} · سقف: {finishLabels[space.ceilingFinishType] ?? space.ceilingFinishType}
                  </p>
                  {isToiletSpace(space.type) ? (
                    <p className="mt-0.5 text-xs text-slate-400">
                      نوع المرحاض: {toiletTypeOptions.find((option) => option.value === space.toiletType)?.label ?? space.toiletType}
                    </p>
                  ) : null}
                  {isShedSpace(space.type) ? (
                    <p className="mt-0.5 text-xs text-slate-400">
                      السقيفة مبلطة: {space.isBalconyFloorTiled ? 'نعم' : 'لا'}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className={ghostButtonClass} type="button" onClick={() => startEditing(space)}>
                    تعديل
                  </button>
                  <button className={dangerButtonClass} type="button" onClick={() => deleteMutation.mutate(space.id)} disabled={deleteMutation.isPending}>
                    حذف
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && spaces?.length === 0 ? <p className="text-sm text-slate-500">لا توجد مساحات.</p> : null}
      </div>
    </div>
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
  return (
    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {getProjectsErrorMessage(error)}
    </div>
  )
}
