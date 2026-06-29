import { useNavigate, useParams } from 'react-router-dom'
import { DocumentFormShell } from '../components/DocumentFormShell'
import { DocumentUploadForm } from '../components/DocumentUploadForm'
import { getDocumentsErrorMessage, useUploadProjectDocument } from '../hooks/useDocuments'

export function CreateProjectDocumentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const uploadDocumentMutation = useUploadProjectDocument()

  if (!id) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-5 py-7 sm:px-8 lg:px-10" dir="rtl">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-red-50 p-6 text-right text-red-700">
          رابط المشروع غير صحيح.
        </div>
      </section>
    )
  }

  return (
    <DocumentFormShell
      title="رفع مستند جديد"
      description="أضف مستنداً للمشروع مع أول إصدار له، وسيتم استخدام عنوان المستند كاسم الملف داخل النظام تلقائياً."
      breadcrumbs={[
        { label: 'المشاريع', to: '/projects' },
        { label: 'المستندات', to: `/projects/${id}/documents` },
        { label: 'رفع مستند' },
      ]}
    >
      <DocumentUploadForm
        submitLabel="رفع المستند"
        cancelTo={`/projects/${id}/documents`}
        hideCustomNameField
        isSubmitting={uploadDocumentMutation.isPending}
        errorMessage={uploadDocumentMutation.isError ? getDocumentsErrorMessage(uploadDocumentMutation.error) : null}
        onSubmit={(values) => {
          uploadDocumentMutation.mutate(
            {
              projectId: id,
              title: values.title ?? '',
              category: values.category ?? '',
              customName: values.customName,
              file: values.file,
            },
            {
              onSuccess: () => navigate(`/projects/${id}/documents`),
            }
          )
        }}
      />
    </DocumentFormShell>
  )
}
