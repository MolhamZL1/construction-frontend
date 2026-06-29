import type { FinishType, SpaceType, ToiletType } from '../models/project.model'

export const projectSpaceTypeOptions: Array<{ value: SpaceType; label: string; hint: string }> = [
  { value: 'room', label: 'غرفة', hint: 'فراغ سكني اعتيادي' },
  { value: 'salon', label: 'صالون', hint: 'فراغ استقبال أو معيشة' },
  { value: 'kitchen', label: 'مطبخ', hint: 'فراغ مطبخ' },
  { value: 'bathroom', label: 'حمام', hint: 'حمام مع خيار نوع المرحاض' },
  { value: 'toilet', label: 'تواليت', hint: 'دورة مياه صغيرة' },
  { value: 'corridor', label: 'ممر', hint: 'فراغ حركة داخلي' },
  { value: 'entrance', label: 'مدخل', hint: 'مدخل المشروع أو الشقة' },
  { value: 'shed', label: 'سقيفة', hint: 'فراغ سقيفة مع خيار تبليط الأرضية' },
  { value: 'storage', label: 'مستودع', hint: 'فراغ تخزين' },
]

export const wallFinishOptions: Array<{ value: FinishType; label: string }> = [
  { value: 'paint', label: 'دهان' },
  { value: 'ceramic', label: 'سيراميك' },
]

export const ceilingFinishOptions: Array<{ value: FinishType; label: string }> = [
  { value: 'paint', label: 'دهان' },
  { value: 'ceramic', label: 'سيراميك' },
  { value: 'gypsum', label: 'جبس' },
]

export const toiletTypeOptions: Array<{ value: ToiletType; label: string }> = [
  { value: 'none', label: 'لا يوجد' },
  { value: 'arabic', label: 'عربي' },
  { value: 'western', label: 'فرنجي' },
]

export const spaceTypeLabels: Record<string, string> = {
  room: 'غرفة',
  salon: 'صالون',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
  toilet: 'تواليت',
  corridor: 'ممر',
  entrance: 'مدخل',
  shed: 'سقيفة',
  storage: 'مستودع',
}

export const finishTypeLabels: Record<string, string> = {
  paint: 'دهان',
  ceramic: 'سيراميك',
  gypsum: 'جبس',
  none: 'لا يوجد',
  custom: 'مخصص',
}

export const toiletTypeLabels: Record<string, string> = {
  none: 'لا يوجد',
  arabic: 'عربي',
  western: 'فرنجي',
}

export function isShedSpace(type?: string) {
  return type === 'shed'
}

export function isBathroomSpace(type?: string) {
  return type === 'bathroom'
}

export function isToiletOnlySpace(type?: string) {
  return type === 'toilet'
}

export function spaceHasToiletQuestion(type?: string) {
  return isBathroomSpace(type) || isToiletOnlySpace(type)
}

export function defaultToiletTypeForSpace(type?: string): ToiletType {
  if (isToiletOnlySpace(type)) return 'western'
  return 'none'
}

export function normalizeCeilingFinish(_type: string, finish: FinishType): FinishType {
  return finish
}
