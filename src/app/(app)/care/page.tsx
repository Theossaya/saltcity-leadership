import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice, type Profile } from '@/lib/auth'
import { initialsOf, firstNameOf, formatShortDate, formatAge } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import { ChevronIcon, PhoneIcon } from '@/components/ui/Icons'

export default async function CarePage() {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) ? <AdminAbsentees /> : <LeaderCare profile={profile} />
}

// ===== Leader: your company's absentees =====

async function LeaderCare({ profile }: { profile: Profile }) {
  const supabase = createClient()

  const { data: cases } = await supabase
    .from('follow_up_cases')
    .select('id, urgency, status, escalated, context_note, created_at, member:members(full_name, phone)')
    .eq('assigned_to', profile.id)
    .in('status', ['new', 'assigned', 'active'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true })

  const list = cases ?? []
  const [primary, ...rest] = list

  if (!primary) {
    return (
      <>
        <Greeting day="Nobody to follow up">All <em>here.</em></Greeting>
        <p className="mx-5 mt-3 text-[14px] text-ink-2 leading-[1.5]">
          No one from your company is being followed up right now. When you mark someone absent in a
          report, they show up here for you to reach out.
        </p>
      </>
    )
  }

  const primaryPhone = primary.member?.phone ?? null

  return (
    <>
      <Greeting day={`${list.length} to follow up`}>
        Your company&rsquo;s <em>care.</em>
      </Greeting>

      <div className="px-5 pt-4">
        <div className="bg-surface rounded-card p-[18px] shadow-lift">
          <div className="flex gap-3 items-center mb-3.5">
            <Avatar
              initials={initialsOf(primary.member?.full_name ?? '?')}
              size="lg"
              ring={primary.urgency === 'urgent' ? 'urgent' : 'care'}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-semibold text-ink tracking-[-0.018em]">
                {primary.member?.full_name ?? 'Member'}
              </div>
              <div className="mt-0.5">
                {primary.urgency === 'urgent' ? (
                  <StatusDot tone="urgent">{`Needs attention · since ${formatShortDate(primary.created_at)}`}</StatusDot>
                ) : (
                  <StatusDot tone="care">{`Absent · opened ${formatAge(primary.created_at)}`}</StatusDot>
                )}
              </div>
            </div>
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone}`}
                aria-label="Call"
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px]
                           bg-calm-soft text-calm text-[12.5px] font-semibold active:scale-95 transition-transform
                           [&_svg]:w-4 [&_svg]:h-4"
              >
                <PhoneIcon />
                Call
              </a>
            )}
          </div>
          {primary.context_note && (
            <div className="px-3.5 py-3 bg-bg-2 rounded-[12px] text-[13px] text-ink-2 leading-[1.5] mb-3.5 whitespace-pre-line">
              {primary.context_note}
            </div>
          )}
          <Link href={`/care/${primary.id}`} className="block">
            <Button variant="berry" size="lg" full>
              Open &amp; record contact
            </Button>
          </Link>
        </div>
      </div>

      {rest.length > 0 && (
        <>
          <SectionLabel label="Also to follow up" />
          <RowList>
            {rest.map((c) => (
              <Row
                key={c.id}
                href={`/care/${c.id}`}
                lead={
                  <Avatar
                    initials={initialsOf(c.member?.full_name ?? '?')}
                    ring={c.urgency === 'urgent' ? 'urgent' : 'care'}
                  />
                }
                title={c.member?.full_name ?? 'Member'}
                sub={
                  c.urgency === 'urgent' ? (
                    <StatusDot tone="urgent">{`Needs attention · ${formatShortDate(c.created_at)}`}</StatusDot>
                  ) : (
                    `Absent · ${formatAge(c.created_at)}`
                  )
                }
                tail={<ChevronIcon />}
              />
            ))}
          </RowList>
        </>
      )}
    </>
  )
}

// ===== Admin / Office: all absentees across companies, with phone =====

async function AdminAbsentees() {
  const supabase = createClient()

  const { data: cases } = await supabase
    .from('follow_up_cases')
    .select(
      'id, urgency, status, escalated, context_note, created_at, member:members(full_name, phone), company:companies(name), assignee:profiles!follow_up_cases_assigned_to_fkey(full_name), report:weekly_reports(week_start)'
    )
    .in('status', ['new', 'assigned', 'active'])
    .order('escalated', { ascending: false })
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true })

  const items: AbsenteeItem[] = (cases ?? []).map((c) => ({
    id: c.id,
    escalated: c.escalated,
    urgent: c.urgency === 'urgent',
    note: c.context_note,
    name: c.member?.full_name ?? 'Member',
    phone: c.member?.phone ?? null,
    company: c.company?.name ?? 'Company',
    leader: c.assignee ? firstNameOf(c.assignee.full_name) : 'Unassigned',
    date: c.report?.week_start ? formatShortDate(c.report.week_start) : formatShortDate(c.created_at),
  }))
  const escalated = items.filter((c) => c.escalated)
  const rest = items.filter((c) => !c.escalated)

  return (
    <>
      <Greeting day={`${items.length} to follow up`}>
        Absentee <em>list.</em>
      </Greeting>

      {escalated.length > 0 && (
        <>
          <SectionLabel label="A leader asked for help" action={String(escalated.length)} />
          <AbsenteeList items={escalated} highlight />
        </>
      )}

      <SectionLabel label="All absentees" action={String(rest.length)} />
      {rest.length > 0 ? (
        <AbsenteeList items={rest} />
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">
          {escalated.length > 0 ? 'Everything else is being handled.' : 'No one to follow up right now.'}
        </p>
      )}
    </>
  )
}

type AbsenteeItem = {
  id: string
  escalated: boolean
  urgent: boolean
  note: string | null
  name: string
  phone: string | null
  company: string
  leader: string
  date: string
}

function AbsenteeList({ items, highlight }: { items: AbsenteeItem[]; highlight?: boolean }) {
  return (
    <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
      {items.map((c) => (
        <li key={c.id} className="flex gap-3 items-start py-[13px]">
          <Avatar initials={initialsOf(c.name)} ring={highlight || c.urgent ? 'urgent' : 'care'} />
          <div className="flex-1 min-w-0">
            <Link href={`/care/${c.id}`} className="block active:opacity-60 transition-opacity">
              <div className="text-[15px] font-medium text-ink tracking-[-0.014em] leading-[1.3] truncate">
                {c.name}
                {highlight && <span className="text-accent text-[12px] font-semibold"> · needs help</span>}
              </div>
              <div className="text-[12.5px] text-ink-3 mt-0.5 truncate">
                {c.company} · {c.leader} · {c.date}
              </div>
            </Link>
            {c.note && (
              <div className="text-[12.5px] text-ink-2 mt-1 leading-[1.4] line-clamp-2 whitespace-pre-line">
                {c.note}
              </div>
            )}
            {c.phone ? (
              <a
                href={`tel:${c.phone}`}
                className="inline-flex items-center gap-1.5 mt-1.5 text-[13px] font-semibold text-calm
                           active:opacity-60 transition-opacity [&_svg]:w-[15px] [&_svg]:h-[15px]"
              >
                <PhoneIcon />
                {c.phone}
              </a>
            ) : (
              <div className="text-[12px] text-ink-4 mt-1.5">No phone number on file</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
