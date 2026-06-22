interface Props {
  icon: React.ReactNode
  title: string
  meta?: React.ReactNode
  tail?: React.ReactNode
  urgent?: boolean
}

export default function Notice({ icon, title, meta, tail, urgent }: Props) {
  return (
    <div
      className={`flex gap-3 items-start px-[15px] py-3.5 rounded-card mx-5
                  ${urgent ? 'bg-urgent text-white shadow-[0_16px_36px_-22px_rgba(178,58,72,0.5)]' : 'bg-surface shadow-lift'}`}
    >
      <div
        className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0
                    [&_svg]:w-[17px] [&_svg]:h-[17px]
                    ${urgent ? 'bg-white/[0.18] text-white' : 'bg-bg-2 text-ink-2'}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold tracking-[-0.012em] leading-[1.25]">{title}</div>
        {meta && (
          <div className={`text-[12px] mt-0.5 ${urgent ? 'text-white/85' : 'text-ink-3'}`}>{meta}</div>
        )}
      </div>
      {tail && <div className="flex-shrink-0">{tail}</div>}
    </div>
  )
}
