interface Bar {
  label: string
  value: number
  display?: string // text shown above the bar (defaults to value)
  muted?: boolean // render faded (e.g. a week with no reports)
}

interface Props {
  bars: Bar[]
  max?: number // scale ceiling; defaults to the largest value (min 1)
  height?: number
}

// Tiny dependency-free bar chart built from divs, styled with the design tokens.
export default function BarChart({ bars, max, height = 120 }: Props) {
  const ceiling = Math.max(max ?? 0, ...bars.map((b) => b.value), 1)
  return (
    <div className="mx-5">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {bars.map((b, i) => {
          const pct = Math.round((b.value / ceiling) * 100)
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full">
              <div className="text-[10px] text-ink-3 tabular-nums leading-none">{b.display ?? b.value}</div>
              <div className="w-full flex-1 bg-bg-2 rounded-[4px] relative overflow-hidden">
                <div
                  className={`absolute bottom-0 inset-x-0 rounded-[4px] ${b.muted ? 'bg-ink-4' : 'bg-primary'}`}
                  style={{ height: `${Math.max(pct, b.value > 0 ? 4 : 0)}%` }}
                />
              </div>
              <div className="text-[10px] text-ink-3 truncate max-w-full leading-none">{b.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
