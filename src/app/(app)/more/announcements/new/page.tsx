import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import Greeting from '@/components/ui/Greeting'
import NewAnnouncementForm from '@/components/admin/NewAnnouncementForm'

export default async function NewAnnouncementPage() {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') redirect('/more/announcements')

  return (
    <>
      <Greeting>
        New <em>notice.</em>
      </Greeting>
      <NewAnnouncementForm />
    </>
  )
}
