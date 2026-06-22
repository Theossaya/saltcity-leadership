import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { todayString, formatEventDate, formatTime } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import EventRow from '@/components/ui/EventRow'

export default async function EventsPage() {
  const { profile } = await requireAuth()
  const supabase = createClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, event_time, location')
    .gte('event_date', todayString())
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
    .limit(20)

  const list = events ?? []

  return (
    <>
      <Greeting>Calendar.</Greeting>

      {profile.role === 'church_admin' && (
        <div className="px-5 pt-2">
          <Link href="/more/events/new" className="text-[13px] text-primary font-semibold">
            + New event
          </Link>
        </div>
      )}

      <SectionLabel label="Coming up" />
      {list.length > 0 ? (
        <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
          {list.map((e, i) => {
            const d = formatEventDate(e.event_date)
            return (
              <EventRow
                key={e.id}
                berry={i === 0}
                month={d.m}
                day={d.d}
                title={e.title}
                meta={[formatTime(e.event_time), e.location].filter(Boolean).join(' · ')}
              />
            )
          })}
        </ul>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Nothing on the calendar yet.</p>
      )}
    </>
  )
}
