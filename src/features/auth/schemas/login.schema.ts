import { AUTH_CONFIG } from '@/config/design-system'
import { z } from 'zod'

export function isProjectManagerIdentifier(value: string) {
  return value.trim().toLowerCase().startsWith(AUTH_CONFIG.projectManagerIdentifierPrefix)
}

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(1, 'البريد الإلكتروني أو المعرّف الداخلي مطلوب'),
    password: z
      .string()
      .min(1, 'كلمة المرور مطلوبة')
      .min(6, 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'),
  })
  .superRefine((values, ctx) => {
    if (isProjectManagerIdentifier(values.identifier)) return

    if (!z.string().email().safeParse(values.identifier).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['identifier'],
        message: 'صيغة البريد الإلكتروني غير صحيحة',
      })
    }
  })

export type LoginSchema = z.infer<typeof loginSchema>
