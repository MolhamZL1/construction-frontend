import { formatArabicDate } from '../utils/formatArabicDate'
import { LoadingState } from '@/components/ui'
import type { UserActivity } from '../types/user.types'

interface UserActivitiesSectionProps {
  activities: UserActivity[]
  isLoading: boolean
  errorMessage?: string
}

const actionLabels: Record<string, string> = {
  Create: 'إنشاء',
  Update: 'تعديل',
  Delete: 'حذف',
  Login: 'تسجيل دخول',
}

export function UserActivitiesSection({ activities, isLoading, errorMessage }: UserActivitiesSectionProps) {
  const sortedActivities = [...activities].sort((first, second) => {
    const firstTime = first.created_at ? new Date(first.created_at).getTime() : 0
    const secondTime = second.created_at ? new Date(second.created_at).getTime() : 0
    return secondTime - firstTime
  })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white text-right shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">آخر النشاطات</h2>
      </div>

      <div className="p-5">
        {isLoading ? <LoadingState label="جاري تحميل نشاطات المستخدم..." compact className="border-dashed shadow-none" /> : null}
        {errorMessage ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && sortedActivities.length === 0 ? <p className="text-sm text-slate-500">لا توجد نشاطات مسجلة لهذا المستخدم</p> : null}
        {!isLoading && sortedActivities.length > 0 ? (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => (
              <article key={`${activity.created_at ?? 'activity'}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-950">{translateAction(activity.action)}</span>
                  {activity.method ? <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{activity.method}</span> : null}
                </div>
                <p className="mt-3 break-all text-sm text-slate-700" dir="ltr">{activity.endpoint ?? '—'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{activity.description ?? '—'}</p>
                <p className="mt-3 text-xs text-slate-400">{formatArabicDate(activity.created_at)}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function translateAction(action?: string) {
  if (!action) {
    return '—'
  }

  return actionLabels[action] ?? action
}
