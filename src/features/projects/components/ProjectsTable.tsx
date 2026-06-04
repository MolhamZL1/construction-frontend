import { LoadingState } from '@/components/ui'
import type { Project } from '../models/project.model'

interface ProjectsTableProps {
  projects: Project[]
  selectedProjectId?: string
  isLoading?: boolean
  onSelect: (project: Project) => void
}

const statusLabels: Record<Project['status'], string> = {
  planned: 'مخطط',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
}

export function ProjectsTable({ projects, selectedProjectId, isLoading = false, onSelect }: ProjectsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">المشروع</th>
              <th className="px-4 py-3 font-medium">الموقع</th>
              <th className="px-4 py-3 font-medium">المساحة</th>
              <th className="px-4 py-3 font-medium">الارتفاع</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
              <th className="px-4 py-3 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-4">
                  <LoadingState label="جاري تحميل المشاريع..." compact className="border-0 shadow-none" />
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  لا توجد مشاريع للعرض.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className={selectedProjectId === project.id ? 'bg-[#eef4eb] text-slate-800' : 'text-slate-700'}>
                  <td className="px-4 py-3 font-medium text-slate-900">{project.name}</td>
                  <td className="px-4 py-3">{project.location}</td>
                  <td className="px-4 py-3" dir="ltr">{project.apartmentArea}</td>
                  <td className="px-4 py-3" dir="ltr">{project.height}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(project)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#50683f] hover:text-[#50683f]"
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const className =
    status === 'completed'
      ? 'rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700'
      : status === 'ongoing'
        ? 'rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700'
        : 'rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600'

  return <span className={className}>{statusLabels[status]}</span>
}
