import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useProjects } from '../hooks/useProjects'
import { CreateProjectForm } from '../components/CreateProjectForm'
import type { Project, ProjectStatus } from '../models/project.model'

type FilterTab = 'all' | ProjectStatus

const tabs: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'الكل' },
  { key: 'planned', label: 'مخطط' },
  { key: 'ongoing', label: 'قيد التنفيذ' },
  { key: 'completed', label: 'مكتمل' },
]

const statusConfig: Record<ProjectStatus, { label: string; bg: string; text: string; dot: string }> = {
  planned: { label: 'مخطط', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  ongoing: { label: 'قيد التنفيذ', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'مكتمل', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredProjects = activeTab === 'all' ? projects : projects.filter((p) => p.status === activeTab)

  const stats = {
    total: projects.length,
    planned: projects.filter((p) => p.status === 'planned').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] px-6 py-7 sm:px-8 lg:px-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">المشاريع</h1>
          <p className="mt-1.5 text-sm text-slate-500">إدارة ومتابعة جميع مشاريع الإكساء</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#50683f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#435834] active:scale-[0.98]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          إضافة مشروع
        </button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">مشروع جديد</h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <CreateProjectForm onCreated={() => setShowCreateForm(false)} />
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المشاريع" value={stats.total} icon="total" color="slate" />
        <StatCard label="مخطط" value={stats.planned} icon="planned" color="blue" />
        <StatCard label="قيد التنفيذ" value={stats.ongoing} icon="ongoing" color="amber" />
        <StatCard label="مكتمل" value={stats.completed} icon="completed" color="emerald" />
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
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
            {tab.key !== 'all' ? (
              <span className={`mr-2 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-slate-400'}`}>
                ({stats[tab.key]})
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="mt-6">
        {isLoading ? (
          <LoadingState label="جاري تحميل المشاريع..." />
        ) : filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
            <div className="text-center">
              <svg className="mx-auto mb-3 h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-slate-500">لا توجد مشاريع</p>
              <p className="mt-1 text-xs text-slate-400">ابدأ بإضافة مشروع جديد</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const config = statusConfig[project.status]

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#50683f]/30 hover:shadow-md"
    >
      {/* Status Badge */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
        <svg
          className="h-5 w-5 text-slate-300 transition group-hover:text-[#50683f] rtl:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Name & Location */}
      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#50683f] transition line-clamp-1">
        {project.name}
      </h3>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span className="line-clamp-1">{project.location}</span>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-slate-100" />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-400">المساحة</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800" dir="ltr">{project.apartmentArea} م²</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium text-slate-400">الارتفاع</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800" dir="ltr">{project.height} م</p>
        </div>
      </div>
    </Link>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: 'slate' | 'blue' | 'amber' | 'emerald'
}) {
  const colors = {
    slate: { bg: 'bg-slate-100', iconBg: 'bg-slate-200', text: 'text-slate-600' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
  }
  const c = colors[color]

  return (
    <div className={`flex items-center gap-4 rounded-2xl ${c.bg} p-5`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}>
        <StatIcon name={icon} className={`h-6 w-6 ${c.text}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function StatIcon({ name, className }: { name: string; className?: string }) {
  if (name === 'total') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16v13H4zM8 6V4h8v2M8 11h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'planned') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (name === 'ongoing') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.5l2.3 2.3 4.7-5.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
