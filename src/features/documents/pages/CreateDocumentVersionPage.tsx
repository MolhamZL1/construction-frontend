import { useNavigate, useParams } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { DocumentFormShell } from '../components/DocumentFormShell'
import { DocumentUploadForm } from '../components/DocumentUploadForm'
import { getDocumentsErrorMessage, useProjectDocument, useUploadDocumentVersion } from '../hooks/useDocuments'

export function CreateDocumentVersionPage() {
  const { id, documentId } = useParams<{ id: string; documentId: string }>()
  const navigate = useNavigate()
  const documentQuery = useProjectDocument(documentId)
  const uploadVersionMutation = useUploadDocumentVersion()

  if (!id || !documentId) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المستند غير صحيح.
        </div>
      </section>
    )
  }

  if (documentQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl">
          <LoadingState label="جاري تحميل بيانات المستند..." />
        </div>
      </section>
    )
  }

  return (
    <DocumentFormShell
      title="رفع إصدار جديد"
      description={`أضف نسخة أحدث من ${documentQuery.data?.title ?? 'المستند'} مع حفظ سجل الإصدارات.`}
      breadcrumbs={[
        { label: 'المشاريع', to: '/projects' },
        { label: 'المستندات', to: `/projects/${id}/documents` },
        { label: documentQuery.data?.title ?? 'المستند', to: `/projects/${id}/documents/${documentId}` },
        { label: 'إصدار جديد' },
      ]}
    >
      {documentQuery.isError ? (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          {getDocumentsErrorMessage(documentQuery.error)}
        </div>
      ) : null}

      <DocumentUploadForm
        submitLabel="رفع الإصدار"
        cancelTo={`/projects/${id}/documents/${documentId}`}
        hideTitleFields
        customNameLabel="اسم الإصدار"
        customNamePlaceholder="مثال: تقرير-التربة-v2"
      isSubmitting={uploadVersionMutation.isPending}
        errorMessage={uploadVersionMutation.isError ? getDocumentsErrorMessage(uploadVersionMutation.error) : null}
        onSubmit={(values) => {
          uploadVersionMutation.mutate(
            {
              documentId,
              customName: values.customName,
              file: values.file,
            },
            {
              onSuccess: () => navigate(`/projects/${id}/documents/${documentId}`),
            }
          )
        }}
      />
    </DocumentFormShell>
  )
}
