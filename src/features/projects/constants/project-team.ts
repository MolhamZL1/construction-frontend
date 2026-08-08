import type { ProjectEngineerRole } from '../models/project.model'

export const projectTeamRoleLabels: Record<ProjectEngineerRole, string> = {
  project_manager: 'مدير مشروع',
  assistant: 'مساعد',
  project_owner: 'مالك مشروع',
}

export const projectTeamRoleOptions: Array<{ value: ProjectEngineerRole; label: string }> = [
  { value: 'project_manager', label: projectTeamRoleLabels.project_manager },
  { value: 'assistant', label: projectTeamRoleLabels.assistant },
]
