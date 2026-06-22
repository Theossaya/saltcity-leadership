import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice, type Profile } from '@/lib/auth'
import {
  getCurrentWeek,
  formatDayLong,
  formatEventDate,
  formatTime,
  formatAge,
  firstNameOf,
  initialsOf,
  formatShortDate,
} from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import Hero from '@/components/ui/Hero'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import EventRow from '@/components/ui/EventRow'
import Notice from '@/components/ui/Notice'
import Button from '@/components/ui/Button'
import { ChevronIcon, WarnIcon } from '@/components/ui/Icons'

export default async function DashboardPage() {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) ? (
    <AdminDashboard profile={profile} />
  ) : (
    <LeaderDashboard profile={profile} />
  )
}

// ===== Leader =====

async function LeaderDashboard({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { weekStart, weekNumber } = getCurrentWeek()

  const [{ data: report }, { data: followups }, { data: nextEvent }] = await Promise.all([
    profile.company_id
      ? supabase
          .from('weekly_reports')
          .select('id, status, updated_at')
          .eq('company_id', profile.company_id)
          .eq('week_start', weekStart)
          .maybeSingle()
      : Promise.resolve({ data: null }),

    supabase
      .from('follow_up_cases')
      .select('id, urgency, status, created_at, member:members(full_name)')
      .eq('assigned_to', profile.id)
      .in('status', ['assigned', 'active'])
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(2),

    supabase
      .from('events')
      .select('id, title, event_date, event_time, location')
      .gte('event_date', weekStart)
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const status = report?.status
  const heroTitle =
    status === 'submitted' || status === 'reviewed' ? (
      <>
        Week {weekNumber} — <em>submitted.</em>
      </>
    ) : status === 'flagged' ? (
      <>
        Week {weekNumber} — <em>flagged.</em>
      </>
    ) : status === 'draft' ? (
      <>
        Week {weekNumber} — <em>in progress.</em>
      </>
    ) : (
      <>
        Week {weekNumber} — <em>not started.</em>
      </>
    )
  const heroMeta =
    status === 'submitted' || status === 'reviewed' ? (
      <>
        <b>Thank you.</b> The office will review it.
      </>
    ) : status === 'flagged' ? (
      <>
        <b>The office flagged this report</b> — open it to see why.
      </>
    ) : (
      <>
        <b>Closes Sunday 18:00</b> · takes 2 minutes
      </>
    )
  const heroAction =
    status === 'submitted' || status === 'reviewed'
      ? 'View report'
      : status === 'flagged'
        ? 'Open report'
        : status === 'draft'
          ? 'Continue report'
          : 'Start report'

  return (
    <>
      <Greeting day={formatDayLong()}>
        Hi, <em>{firstNameOf(profile.full_name)}.</em>
      </Greeting>

      <Hero
        label="This week's report"
        title={heroTitle}
        meta={heroMeta}
        actions={
          <Link href="/report">
            <Button variant="light">{heroAction}</Button>
          </Link>
        }
      />

      <SectionLabel label="Assigned to you" action="See all" href="/care" />
      {followups && followups.length > 0 ? (
        <RowList>
          {followups.map((c) => (
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
                  <StatusDot tone="care">{`Follow up · opened ${formatAge(c.created_at)}`}</StatusDot>
                )
              }
              tail={<ChevronIcon />}
            />
          ))}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">No follow-ups assigned right now.</p>
      )}

      <SectionLabel label="Up next" />
      {nextEvent ? (
        <RowList>
          <EventRow
            berry
            month={formatEventDate(nextEvent.event_date).m}
            day={formatEventDate(nextEvent.event_date).d}
            title={nextEvent.title}
            meta={[formatTime(nextEvent.event_time), nextEvent.location].filter(Boolean).join(' · ')}
            tail={
              <Link href="/more/events" aria-label="View events">
                <ChevronIcon />
              </Link>
            }
          />
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Nothing scheduled yet.</p>
      )}
    </>
  )
}

// ===== Admin / Office =====

async function AdminDashboard({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { weekStart, weekNumber } = getCurrentWeek()

  const [
    { count: companyCount },
    { data: weekReports },
    { data: flagged },
    { data: urgentCase },
    { data: latestNotice },
  ] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),

    supabase.from('weekly_reports').select('status').eq('week_start', weekStart),

    supabase
      .from('weekly_reports')
      .select('id, status, company:companies(name), submitter:profiles!weekly_reports_submitted_by_fkey(full_name)')
      .eq('week_start', weekStart)
      .eq('status', 'flagged')
      .limit(3),

    supabase
      .from('follow_up_cases')
      .select('id, urgency, created_at, member:members(full_name), company:companies(name), assignee:profiles!follow_up_cases_assigned_to_fkey(full_name)')
      .in('status', ['assigned', 'active'])
      .eq('urgency', 'urgent')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('announcements')
      .select('id, title, body, published_at, audience')
      .eq('active', true)
      .neq('priority', 'urgent')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const total = companyCount ?? 0
  const submitted = (weekReports ?? []).filter((r) => r.status !== 'draft').length
  const outstanding = Math.max(0, total - submitted)

  return (
    <>
      <Greeting day={formatDayLong()}>
        Hi, <em>{firstNameOf(profile.full_name)}.</em>
      </Greeting>

      <Hero
        label={`Week ${weekNumber} reports`}
        title={
          <>
            {submitted} of {total} <em>are in.</em>
          </>
        }
        meta={
          outstanding > 0 ? (
            <>
              <b>
                {outstanding} {outstanding === 1 ? 'company' : 'companies'}
              </b>{' '}
              still to submit
            </>
          ) : (
            <>
              <b>All companies</b> have submitted
            </>
          )
        }
        progress={total > 0 ? submitted / total : 0}
        actions={
          <Link href="/report">
            <Button variant="light">Review queue</Button>
          </Link>
        }
      />

      <SectionLabel label="Needs attention" action="See all" href="/report" />
      {flagged && flagged.length > 0 ? (
        <RowList>
          {flagged.map((r) => (
            <Row
              key={r.id}
              href={`/report/${r.id}`}
              lead={<Avatar initials={initialsOf(r.company?.name ?? '?')} ring="care" />}
              title={`${r.company?.name ?? 'Company'} · ${firstNameOf(r.submitter?.full_name ?? '')}`}
              sub={<StatusDot tone="care">Flagged · needs review</StatusDot>}
              tail={<ChevronIcon />}
            />
          ))}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Nothing flagged this week.</p>
      )}

      {urgentCase && (
        <>
          <SectionLabel label="Urgent care" />
          <Notice
            urgent
            icon={<WarnIcon />}
            title={`${urgentCase.member?.full_name ?? 'Member'} · since ${formatShortDate(urgentCase.created_at)}`}
            meta={[
              urgentCase.company?.name,
              urgentCase.assignee ? `assigned to ${firstNameOf(urgentCase.assignee.full_name)}` : 'unassigned',
            ]
              .filter(Boolean)
              .join(' · ')}
            tail={
              <Link href={`/care/${urgentCase.id}`}>
                <Button size="sm" className="!bg-white/[0.18] !text-white">
                  Open
                </Button>
              </Link>
            }
          />
        </>
      )}

      {latestNotice && (
        <>
          <SectionLabel label="Latest notice" />
          <Link href={`/more/announcements/${latestNotice.id}`} className="block mx-5">
            <div className="bg-surface rounded-card px-4 py-4 shadow-lift">
              <div className="text-[11.5px] text-ink-3 mb-[5px]">
                {formatShortDate(latestNotice.published_at)} ·{' '}
                {latestNotice.audience === 'all' ? 'everyone' : latestNotice.audience}
              </div>
              <div className="text-[16px] font-semibold text-ink tracking-[-0.016em] leading-[1.25] mb-[5px]">
                {latestNotice.title}
              </div>
              <div className="text-[13.5px] text-ink-2 leading-[1.5] line-clamp-2">{latestNotice.body}</div>
            </div>
          </Link>
        </>
      )}
    </>
  )
}
