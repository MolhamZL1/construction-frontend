import type { UserRole } from '../types/user.types'

const roleLabels: Record<UserRole, string> = {
  company_admin: 'مسؤول الشركة',
  project_manager: 'مدير مشروع',
  assistant: 'مساعد',
  project_owner: 'مالك مشروع',
}

const roleClasses: Record<UserRole, string> = {
  company_admin: 'bg-slate-100 text-[#637381]',
  project_manager: 'bg-[#4A5C3F]/10 text-[#4A5C3F]',
  assistant: 'bg-[#00B8D9]/10 text-[#00B8D9]',
  project_owner: 'bg-emerald-50 text-emerald-600',
}

export function getRoleLabel(role?: string) {
  if (!role || !isUserRole(role)) {
    return '—'
  }

  return roleLabels[role]
}

export function RoleBadge({ role }: { role?: string }) {
  if (!role || !isUserRole(role)) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${roleClasses[role]}`} dir="ltr">
      {roleLabels[role]}
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 11.5c0 4.5-3 6.7-6.5 7.9a1.5 1.5 0 0 1-1 0C8 18.2 5 16 5 11.5V6.7c0-.4.3-.7.7-.7 2 0 4.4-1.1 6-2.5.3-.3.8-.3 1.1 0 1.6 1.4 4 2.5 5.7 2.5.4 0 .7.3.7.7v4.8Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function isUserRole(role: string): role is UserRole {
  return role === 'company_admin' || role === 'project_manager' || role === 'assistant' || role === 'project_owner'
}
