import { FormEvent, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { api } from '@/lib/axios'
import { LoadingState } from '@/components/ui'
import { ProjectDetailErrorState } from '../components/project-detail/ProjectDetailErrorState'
import { ProjectDetailIcon } from '../components/project-detail/ProjectDetailIcons'

type CrewType = 'plaster' | 'paint' | 'tile'

type CrewCostResponse = {
  status: number
  message: string
  data: {
    project?: {
      id: number | string
      name: string
    }
    formula?: Record<string, number | string | null>
    pricing?: Record<string, number | string | null>
  }
}

type FieldConfig = {
  name: string
  label: string
  helper?: string
  defaultValue: string
}

const crewOptions: Array<{ value: CrewType; label: string; description: string; endpoint: string; fields: FieldConfig[] }> = [
  {
    value: 'plaster',
    label: 'ورشة اللياسة / الطينة',
    description: 'حساب تكلفة اللياسة حسب سعر المتر وعدد الجسور.',
    endpoint: 'plaster',
    fields: [
      { name: 'price_per_meter', label: 'سعر المتر', helper: 'مثال: 22', defaultValue: '' },
      { name: 'beams_count', label: 'عدد الاعمدة (العضاضات)', helper: 'مثال: 4', defaultValue: '' },
    ],
  },
  {
    value: 'paint',
    label: 'ورشة الدهان',
    description: 'حساب تكلفة الدهان حسب سعر المتر وعدد الجسور.',
    endpoint: 'paint',
    fields: [
      { name: 'price_per_meter', label: 'سعر المتر', helper: 'مثال: 22', defaultValue: '' },
      { name: 'beams_count', label:  'عدد الاعمدة (العضاضات)', helper: 'مثال: 4', defaultValue: '' },
    ],
  },
  {
    value: 'tile',
    label: 'ورشة البلاط والسيراميك',
    description: 'حساب تكلفة البلاط مع عامل الوزرة وتكلفة تركيب المغاسل.',
    endpoint: 'tile',
    fields: [
      { name: 'price_per_meter', label: 'سعر المتر', helper: 'مثال: 22', defaultValue: '' },
      { name: 'skirting_factor', label: 'عاملي النعلات', helper: 'مثال: 0.5', defaultValue: '0.5' },
      { name: 'sink_installation_cost', label: 'تكلفة تركيب المغاسل', helper: 'مثال: 22', defaultValue: '' },
    ],
  },
]

const formulaLabels: Record<string, string> = {
  apartment_area: 'مساحة الشقة',
  wall_area: 'مساحة الجدران',
  shed_tiled_area: 'مساحة أرضية السقيفة',
  ceramic_wall_area: 'مساحة سيراميك الجدران',
  ceramic_ceiling_area_x2: 'مساحة سيراميك الأسقف × 2',
  beams_count:  'عدد الاعمدة (العضاضات)',
  beams_area:  'مساحة الاعمدة (العضاضات)',
  apartment_ceiling_area_x2: 'مساحة أسقف الشقة × 2',
  shed_ceiling_area_x2: 'مساحة أسقف السقيفة × 2',
  skirting_factor: 'عاملي النعلات',
  skirting_area: 'مساحة النعلات',
  total_area: 'المساحة الإجمالية',
}

const pricingLabels: Record<string, string> = {
  price_per_meter: 'سعر المتر',
  sink_installation_cost: 'تكلفة تركيب المغاسل',
  final_cost: 'التكلفة النهائية',
}

function formatNumber(value: number | string | null | undefined) {
  if (value == null || value === '') return '—'

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return String(value)

  return new Intl.NumberFormat('ar', {
    maximumFractionDigits: 2,
  }).format(numericValue)
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) return 'حدث خطأ غير متوقع. حاول مرة أخرى.'

  const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
  const validationMessage = data?.errors ? Object.values(data.errors)[0]?.[0] : null

  return validationMessage ?? data?.message ?? 'تعذر حساب أجرة الورشة. تحقق من القيم ثم أعد المحاولة.'
}

export function ProjectCrewCostPage() {
  const { id } = useParams<{ id: string }>()
  const [crewType, setCrewType] = useState<CrewType>('plaster')
  const [result, setResult] = useState<CrewCostResponse['data'] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedCrew = useMemo(() => crewOptions.find((option) => option.value === crewType) ?? crewOptions[0], [crewType])
  const formulaRows = Object.entries(result?.formula ?? {})
  const pricingRows = Object.entries(result?.pricing ?? {})
  const finalCost = result?.pricing?.final_cost
  const totalArea = result?.formula?.total_area

  if (!id) {
    return <ProjectDetailErrorState title="رابط المشروع غير صحيح" description="لم يتم العثور على رقم المشروع ضمن الرابط الحالي." />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id) return

    const formData = new FormData(event.currentTarget)
    setErrorMessage(null)
    setResult(null)
    setIsSubmitting(true)

    try {
      const { data } = await api.post<CrewCostResponse>(`/projects/${id}/${selectedCrew.endpoint}`, formData, {
        headers: {
          Accept: 'application/json',
        },
      })

      setResult(data.data)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-500 transition hover:text-[#50683f]">
          <ProjectDetailIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
          العودة إلى تفاصيل المشروع
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ProjectDetailIcon name="calculator" className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">حساب أجرة الورش</h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">اختر نوع الورشة، أدخل القيم المطلوبة، ثم اعرض التكلفة وتفاصيل الحساب.</p>
              </div>
            </div>

            {result?.project?.name ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                المشروع: <span className="text-slate-900">{result.project.name}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">نوع الورشة</h2>
             
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {crewOptions.map((option) => {
                  const isActive = option.value === crewType

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCrewType(option.value)
                        setResult(null)
                        setErrorMessage(null)
                      }}
                      className={`rounded-2xl border px-4 py-3 text-right text-sm font-extrabold transition ${
                        isActive
                          ? 'border-[#50683f] bg-[#50683f] text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedCrew.fields.map((field) => (
                  <label key={field.name} className="space-y-2">
                    <span className="block text-sm font-extrabold text-slate-800">{field.label}</span>
                    <input
                      name={field.name}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      defaultValue={field.defaultValue}
                      placeholder={field.helper}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm font-bold text-slate-900 outline-none transition focus:border-[#50683f] focus:ring-4 focus:ring-[#50683f]/10"
                    />
                  </label>
                ))}
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMessage}</div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#50683f] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#455a36] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'جاري الحساب...' : 'احسب أجرة الورشة'}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)] sm:p-6">
            {isSubmitting ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <LoadingState label="جاري حساب أجرة الورشة..." />
              </div>
            ) : result ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-extrabold text-slate-500">التكلفة النهائية</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatNumber(finalCost)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-extrabold text-slate-500">المساحة الإجمالية</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatNumber(totalArea)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">تفاصيل المعادلة</h2>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {formulaRows.map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 font-bold text-slate-600">{formulaLabels[key] ?? key}</td>
                            <td className="px-4 py-3 text-left font-extrabold text-slate-900" dir="ltr">{formatNumber(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">التسعير</h2>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {pricingRows.map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 font-bold text-slate-600">{pricingLabels[key] ?? key}</td>
                            <td className="px-4 py-3 text-left font-extrabold text-slate-900" dir="ltr">{formatNumber(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <div>
                  <ProjectDetailIcon name="calculator" className="mx-auto h-10 w-10 text-slate-400" />
                  <h2 className="mt-3 text-lg font-extrabold text-slate-900">النتيجة ستظهر هنا</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">بعد إدخال القيم والضغط على زر الحساب، سيتم عرض التكلفة النهائية وتفاصيل المساحات.</p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  )
}
