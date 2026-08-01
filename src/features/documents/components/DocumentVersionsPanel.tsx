import type { ProjectDocumentVersion } from '../models/document.model'
import { formatDocumentDate, getFileExtensionFromUrl } from '../utils/documents-formatters'
import { DocumentIcon } from './DocumentIcon'

interface DocumentVersionsPanelProps {
  versions: ProjectDocumentVersion[]
  downloadingVersionId?: string | null
  onDownload: (version: ProjectDocumentVersion) => void
}

export function DocumentVersionsPanel({ versions, downloadingVersionId, onDownload }: DocumentVersionsPanelProps) {
  if (!versions.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <DocumentIcon name="version" className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-900">لا توجد إصدارات بعد</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">عند رفع ملف جديد ستظهر الإصدارات هنا.</p>
      </div>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_12px_32px_rgb(var(--color-brand-ink-rgb)/0.07)] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{versions.length} إصدار</span>
        <div>
          <h2 className="text-2xl font-black text-slate-900">إصدارات المستند</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">كل الملفات المرفوعة لهذا المستند مرتبة من الأحدث للأقدم</p>
        </div>
      </div>

      <div className="space-y-3">
        {versions.map((version) => {
          const isDownloading = downloadingVersionId === version.id

          return (
            <div key={version.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-end gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-brand-ink)] shadow-sm">
                  <DocumentIcon name="document" className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="text-base font-black text-slate-900" dir="ltr">v{version.versionNo}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500">
                      {getFileExtensionFromUrl(version.fileUrl ?? version.filePath)}
                    </span>
                  </div>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <DocumentIcon name="calendar" className="h-4 w-4" />
                    {formatDocumentDate(version.createdAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDownload(version)}
                disabled={isDownloading || !version.id}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 text-sm font-extrabold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <DocumentIcon name="download" className="h-5 w-5" />
                {isDownloading ? 'جاري التحميل...' : 'تحميل'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
