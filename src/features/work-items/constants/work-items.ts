import type { WorkItemQualityLevel, WorkItemStatus } from '../models/work-item.model'

export const DEFAULT_WORK_ITEM_NAMES = [
  'ملابن الأبواب',
  'تمديدات كهرباء',
  'تمديدات صحية',
  'طينة / لياسة',
  'بلاط أرضيات',
  'سيراميك جدران / أسقف',
  'جبس بورد',
  'دهان',
  'أبواب ونجارة',
  'ألمنيوم وأبجورات',
  'تشطيبات نهائية',
] as const

export const workItemQualityOptions: Array<{ value: WorkItemQualityLevel; label: string; description: string }> = [
  { value: 'basic', label: 'عادي', description: 'مواد وتنفيذ بمستوى عادي ومقبول' },
  { value: 'good', label: 'جيد', description: 'مواد وتنفيذ بمستوى جيد ومتقن' },
  { value: 'premium', label: 'ممتاز', description: 'مواد وتشطيب بأعلى مستوى من الجودة' },
  { value: 'excellent', label: 'ممتاز', description: 'مواد وتشطيب بأعلى مستوى من الجودة' },
]

export const workItemStatusLabels: Record<string, string> = {
  planned: 'مخطط',
  ongoing: 'قيد التنفيذ',
  completed: 'مكتمل',
}

export const workItemQualityLabels: Record<string, string> = {
  basic: 'عادي',
  good: 'جيد',
  premium: 'ممتاز',
  excellent: 'ممتاز',
}

export function getWorkItemStatusLabel(status: WorkItemStatus) {
  return workItemStatusLabels[status] ?? status
}

export function getWorkItemQualityLabel(quality: WorkItemQualityLevel) {
  return workItemQualityLabels[quality] ?? quality
}

export type ProgressTemplateKey =
  | 'thresholds'
  | 'electrical_rooms'
  | 'plumbing_spaces'
  | 'room_selection'
  | 'carpentry'
  | 'aluminum'
  | 'generic_percent'

export function getProgressTemplateForWorkItem(name: string): ProgressTemplateKey {
  if (name.includes('ملابن')) return 'thresholds'
  if (name.includes('كهرباء')) return 'electrical_rooms'
  if (name.includes('صحية')) return 'plumbing_spaces'
  if (name.includes('أبواب') || name.includes('نجارة')) return 'carpentry'
  if (name.includes('ألمنيوم') || name.includes('ابجورات') || name.includes('أبجورات')) return 'aluminum'
  if (
    name.includes('بلاط') ||
    name.includes('جبس') ||
    name.includes('دهان') ||
    name.includes('طينة') ||
    name.includes('لياسة') ||
    name.includes('سيراميك')
  ) {
    return 'room_selection'
  }

  return 'generic_percent'
}
