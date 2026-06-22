import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice, type Profile } from '@/lib/auth'
import { initialsOf, firstNameOf, formatShortDate, formatAge, getCurrentWeek } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import { ChevronIcon } from '@/components/ui/Icons'

export default async function CarePage() {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) ? <AdminCareQueue /> : <LeaderCare profile={profile} />
}

// ===== Leader: cases assigned to you =====

async function LeaderCare({ profile }: { profile: Profile }) {
  const supabase = createClient()

  const { data: cases } = await supabase
    .from('follow_up_cases')
    .select('id, urgency, status, context_note, created_at, member:members(full_name)')
    .eq('assigned_to', profile.id)
    .in('status', ['assigned', 'active'])
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: true })

  const list = cases ?? []
  const [primary, ...rest] = list

  if (!primary) {
    return (
      <>
        <Greeting day="Nothing assigned">All <em>clear.</em></Greeting>
        <p className="mx-5 mt-3 text-[14px] text-ink-2 leading-[1.5]">
          No follow-ups are assigned to you right now. New cases appear here when the office assigns
          them.
        </p>
      </>
    )
  }

  return (
    <>
      <Greeting day={`${list.length} assigned`}>
        Assigned to <em>you.</em>
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
                  <StatusDot tone="urgent">{`Urgent · since ${formatShortDate(primary.created_at)}`}</StatusDot>
                ) : (
                  <StatusDot tone="care">{`Opened ${formatAge(primary.created_at)}`}</StatusDot>
                )}
              </div>
            </div>
          </div>
          {primary.context_note && (
            <div className="px-3.5 py-3 bg-bg-2 rounded-[12px] text-[13px] text-ink-2 leading-[1.5] mb-3.5">
              {primary.context_note}
            </div>
          )}
          <Link href={`/care/${primary.id}`} className="block">
            <Button variant="berry" size="lg" full>
              Open case
            </Button>
          </Link>
        </div>
      </div>

      {rest.length > 0 && (
        <>
          <SectionLabel label="Also assigned" />
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
                    <StatusDot tone="urgent">{`Urgent · since ${formatShortDate(c.created_at)}`}</StatusDot>
                  ) : (
                    `Opened ${formatAge(c.created_at)}`
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

// ===== Admin / Office: care queue =====

async function AdminCareQueue() {
  const supabase = createClient()
  const { weekStart } = getCurrentWeek()
  const monthStart = `${weekStart.slice(0, 7)}-01`

  const [{ data: newCases }, { data: activeCases }, { count: resolvedCount }] = await Promise.all([
    supabase
      .from('follow_up_cases')
      .select(
        'id, urgency, created_at, member:members(full_name), company:companies(name)'
      )
      .eq('status', 'new')
      .order('created_at', { ascending: true }),

    supabase
      .from('follow_up_cases')
      .select(
        'id, urgency, status, created_at, member:members(full_name), assignee:profiles!follow_up_cases_assigned_to_fkey(full_name)'
      )
      .in('status', ['assigned', 'active'])
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: true }),

    supabase
      .from('follow_up_cases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved')
      .gte('resolved_at', monthStart),
  ])

  const newList = newCases ?? []
  const activeList = activeCases ?? []

  return (
    <>
      <Greeting day={`${newList.length} new · ${activeList.length} active`}>
        Care <em>queue.</em>
      </Greeting>

      <SectionLabel label="New from this week" action={String(newList.length)} />
      {newList.length > 0 ? (
        <RowList>
          {newList.map((c) => (
            <Row
              key={c.id}
              lead={<Avatar initials={initialsOf(c.member?.full_name ?? '?')} />}
              title={c.member?.full_name ?? 'Member'}
              sub={c.company?.name ?? undefined}
              tail={
                <Link href={`/care/${c.id}`}>
                  <Button variant="berry" size="sm">
                    Assign
                  </Button>
                </Link>
              }
            />
          ))}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">No new cases. Reports create them automatically.</p>
      )}

      <SectionLabel label="Active" action={String(activeList.length)} />
      {activeList.length > 0 ? (
        <RowList>
          {activeList.map((c) => (
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
              sub={[
                c.assignee ? firstNameOf(c.assignee.full_name) : 'Unassigned',
                c.status === 'assigned' ? 'no contact yet' : `opened ${formatAge(c.created_at)}`,
              ].join(' · ')}
              tail={<ChevronIcon />}
            />
          ))}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">No active cases.</p>
      )}

      <SectionLabel label="Resolved this month" />
      <p className="mx-5 my-0 text-[13px] text-ink-3">
        {resolvedCount
          ? `${resolvedCount} ${resolvedCount === 1 ? 'member is' : 'members are'} back in touch.`
          : 'None resolved yet this month.'}
      </p>
    </>
  )
}
