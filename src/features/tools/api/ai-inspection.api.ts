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

export interface InspectProgressRequestPayload {
  progressRequestId: string | number
  inspectionType: AiInspectionType
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  const items = value.map((item) => String(item ?? '').trim()).filter(Boolean)
  return items.length > 0 ? items : undefined
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeReport(value: unknown): AiInspectionReport | undefined {
  if (!isRecord(value)) return undefined

  return {
    status: normalizeString(value.status ?? value.status_label ?? value.verdict),
    score: normalizeNumber(value.score ?? value.quality_score ?? value.quality),
    confidence: normalizeNumber(value.confidence ?? value.confidence_score),
    summary: normalizeString(value.summary ?? value.description ?? value.analysis),
    confirmed_defects: normalizeStringArray(value.confirmed_defects ?? value.defects ?? value.issues),
    visual_observations: normalizeStringArray(value.visual_observations ?? value.observations),
    unverified_items: normalizeStringArray(value.unverified_items ?? value.unverified),
    recommendations: normalizeStringArray(value.recommendations ?? value.suggestions),
  }
}

function normalizeInspectionResult(payload: unknown): AiInspectionResult {
  if (!isRecord(payload)) return {}

  const nested = payload.data ?? payload.result
  if (isRecord(nested)) {
    const normalizedNested = normalizeInspectionResult(nested)

    return {
      success: typeof payload.success === 'boolean' ? payload.success : normalizedNested.success,
      message: normalizeString(payload.message) ?? normalizedNested.message,
      inspection_type: normalizedNested.inspection_type,
      report: normalizedNested.report,
    }
  }

  return {
    success: typeof payload.success === 'boolean' ? payload.success : undefined,
    message: normalizeString(payload.message),
    inspection_type: normalizeString(payload.inspection_type),
    report: normalizeReport(payload.report ?? payload.inspection ?? payload.analysis),
  }
}

async function postInspection(endpoint: string, formData: FormData) {
  const response = await api.post<unknown>(endpoint, formData, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  })

  return normalizeInspectionResult(response.data)
}

export function inspectConstructionImage({ image, inspectionType }: InspectConstructionImagePayload) {
  const formData = new FormData()
  formData.append('construction_image', image)
  formData.append('inspection_type', inspectionType)

  return postInspection('/ai-inspect-job', formData)
}

export function inspectProgressRequest({ progressRequestId, inspectionType }: InspectProgressRequestPayload) {
  const formData = new FormData()
  formData.append('progress_update_request_id', String(progressRequestId))
  formData.append('inspection_type', inspectionType)

  return postInspection('/ai-inspect-job2', formData)
}
