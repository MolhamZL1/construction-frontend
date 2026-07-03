import { useState, type FormEvent } from 'react'
import { getWorkItemsErrorMessage, useAddWorkItemComment, useWorkItemComments } from '../hooks/useWorkItems'
import type { WorkItem } from '../models/work-item.model'
import { formatWorkItemDate } from '../utils/work-items-formatters'
import { WorkItemIcon } from './WorkItemIcon'

interface WorkItemCommentsSectionProps {
  projectId: string
  item: WorkItem
}

export function WorkItemCommentsSection({ projectId, item }: WorkItemCommentsSectionProps) {
  const [body, setBody] = useState('')
  const commentsQuery = useWorkItemComments(projectId, item.id)
  const addCommentMutation = useAddWorkItemComment()
  const comments = commentsQuery.data ?? item.comments ?? []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!body.trim()) return

    addCommentMutation.mutate(
      { workItemId: item.id, body: body.trim() },
      { onSuccess: () => setBody('') }
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <WorkItemIcon name="comment" className="h-5 w-5 text-[#50683f]" />
        <h2 className="text-xl font-black text-slate-900">تعليقات البند</h2>
      </div>

      {commentsQuery.error ? (
        <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          واجهة عرض التعليقات غير متاحة حالياً: {getWorkItemsErrorMessage(commentsQuery.error)}
        </div>
      ) : null}

      {addCommentMutation.error ? (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{getWorkItemsErrorMessage(addCommentMutation.error)}</div>
      ) : null}

      <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-3 md:flex-row">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="أضف تعليقاً على البند..."
          rows={3}
          className="min-h-[90px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#50683f] focus:ring-2 focus:ring-[#50683f]/10"
        />
        <button
          type="submit"
          disabled={!body.trim() || addCommentMutation.isPending}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#50683f] px-5 text-sm font-black text-white transition hover:bg-[#435834] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 md:self-end"
        >
          {addCommentMutation.isPending ? 'جاري الإضافة...' : 'إضافة تعليق'}
        </button>
      </form>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-black text-slate-800">{comment.user?.name ?? 'مستخدم'}</p>
                <p className="text-xs font-bold text-slate-400">{formatWorkItemDate(comment.createdAt)}</p>
              </div>
              <p className="text-sm font-semibold leading-6 text-slate-600">{comment.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm font-bold text-slate-500">لا توجد تعليقات بعد.</div>
      )}
    </section>
  )
}
