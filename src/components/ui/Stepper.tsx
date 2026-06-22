'use client'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  label?: string
}

export default function Stepper({ value, onChange, min = 0, label = 'count' }: Props) {
  return (
    <div className="flex items-center gap-3 mx-5 px-4 py-1.5 bg-surface rounded-input shadow-lift">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Decrease ${label}`}
        className="w-[34px] h-[34px] my-1 rounded-[10px] bg-bg-2 text-ink text-[19px] leading-none
                   flex items-center justify-center"
      >
        −
      </button>
      <div
        className="flex-1 text-center text-[24px] font-medium tracking-[-0.022em] text-ink tabular-nums"
        aria-live="polite"
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label}`}
        className="w-[34px] h-[34px] my-1 rounded-[10px] bg-bg-2 text-ink text-[19px] leading-none
                   flex items-center justify-center"
      >
        +
      </button>
    </div>
  )
}
