import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { MaterialForm } from '../components/MaterialForm'
import { MaterialIcon } from '../components/MaterialIcon'
import { getMaterialsErrorMessage, useMaterial, useMaterialUnitOptions, useUpdateMaterial } from '../hooks/useMaterials'

export function EditMaterialPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const navigate = useNavigate()
  const materialQuery = useMaterial(materialId)
  const unitOptionsQuery = useMaterialUnitOptions()
  const updateMutation = useUpdateMaterial()

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="تعديل مادة" subtitle="عدّل الاسم أو وحدة القياس فقط حسب API الحالي." />

        {materialQuery.error ? <InlineError message={getMaterialsErrorMessage(materialQuery.error)} /> : null}
        {materialQuery.isLoading ? <LoadingState label="جاري تحميل بيانات المادة..." /> : null}

        {!materialQuery.isLoading && materialQuery.data ? (
          <MaterialForm
            mode="edit"
            initialMaterial={materialQuery.data}
            unitOptions={unitOptionsQuery.unitOptions}
            isSubmitting={updateMutation.isPending}
            errorMessage={updateMutation.error ? getMaterialsErrorMessage(updateMutation.error) : null}
            onSubmit={(input) => {
              if (!materialId) return

              updateMutation.mutate(
                { id: materialId, ...input },
                {
                  onSuccess: () => navigate('/materials'),
                }
              )
            }}
          />
        ) : null}
      </div>
    </section>
  )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgb(var(--color-brand-ink-rgb)/0.06)] md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>
      <Link to="/materials" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50">
        <MaterialIcon name="back" className="h-4 w-4" />
        العودة للمواد
      </Link>
    </header>
  )
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{message}</div>
}
