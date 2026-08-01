import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState, SearchInput } from '@/components/ui'
import { DocumentsGrid } from '../components/DocumentsGrid'
import { DocumentIcon } from '../components/DocumentIcon'
import { getDocumentsErrorMessage, useProjectContracts } from '../hooks/useDocuments'
import { documentMatchesSearch } from '../utils/documents-formatters'

export function ProjectContractsPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')
  const contractsQuery = useProjectContracts(id)
  const contracts = contractsQuery.data?.documents ?? []
  const projectName = contractsQuery.data?.project.name

  const filteredContracts = useMemo(
    () => contracts.filter((contract) => documentMatchesSearch(contract, search)),
    [contracts, search]
  )

  if (!id) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المشروع غير صحيح.
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-start">
          <Link
            to={`/projects/${id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 hover:text-[var(--color-brand-ink)] active:scale-[0.98]"
          >
            <DocumentIcon name="arrow" className="h-5 w-5 rtl:rotate-180" />
            العودة إلى تفاصيل المشروع
          </Link>
        </div>

        <header className="overflow-hidden rounded-3xl border border-emerald-100 bg-white text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)]">
          <div className="bg-gradient-to-l from-emerald-50 via-white to-white p-5 sm:p-6 md:p-7">
            <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 md:max-w-2xl">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                  <Link to="/projects" className="transition hover:text-[var(--color-brand-ink)]">
                    المشاريع
                  </Link>
                  <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />
                  <Link
                    to={`/projects/${id}`}
                    className="max-w-[220px] truncate transition hover:text-[var(--color-brand-ink)]"
                  >
                    {projectName ?? 'تفاصيل المشروع'}
                  </Link>
                  <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />
                  <span className="text-slate-700">العقود</span>
                </div>

                <div className="flex items-start justify-end gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">
                      عقود المشروع
                    </h1>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 sm:text-base">
                      صفحة مستقلة لعرض عقود المشروع وإصداراتها بعيداً عن باقي المستندات.
                    </p>
                  </div>
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)] sm:flex">
                    <DocumentIcon name="document" className="h-7 w-7" />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-start md:pt-1">
                <Link
                  to={`/projects/${id}/documents/create?type=contract`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand-ink)] px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] active:scale-[0.98] sm:h-12"
                >
                  <DocumentIcon name="plus" className="h-5 w-5" />
                  رفع عقد
                </Link>
              </div>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="البحث في العقود..."
              className="h-12 rounded-2xl bg-white lg:max-w-2xl"
            />
          </div>
        </header>

        {contractsQuery.isLoading ? (
          <LoadingState label="جاري تحميل عقود المشروع..." />
        ) : contractsQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-right shadow-sm">
            <div className="flex items-start justify-end gap-3">
              <div>
                <h2 className="text-lg font-black text-red-700">تعذر تحميل العقود</h2>
                <p className="mt-1 text-sm font-bold text-red-600">
                  {getDocumentsErrorMessage(contractsQuery.error)}
                </p>
              </div>

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                <DocumentIcon name="document" className="h-6 w-6" />
              </span>
            </div>
          </div>
        ) : (
          <DocumentsGrid
            projectId={id}
            documents={filteredContracts}
            isFiltering={Boolean(search.trim())}
            emptyTitle="لا توجد عقود بعد"
            emptyDescription="ارفع أول عقد للمشروع ليظهر هنا مع سجل الإصدارات."
          />
        )}
      </div>
    </section>
  )
}
