import Skeleton, { GreetingSkeleton, RowSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <>
      <GreetingSkeleton />
      <div className="px-5 pt-3 flex gap-6">
        <Skeleton height={42} className="w-16" />
        <Skeleton height={42} className="w-16" />
        <Skeleton height={42} className="w-16" />
      </div>
      <div className="h-6" />
      <RowSkeleton count={4} />
    </>
  )
}
