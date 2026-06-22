interface Props {
  day?: string
  children: React.ReactNode // MUST be JSX — never an HTML string
}

export default function Greeting({ day, children }: Props) {
  return (
    <div className="px-5 pt-2 pb-1">
      {day && <div className="text-[12px] text-ink-3 mb-1.5 tracking-[-0.004em]">{day}</div>}
      <h1
        className="text-[26px] font-medium leading-[1.08] tracking-[-0.026em] text-ink m-0
                   [&_em]:font-serif [&_em]:italic [&_em]:font-normal [&_em]:text-primary
                   [&_em]:tracking-[-0.01em] text-balance"
      >
        {children}
      </h1>
    </div>
  )
}
