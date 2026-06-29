import { Navigate, useParams } from 'react-router-dom'

export function CreateProjectAiVisualizationPage() {
  const { id } = useParams<{ id: string }>()

  return <Navigate to={`/projects/${id ?? ''}/ai-visualizations`} replace state={{ openCreateDialog: true }} />
}
