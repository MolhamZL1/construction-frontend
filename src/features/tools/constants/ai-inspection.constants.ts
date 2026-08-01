import type { AiInspectionType } from '../api/ai-inspection.api'

export const AI_INSPECTION_OPTIONS: ReadonlyArray<{ value: AiInspectionType; label: string }> = [
  { value: 'general', label: 'فحص عام' },
  { value: 'paint', label: 'دهان' },
  { value: 'cement_plaster', label: 'لياسة / طينة' },
  { value: 'tiles', label: 'بلاط وسيراميك' },
  { value: 'ceiling', label: 'أسقف' },
  { value: 'electrical', label: 'كهرباء' },
  { value: 'plumbing', label: 'صحية' },
]
