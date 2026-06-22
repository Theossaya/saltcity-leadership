import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { formatShortDate, firstNameOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import StatusDot from '@/components/ui/StatusDot'

const audienceLabel = { all: 'everyone', leaders: 'company leaders', admins: 'admins' } as const

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  await requireAuth()
  const supabase = createClient()

  const { data: announcement } = await supabase
    .from('announcements')
    .select('id, title, body, priority, audience, published_at, publisher:profiles!announcements_published_by_fkey(full_name)')
    .eq('id', params.id)
    .maybeSingle()

  if (!announcement) notFound()

  return (
    <>
      <Greeting day={`${formatShortDate(announcement.published_at)} · ${audienceLabel[announcement.audience]}`}>
        Notice<em>.</em>
      </Greeting>

      <div className="px-5 pt-3">
        {announcement.priority === 'urgent' && (
          <div className="mb-2.5">
            <StatusDot tone="urgent">Urgent notice</StatusDot>
          </div>
        )}
        <h2 className="text-[20px] font-semibold text-ink tracking-[-0.02em] leading-[1.25] m-0">
          {announcement.title}
        </h2>
        <p className="text-[14.5px] text-ink-2 leading-[1.6] mt-3 whitespace-pre-line">
          {announcement.body}
        </p>
        {announcement.publisher && (
          <p className="text-[12.5px] text-ink-3 mt-4">
            Published by {firstNameOf(announcement.publisher.full_name)}
          </p>
        )}
      </div>
    </>
  )
}
