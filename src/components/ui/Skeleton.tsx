interface Props {
  height?: number
  className?: string
}

export default function Skeleton({ height = 20, className }: Props) {
  return <div className={`sc-skel ${className ?? ''}`} style={{ height }} aria-hidden />
}

export function HeroSkeleton() {
  return <div className="mx-5 mt-[14px] rounded-card bg-primary/20 overflow-hidden" style={{ height: 160 }} />
}

export function RowSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="mx-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center py-[13px] border-t border-[var(--rule)] first:border-t-0">
          <Skeleton height={40} className="w-10 !rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton height={15} className="w-3/4" />
            <Skeleton height={12} className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GreetingSkeleton() {
  return (
    <div className="px-5 pt-2 pb-1 space-y-2">
      <Skeleton height={12} className="w-24" />
      <Skeleton height={28} className="w-44" />
    </div>
  )
}
