interface Props {
  month: string // "Jun"
  day: string // "01"
  title: string
  meta?: string
  berry?: boolean
  tail?: React.ReactNode
}

export default function EventRow({ month, day, title, meta, berry, tail }: Props) {
  return (
    <li className="flex gap-[13px] items-center py-[13px]">
      <div
        className={`flex-shrink-0 w-12 text-center rounded-[12px] text-white pt-[7px] pb-[9px]
                    ${berry ? 'bg-primary' : 'bg-ink'}`}
      >
        <div className="text-[10px] font-semibold text-accent-soft uppercase tracking-normal">{month}</div>
        <div className="text-[21px] font-medium leading-none tracking-[-0.02em] mt-px">{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-medium text-ink tracking-[-0.012em] leading-[1.25]">{title}</div>
        {meta && <div className="text-[12px] text-ink-3 mt-0.5 tracking-[-0.004em]">{meta}</div>}
      </div>
      {tail && <div className="flex-shrink-0 flex items-center text-ink-4 [&_svg]:w-[18px] [&_svg]:h-[18px]">{tail}</div>}
    </li>
  )
}
