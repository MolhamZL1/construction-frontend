import authImage from '@/assets/auth.jpg'
import { BrandLockup } from '@/components/brand/BrandLockup'

export function AuthHeroPanel() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[var(--color-brand-ink)]">
      <img
        src={authImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-[0.2] grayscale"
      />
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgb(var(--color-brand-ink-deep-rgb)/0.98),rgb(var(--color-brand-ink-rgb)/0.84))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgb(var(--color-brand-gold-rgb)/0.14),transparent_28rem)]" />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--color-brand-gold-rgb)/.34) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-brand-gold-rgb)/.34) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-12 py-16" dir="rtl">
        <div className="w-full max-w-xl text-center">
          <BrandLockup
            tone="reversed"
            orientation="stacked"
            className="mx-auto"
            markClassName="h-[92px] w-[92px] xl:h-[104px] xl:w-[104px]"
            wordmarkClassName="w-[172px] xl:w-[194px]"
          />

          <div className="mx-auto mt-9 h-px w-24 bg-[linear-gradient(90deg,transparent,rgb(var(--color-brand-gold-rgb)/0.9),transparent)]" />

          <h2 className="mt-8 text-2xl font-extrabold text-[var(--color-brand-paper)] xl:text-[30px]">
            منصة إدارة مشاريع الإكساء
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base font-medium leading-8 text-[rgb(var(--color-brand-paper-rgb)/0.68)]">
            متابعة المشاريع والميزانية والورش والإنجاز ضمن مساحة عمل واحدة واضحة ومتكاملة.
          </p>

          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3 text-center">
            {['إدارة أدق', 'متابعة أسرع', 'قرار أوضح'].map((label) => (
              <span
                key={label}
                className="rounded-2xl border border-[rgb(var(--color-brand-paper-rgb)/0.11)] bg-[rgb(var(--color-brand-paper-rgb)/0.055)] px-3 py-3 text-xs font-bold text-[rgb(var(--color-brand-paper-rgb)/0.74)] backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
