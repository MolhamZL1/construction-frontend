import type { ProjectDocumentListItem } from '../models/document.model'
import { DocumentCard } from './DocumentCard'
import { DocumentIcon } from './DocumentIcon'

interface DocumentsGridProps {
  projectId: string
  documents: ProjectDocumentListItem[]
  isFiltering?: boolean
}

export function DocumentsGrid({ projectId, documents, isFiltering = false }: DocumentsGridProps) {
  if (!documents.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#50683f]/10 text-[#50683f]">
          <DocumentIcon name="document" className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-black text-slate-900">
          {isFiltering ? 'لا توجد نتائج مطابقة' : 'لا توجد مستندات بعد'}
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {isFiltering ? 'جرّب كلمة بحث مختلفة أو امسح البحث الحالي.' : 'ابدأ برفع أول مستند لهذا المشروع.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} projectId={projectId} document={document} />
      ))}
    </div>
  )
}
