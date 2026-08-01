import type { AppNotification } from '../models/notification.model'
import type { NotificationVisualKind } from '../components/NotificationIcon'

interface NotificationPresentation {
  kind: NotificationVisualKind
  label: string
  iconClassName: string
}

export function getNotificationPresentation(notification: AppNotification): NotificationPresentation {
  const searchableType = `${notification.type} ${notification.data.action ?? ''}`.toLowerCase()

  if (searchableType.includes('progress') || searchableType.includes('update')) {
    return {
      kind: 'progress',
      label: 'تحديث إنجاز',
      iconClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    }
  }

  if (searchableType.includes('duration') || searchableType.includes('extension') || searchableType.includes('delay')) {
    return {
      kind: 'duration',
      label: 'تمديد وقت',
      iconClassName: 'bg-amber-50 text-amber-700 ring-amber-100',
    }
  }

  if (searchableType.includes('document') || searchableType.includes('contract')) {
    return {
      kind: 'document',
      label: 'وثيقة',
      iconClassName: 'bg-sky-50 text-sky-700 ring-sky-100',
    }
  }

  if (searchableType.includes('invoice') || searchableType.includes('expense') || searchableType.includes('payment')) {
    return {
      kind: 'invoice',
      label: 'مالي',
      iconClassName: 'bg-violet-50 text-violet-700 ring-violet-100',
    }
  }

  if (searchableType.includes('project')) {
    return {
      kind: 'project',
      label: 'مشروع',
      iconClassName: 'bg-[var(--color-brand-gold-surface)] text-[var(--color-brand-gold-deep)] ring-[var(--color-brand-gold-border)]',
    }
  }

  return {
    kind: 'general',
    label: 'إشعار',
    iconClassName: 'bg-[var(--color-brand-paper)] text-[var(--color-brand-ink)] ring-[var(--color-brand-border-soft)]',
  }
}
