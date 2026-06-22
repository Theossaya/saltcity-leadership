import { GreetingSkeleton, RowSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <>
      <GreetingSkeleton />
      <div className="h-4" />
      <RowSkeleton count={4} />
    </>
  )
}
