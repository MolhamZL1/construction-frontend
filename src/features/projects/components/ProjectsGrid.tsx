import { LoadingState } from '@/components/ui'
import type { Project } from '../models/project.model'
import { ProjectCard } from './ProjectCard'
import { ProjectsEmptyState } from './ProjectsEmptyState'

interface ProjectsGridProps {
  projects: Project[]
  isLoading: boolean
  hasFilters: boolean
  onClearFilters: () => void
}

export function ProjectsGrid({ projects, isLoading, hasFilters, onClearFilters }: ProjectsGridProps) {
  if (isLoading) {
    return <LoadingState label="جاري تحميل المشاريع..." />
  }

  if (projects.length === 0) {
    return <ProjectsEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
