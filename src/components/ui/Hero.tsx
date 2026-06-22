interface Props {
  label?: string
  title?: React.ReactNode // may include <em> for the serif italic accent
  meta?: React.ReactNode
  progress?: number // 0 to 1
  actions?: React.ReactNode // max 2 buttons
  children?: React.ReactNode // custom hero body (e.g. stats row)
}

export default function Hero({ label, title, meta, progress, actions, children }: Props) {
  return (
    <div
      className="mx-5 mt-[14px] rounded-card bg-primary text-primary-ink relative overflow-hidden"
      style={{ boxShadow: 'var(--shadow-hero)' }}
    >
      {/* Coral glow */}
      <div className="absolute -right-10 -top-10 w-[170px] h-[170px] rounded-full bg-accent opacity-30 blur-[26px] z-0 pointer-events-none" />
      <div className="relative z-10 px-5 pt-5 pb-[18px]">
        {label && (
          <div className="text-[12px] text-primary-soft font-medium mb-2 tracking-[-0.004em]">{label}</div>
        )}
        {title && (
          <div
            className="text-[20px] font-medium leading-[1.15] tracking-[-0.02em] text-primary-ink
                       text-balance [&_em]:font-serif [&_em]:italic [&_em]:font-normal
                       [&_em]:text-accent-soft"
          >
            {title}
          </div>
        )}
        {children}
        {meta && (
          <div className="text-[12.5px] text-primary-soft mt-3 tracking-[-0.004em] [&_b]:text-primary-ink [&_b]:font-semibold">
            {meta}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3 h-[5px] bg-white/20 rounded-pill overflow-hidden">
            <div
              className="h-full bg-accent-soft rounded-pill transition-[width] duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        {actions && <div className="flex gap-2 mt-4">{actions}</div>}
      </div>
    </div>
  )
}
