import { GreetingSkeleton, HeroSkeleton, RowSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <>
      <GreetingSkeleton />
      <HeroSkeleton />
      <div className="h-8" />
      <RowSkeleton count={3} />
    </>
  )
}
