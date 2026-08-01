import { Link } from 'react-router-dom'
import type { ProjectDocumentListItem } from '../models/document.model'
import { formatDocumentDate, getFileExtensionFromUrl, getLatestVersionLabel } from '../utils/documents-formatters'
import { DocumentIcon } from './DocumentIcon'

interface DocumentCardProps {
  projectId: string
  document: ProjectDocumentListItem
}

export function DocumentCard({ projectId, document }: DocumentCardProps) {
  const latestVersion = document.latestVersion
  const fileType = getFileExtensionFromUrl(latestVersion?.fileUrl ?? latestVersion?.filePath)
  const latestVersionLabel = getLatestVersionLabel(document)

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-[0_10px_28px_rgb(var(--color-brand-ink-rgb)/0.07)] transition hover:-translate-y-1 hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] hover:shadow-[0_18px_36px_rgb(var(--color-brand-ink-rgb)/0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--color-brand-gold-rgb)/0.1)] text-[var(--color-brand-ink)]">
          <DocumentIcon name="document" className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <Link to={`/projects/${projectId}/documents/${document.id}`} className="block transition hover:text-[var(--color-brand-ink)]">
            <h2 className="truncate text-lg font-black text-slate-900">{document.title}</h2>
          </Link>
          <p className="mt-1 text-sm font-extrabold text-slate-500">
            {fileType} <span className="mx-1 text-slate-300">•</span> {document.category}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>الإصدار الحالي:</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700" dir="ltr">
            {latestVersionLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <DocumentIcon name="calendar" className="h-5 w-5 text-slate-500" />
            {formatDocumentDate(latestVersion?.createdAt ?? document.updatedAt ?? document.createdAt)}
          </span>
          <span className="text-xs font-extrabold text-slate-400">{document.versionsCount} إصدار</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          to={`/projects/${projectId}/documents/${document.id}/versions/create`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-extrabold text-white transition hover:bg-cyan-600"
        >
          <DocumentIcon name="upload" className="h-5 w-5" />
          إصدار جديد
        </Link>

        <Link
          to={`/projects/${projectId}/documents/${document.id}`}
          className="inline-flex h-10 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-[rgb(var(--color-brand-gold-rgb)/0.3)] hover:bg-[rgb(var(--color-brand-gold-rgb)/0.1)] hover:text-[var(--color-brand-ink)]"
          aria-label="عرض تفاصيل المستند"
          title="عرض التفاصيل"
        >
          <DocumentIcon name="arrow" className="h-5 w-5" />
        </Link>
      </div>
    </article>
  )
}
