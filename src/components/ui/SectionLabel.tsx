import Link from 'next/link'

interface Props {
  label: string
  action?: string
  href?: string
}

export default function SectionLabel({ label, action, href }: Props) {
  return (
    <div className="px-5 pt-[22px] pb-2 flex justify-between items-baseline gap-2.5">
      <h3 className="text-[12px] font-semibold text-ink-3 m-0 tracking-[-0.004em]">{label}</h3>
      {action &&
        (href ? (
          <Link href={href} className="text-[12px] text-primary font-semibold tracking-[-0.004em]">
            {action}
          </Link>
        ) : (
          <span className="text-[12px] text-primary font-semibold tracking-[-0.004em]">{action}</span>
        ))}
    </div>
  )
}
