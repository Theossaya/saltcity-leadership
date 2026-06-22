import Skeleton, { GreetingSkeleton, RowSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <>
      <GreetingSkeleton />
      <div className="px-5 pt-4">
        <Skeleton height={180} className="!rounded-[18px]" />
      </div>
      <div className="h-6" />
      <RowSkeleton count={2} />
    </>
  )
}
