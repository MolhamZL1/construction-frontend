import { api } from '@/lib/axios'

export type AiInspectionType = 'tiles' | 'paint' | 'cement_plaster' | 'ceiling' | 'electrical' | 'plumbing' | 'general'

export interface AiInspectionReport {
  status?: string
  score?: number
  confidence?: number
  summary?: string
  confirmed_defects?: string[]
  visual_observations?: string[]
  unverified_items?: string[]
  recommendations?: string[]
}

export interface AiInspectionResult {
  success?: boolean
  message?: string
  inspection_type?: AiInspectionType | string
  report?: AiInspectionReport
}

export interface InspectConstructionImagePayload {
  image: File
  inspectionType: AiInspectionType
}

export async function inspectConstructionImage({ image, inspectionType }: InspectConstructionImagePayload) {
  const formData = new FormData()
  formData.append('construction_image', image)
  formData.append('inspection_type', inspectionType)

  const response = await api.post<AiInspectionResult>('/ai-inspect-job', formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
