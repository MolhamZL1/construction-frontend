export interface MaterialUnitOption {
  value: string
  label: string
}

// حالياً API المواد يستقبل unit كنص.
// لاحقاً عند إضافة API لوحدات المواد، بدّل مصدر هذه القائمة فقط بدون تغيير الفورم.
export const DEFAULT_MATERIAL_UNIT_OPTIONS: MaterialUnitOption[] = [
  { value: 'Bag', label: 'كيس' },
  { value: 'Piece', label: 'قطعة' },
  { value: 'm²', label: 'متر مربع' },
  { value: 'Meter', label: 'متر' },
  { value: 'Cubic Meter', label: 'متر مكعب' },
  { value: 'Barrel', label: 'برميل' },
  { value: 'Board', label: 'لوح' },
  { value: 'Box', label: 'صندوق' },
  { value: 'Sheet', label: 'شريحة' },
]

export function getMaterialUnitLabel(unit?: string | null) {
  if (!unit) return '—'

  return DEFAULT_MATERIAL_UNIT_OPTIONS.find((option) => option.value === unit)?.label ?? unit
}

export function mergeMaterialUnitOptions(extraUnits: Array<string | null | undefined> = []) {
  const options = [...DEFAULT_MATERIAL_UNIT_OPTIONS]
  const existingValues = new Set(options.map((option) => option.value))

  extraUnits
    .map((unit) => unit?.trim())
    .filter((unit): unit is string => Boolean(unit))
    .forEach((unit) => {
      if (!existingValues.has(unit)) {
        options.push({ value: unit, label: unit })
        existingValues.add(unit)
      }
    })

  return options
}
