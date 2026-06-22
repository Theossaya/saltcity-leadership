import Link from 'next/link'

interface Props {
  lead?: React.ReactNode
  title: string
  sub?: React.ReactNode
  tail?: React.ReactNode
  dimmed?: boolean
  href?: string // makes the whole row a link
}

function RowInner({ lead, title, sub, tail }: Pick<Props, 'lead' | 'title' | 'sub' | 'tail'>) {
  return (
    <>
      {lead && <div className="flex-shrink-0">{lead}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-ink tracking-[-0.014em] leading-[1.3] truncate">
          {title}
        </div>
        {sub && (
          <div className="text-[12.5px] text-ink-3 mt-0.5 tracking-[-0.004em] flex items-center gap-1.5 flex-wrap leading-[1.35]">
            {sub}
          </div>
        )}
      </div>
      {tail && <div className="flex-shrink-0 flex items-center gap-2 text-ink-4 [&_svg]:w-[18px] [&_svg]:h-[18px]">{tail}</div>}
    </>
  )
}

export default function Row({ lead, title, sub, tail, dimmed, href }: Props) {
  const layout = 'flex gap-[13px] items-center py-[13px] min-h-[52px]'
  if (href) {
    return (
      <li className={dimmed ? 'opacity-50' : ''}>
        <Link
          href={href}
          className={`${layout} -mx-2 px-2 rounded-[10px] transition-colors active:bg-bg-2`}
        >
          <RowInner lead={lead} title={title} sub={sub} tail={tail} />
        </Link>
      </li>
    )
  }
  return (
    <li className={`${layout} ${dimmed ? 'opacity-50' : ''}`}>
      <RowInner lead={lead} title={title} sub={sub} tail={tail} />
    </li>
  )
}

// List wrapper — hairline separators, no boxed cards
export function RowList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={`mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)] ${className ?? ''}`}>
      {children}
    </ul>
  )
}
