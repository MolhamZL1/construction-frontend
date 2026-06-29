import { Link, useNavigate } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { MaterialForm } from '../components/MaterialForm'
import { MaterialIcon } from '../components/MaterialIcon'
import { getMaterialsErrorMessage, useCreateMaterial, useMaterialUnitOptions } from '../hooks/useMaterials'

export function CreateMaterialPage() {
  const navigate = useNavigate()
  const createMutation = useCreateMaterial()
  const unitOptionsQuery = useMaterialUnitOptions()

  return (
    <section className="min-h-screen bg-white px-5 py-7 text-right sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader title="إضافة مادة جديدة" subtitle="أدخل بيانات المادة حسب الحقول المتاحة في API الحالي." />

        {unitOptionsQuery.isLoading ? <LoadingState label="جاري تجهيز وحدات القياس..." compact /> : null}

        <MaterialForm
          mode="create"
          unitOptions={unitOptionsQuery.unitOptions}
          isSubmitting={createMutation.isPending}
          errorMessage={createMutation.error ? getMaterialsErrorMessage(createMutation.error) : null}
          onSubmit={(input) => {
            createMutation.mutate(input, {
              onSuccess: () => navigate('/materials'),
            })
          }}
        />
      </div>
    </section>
  )
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
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
