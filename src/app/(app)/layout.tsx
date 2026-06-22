import { requireAuth } from '@/lib/auth'
import { firstNameOf } from '@/lib/utils'
import AppHeader from '@/components/ui/AppHeader'
import BottomNav from '@/components/ui/BottomNav'

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAuth()

  return (
    <div className="relative flex flex-col h-[100dvh] bg-bg overflow-hidden max-w-[430px] mx-auto">
      <AppHeader role={profile.role} name={firstNameOf(profile.full_name)} />
      <main className="sc-scroll flex-1 overflow-y-auto overflow-x-hidden pb-[92px] [-webkit-overflow-scrolling:touch]">
        {children}
        <div className="h-6" />
      </main>
      <BottomNav />
    </div>
  )
}
