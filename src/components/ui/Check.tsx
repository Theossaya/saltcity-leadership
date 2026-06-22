interface Props {
  done: boolean
  onToggle?: () => void
  label?: string
}

export default function Check({ done, onToggle, label }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      className={`w-[22px] h-[22px] flex-shrink-0 rounded-full inline-flex items-center justify-center
                  transition-all duration-100 relative
                  before:content-[''] before:absolute before:-inset-[11px]
                  ${done
                    ? "bg-calm border border-calm after:content-[''] after:w-2.5 after:h-[5px] after:border-l-[1.6px] after:border-b-[1.6px] after:border-white after:-rotate-45 after:-translate-y-px"
                    : 'bg-transparent border-[1.5px] border-[var(--rule-strong)]'}`}
    />
  )
}
