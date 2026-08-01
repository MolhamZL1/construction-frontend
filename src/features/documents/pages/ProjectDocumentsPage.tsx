import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { DocumentsGrid } from '../components/DocumentsGrid'
import { DocumentsPageHeader } from '../components/DocumentsPageHeader'
import { DocumentIcon } from '../components/DocumentIcon'
import { getDocumentsErrorMessage, useProjectDocuments } from '../hooks/useDocuments'
import { documentMatchesSearch } from '../utils/documents-formatters'

export function ProjectDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const [search, setSearch] = useState('')

  const documentsQuery = useProjectDocuments(id)
  const documents = documentsQuery.data?.documents ?? []
  const projectName = documentsQuery.data?.project.name

  const filteredDocuments = useMemo(
    () => documents.filter((document) => documentMatchesSearch(document, search)),
    [documents, search]
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

        <DocumentsPageHeader
          projectId={id}
          projectName={projectName}
          search={search}
          onSearchChange={setSearch}
        />

        {documentsQuery.isLoading ? (
          <LoadingState label="جاري تحميل مستندات المشروع..." />
        ) : documentsQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-right shadow-sm">
            <div className="flex items-start justify-end gap-3">
              <div>
                <h2 className="text-lg font-black text-red-700">تعذر تحميل المستندات</h2>
                <p className="mt-1 text-sm font-bold text-red-600">
                  {getDocumentsErrorMessage(documentsQuery.error)}
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
            documents={filteredDocuments}
            isFiltering={Boolean(search.trim())}
          />
        )}
      </div>
    </section>
  )
}