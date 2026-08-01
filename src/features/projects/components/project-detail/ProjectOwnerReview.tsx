import type { ProjectReview } from '../../api/project-reviews.api'

interface ProjectOwnerReviewProps {
  review: ProjectReview | null
  isLoading: boolean
}

export function ProjectOwnerReview({ review, isLoading }: ProjectOwnerReviewProps) {
  if (isLoading) {
    return <ProjectOwnerReviewShimmer />
  }

  if (!review) {
    return (
      <section className="mt-4 inline-flex w-fit max-w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 align-top">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm">
          <StarIcon filled={false} className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-700">تقييم المالك</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">لم يُقيّم المشروع بعد</p>
        </div>
      </section>
    )
  }

  const roundedRating = Math.round(review.rating)
  const displayRating = Number.isInteger(review.rating) ? String(review.rating) : review.rating.toFixed(1)

  return (
    <section className="mt-4 inline-block w-fit max-w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 align-top sm:max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <StarIcon filled className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-800">تقييم المالك</p>
            {review.ownerName ? (
              <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{review.ownerName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2" aria-label={`تقييم المالك ${displayRating} من 5`}>
          <div className="flex items-center gap-0.5" dir="ltr">
            {Array.from({ length: 5 }, (_, index) => (
              <StarIcon key={index} filled={index < roundedRating} className="h-4 w-4" />
            ))}
          </div>

          <span className="text-xs font-black text-slate-700" dir="ltr">
            {displayRating}/5
          </span>
        </div>
      </div>

      {review.note ? (
        <p className="mt-2.5 whitespace-pre-wrap break-words border-t border-slate-200/80 pt-2.5 text-xs font-semibold leading-6 text-slate-600">
          {review.note}
        </p>
      ) : null}
    </section>
  )
}

function ProjectOwnerReviewShimmer() {
  return (
    <section
      className="project-review-shimmer relative mt-4 inline-block w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 align-top"
      aria-label="جاري تحميل تقييم المالك"
      aria-busy="true"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-slate-200/80" />
          <div className="space-y-1.5">
            <span className="block h-2.5 w-20 rounded-full bg-slate-200/80" />
            <span className="block h-2 w-14 rounded-full bg-slate-200/70" />
          </div>
        </div>

        <span className="h-3 w-24 rounded-full bg-slate-200/80" />
      </div>

      <span className="mt-3 block h-2.5 w-2/3 rounded-full bg-slate-200/70" />
    </section>
  )
}

function StarIcon({ filled, className }: { filled: boolean; className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${filled ? 'text-amber-400' : 'text-slate-200'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="m12 2.8 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17l-5.56 2.92 1.06-6.2L3 9.33l6.22-.9L12 2.8Z" strokeLinejoin="round" />
    </svg>
  )
}
