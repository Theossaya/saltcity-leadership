const sizeMap = {
  sm: 'w-[30px] h-[30px] text-[11px]',
  md: 'w-10 h-10 text-[13px]',
  lg: 'w-[46px] h-[46px] text-[15px]',
}
const ringMap = {
  urgent: 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--urgent)]',
  care: 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--care)]',
  ok: 'shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--ok)]',
}

interface Props {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  ring?: 'urgent' | 'care' | 'ok'
}

export default function Avatar({ initials, size = 'md', ring }: Props) {
  return (
    <div
      className={`rounded-full bg-bg-2 text-ink-2 font-semibold flex items-center
                  justify-center flex-shrink-0 ${sizeMap[size]} ${ring ? ringMap[ring] : ''}`}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}
