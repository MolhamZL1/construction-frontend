import { z } from 'zod'

export const loginSchema = z.object({
  accountType: z.enum(['company', 'internal']),
  email: z.string().trim().optional(),
  internal_id: z.string().trim().optional(),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل'),
}).superRefine((values, ctx) => {
  if (values.accountType === 'company') {
    const email = values.email ?? ''

    if (!email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'البريد الإلكتروني مطلوب',
      })
      return
    }

    if (!z.string().email().safeParse(email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'صيغة البريد الإلكتروني غير صحيحة',
      })
    }
  }

  if (values.accountType === 'internal' && !(values.internal_id ?? '').trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['internal_id'],
      message: 'المعرّف الداخلي مطلوب',
    })
  }
})

export type LoginSchema = z.infer<typeof loginSchema>
