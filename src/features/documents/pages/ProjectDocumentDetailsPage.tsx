import { Link, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { DocumentIcon } from '../components/DocumentIcon'
import { DocumentVersionsPanel } from '../components/DocumentVersionsPanel'
import { getDocumentsErrorMessage, useDownloadDocumentVersion, useProjectDocument } from '../hooks/useDocuments'
import { formatDocumentDate, getFileExtensionFromUrl } from '../utils/documents-formatters'

export function ProjectDocumentDetailsPage() {
  const { id, documentId } = useParams<{ id: string; documentId: string }>()
  const documentQuery = useProjectDocument(documentId)
  const downloadMutation = useDownloadDocumentVersion()
  const document = documentQuery.data
  const downloadingVersionId = downloadMutation.isPending ? downloadMutation.variables?.id ?? null : null

  if (!id || !documentId) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المستند غير صحيح.
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-slate-500">
          <Link to="/projects" className="transition hover:text-[#50683f]">المشاريع</Link>
          <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />
          <Link to={`/projects/${id}/documents`} className="transition hover:text-[#50683f]">المستندات</Link>
          <DocumentIcon name="arrow" className="h-4 w-4 rotate-180" />
          <span className="text-slate-800">تفاصيل المستند</span>
        </nav>

        {documentQuery.isLoading ? (
          <LoadingState label="جاري تحميل تفاصيل المستند..." />
        ) : documentQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-right shadow-sm">
            <h1 className="text-xl font-black text-red-700">تعذر تحميل المستند</h1>
            <p className="mt-2 text-sm font-bold text-red-600">{getDocumentsErrorMessage(documentQuery.error)}</p>
          </div>
        ) : document ? (
          <>
            <header className="rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-[0_14px_40px_rgba(15,23,42,0.07)] md:p-8">
              <div className="flex flex-col-reverse gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-wrap justify-start gap-2">
                  <Link
                    to={`/projects/${id}/documents/${document.id}/versions/create`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-extrabold text-white transition hover:bg-cyan-600"
                  >
                    <DocumentIcon name="upload" className="h-5 w-5" />
                    إصدار جديد
                  </Link>
                  <Link
                    to={`/projects/${id}/documents`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
                  >
                    العودة
                  </Link>
                </div>

                <div className="flex items-start justify-end gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 md:text-4xl">{document.title}</h1>
                    <p className="mt-2 text-sm font-semibold text-slate-500">{document.category}</p>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-[#50683f]/10 text-[#50683f]">
                    <DocumentIcon name="document" className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-right">
                  <p className="text-xs font-black text-slate-400">الإصدارات</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{document.versionsCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-right">
                  <p className="text-xs font-black text-slate-400">آخر إصدار</p>
                  <p className="mt-2 text-2xl font-black text-slate-900" dir="ltr">v{document.latestVersion?.versionNo ?? '—'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-right">
                  <p className="text-xs font-black text-slate-400">آخر تحديث</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{formatDocumentDate(document.latestVersion?.createdAt ?? document.updatedAt)}</p>
                </div>
              </div>

              {document.latestVersion ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
                    <DocumentIcon name="file" className="h-5 w-5 text-[#50683f]" />
                    الملف الحالي: {getFileExtensionFromUrl(document.latestVersion.fileUrl ?? document.latestVersion.filePath)}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.latestVersion && downloadMutation.mutate(document.latestVersion)}
                    disabled={downloadingVersionId === document.latestVersion.id}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-extrabold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <DocumentIcon name="download" className="h-5 w-5" />
                    {downloadingVersionId === document.latestVersion.id ? 'جاري التحميل...' : 'تحميل آخر إصدار'}
                  </button>
                </div>
              ) : null}
            </header>

            <DocumentVersionsPanel
              versions={document.versions}
              downloadingVersionId={downloadingVersionId}
              onDownload={(version) => downloadMutation.mutate(version)}
            />

            {downloadMutation.isError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {getDocumentsErrorMessage(downloadMutation.error)}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
