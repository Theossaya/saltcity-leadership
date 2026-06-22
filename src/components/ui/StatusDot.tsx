const toneMap = {
  urgent: 'text-urgent before:bg-urgent',
  care: 'text-care before:bg-care',
  ok: 'text-ok before:bg-ok',
}

interface Props {
  tone?: 'urgent' | 'care' | 'ok'
  children: string
}

export default function StatusDot({ tone, children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium
                  before:content-[''] before:w-[7px] before:h-[7px]
                  before:rounded-full before:flex-shrink-0
                  ${tone ? toneMap[tone] : 'text-ink-3 before:bg-ink-3'}`}
    >
      {children}
    </span>
  )
}
