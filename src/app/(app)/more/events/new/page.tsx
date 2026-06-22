import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import Greeting from '@/components/ui/Greeting'
import NewEventForm from '@/components/admin/NewEventForm'

export default async function NewEventPage() {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') redirect('/more/events')

  return (
    <>
      <Greeting>
        New <em>event.</em>
      </Greeting>
      <NewEventForm />
    </>
  )
}
