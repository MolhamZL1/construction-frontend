import type { Project } from '../../models/project.model'

type LifecycleAction = 'start' | 'complete'

interface ProjectLifecycleActionsProps {
  project: Project
  isPending?: boolean
  onActionClick: (action: LifecycleAction) => void
}

export function ProjectLifecycleActions({ project, isPending = false, onActionClick }: ProjectLifecycleActionsProps) {
  if (project.status === 'planned') {
    return (
      <button
        type="button"
        onClick={() => onActionClick('start')}
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-brand-ink)] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
      >
        <PlayIcon />
        {isPending ? 'جاري التنفيذ...' : 'بدء المشروع'}
      </button>
    )
  }

  if (project.status === 'ongoing') {
    return (
      <button
        type="button"
        onClick={() => onActionClick('complete')}
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
      >
        <CheckIcon />
        {isPending ? 'جاري التنفيذ...' : 'إنهاء المشروع'}
      </button>
    )
  }

  return null
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 5v14l11-7-11-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
