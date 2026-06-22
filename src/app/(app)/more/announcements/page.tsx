import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { formatShortDate } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Notice from '@/components/ui/Notice'
import { WarnIcon, ChevronIcon } from '@/components/ui/Icons'

const audienceLabel = { all: 'everyone', leaders: 'company leaders', admins: 'admins' } as const

export default async function AnnouncementsPage() {
  const { profile } = await requireAuth()
  const supabase = createClient()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, priority, audience, published_at')
    .eq('active', true)
    .order('published_at', { ascending: false })
    .limit(30)

  const list = announcements ?? []
  const urgent = list.find((a) => a.priority === 'urgent')
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const thisWeek = list.filter((a) => a.id !== urgent?.id && a.published_at >= weekAgo)
  const earlier = list.filter((a) => a.id !== urgent?.id && a.published_at < weekAgo)

  return (
    <>
      <Greeting>Notices.</Greeting>

      {profile.role === 'church_admin' && (
        <div className="px-5 pt-2">
          <Link href="/more/announcements/new" className="text-[13px] text-primary font-semibold">
            + New notice
          </Link>
        </div>
      )}

      {urgent && (
        <div className="mt-4">
          <Link href={`/more/announcements/${urgent.id}`} className="block">
            <Notice
              urgent
              icon={<WarnIcon />}
              title={urgent.title}
              meta={urgent.body.length > 64 ? `${urgent.body.slice(0, 64)}…` : urgent.body}
            />
          </Link>
        </div>
      )}

      <SectionLabel label="This week" />
      {thisWeek.length > 0 ? (
        <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
          {thisWeek.map((a) => (
            <li key={a.id}>
              <Link href={`/more/announcements/${a.id}`} className="flex items-start gap-[13px] py-[13px]">
                <div className="flex-1 min-w-0">
                  <div className="text-[15.5px] font-semibold text-ink tracking-[-0.014em] leading-[1.3]">
                    {a.title}
                  </div>
                  <div className="text-[12.5px] text-ink-3 mt-1 tracking-[-0.004em]">
                    {formatShortDate(a.published_at)} · {audienceLabel[a.audience]}
                  </div>
                </div>
                <div className="flex-shrink-0 text-ink-4 [&_svg]:w-[18px] [&_svg]:h-[18px]">
                  <ChevronIcon />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Nothing new this week.</p>
      )}

      {earlier.length > 0 && (
        <>
          <SectionLabel label="Earlier" />
          <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
            {earlier.map((a) => (
              <li key={a.id} className="opacity-70">
                <Link href={`/more/announcements/${a.id}`} className="flex items-center gap-[13px] py-[13px]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-ink tracking-[-0.014em] leading-[1.3] truncate">
                      {a.title}
                    </div>
                    <div className="text-[12.5px] text-ink-3 mt-0.5">{formatShortDate(a.published_at)}</div>
                  </div>
                  <div className="flex-shrink-0 text-ink-4 [&_svg]:w-[18px] [&_svg]:h-[18px]">
                    <ChevronIcon />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
