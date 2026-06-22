import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice, type Profile } from '@/lib/auth'
import { getCurrentWeek, formatWeekRange, firstNameOf, initialsOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import Hero from '@/components/ui/Hero'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import { ChevronIcon } from '@/components/ui/Icons'
import ReportForm from '@/components/report/ReportForm'

export default async function ReportPage() {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) ? <AdminQueue /> : <LeaderReport profile={profile} />
}

// ===== Leader: draft form or submitted summary =====

async function LeaderReport({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const { weekStart, weekNumber, year } = getCurrentWeek()
  const weekRange = formatWeekRange(weekStart)

  if (!profile.company_id) {
    return (
      <>
        <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
          No <em>company.</em>
        </Greeting>
        <p className="mx-5 mt-3 text-[14px] text-ink-2 leading-[1.5]">
          You haven&rsquo;t been assigned a company yet. The church office can set this up.
        </p>
      </>
    )
  }

  const [{ data: members }, { data: report }] = await Promise.all([
    supabase
      .from('members')
      .select('id, full_name')
      .eq('company_id', profile.company_id)
      .eq('status', 'active')
      .order('full_name'),
    supabase
      .from('weekly_reports')
      .select('id, status, notes, flag_reason')
      .eq('company_id', profile.company_id)
      .eq('week_start', weekStart)
      .maybeSingle(),
  ])

  // Submitted / reviewed / sent-back — read-only summary
  if (report && report.status !== 'draft') {
    const { data: absences } = await supabase
      .from('attendance_records')
      .select('absence_reason, member:members(full_name)')
      .eq('report_id', report.id)
      .eq('present', false)

    const absentList = (absences ?? []).filter((a) => a.member)
    const total = members?.length ?? 0
    const sentBack = report.status === 'flagged'

    return (
      <>
        <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
          {sentBack ? (
            <>
              Report <em>sent back.</em>
            </>
          ) : (
            <>
              Report <em>submitted.</em>
            </>
          )}
        </Greeting>
        <Hero
          label="This week's report"
          title={
            sentBack ? (
              <>
                Week {weekNumber} — <em>needs changes.</em>
              </>
            ) : (
              <>
                Week {weekNumber} — <em>{report.status === 'reviewed' ? 'approved.' : 'submitted.'}</em>
              </>
            )
          }
          meta={
            <>
              <b>{total - absentList.length} present</b> · {absentList.length} absent
            </>
          }
        />

        {sentBack && report.flag_reason && (
          <div className="mx-5 mt-4 px-3.5 py-3 bg-care-bg rounded-input text-[13px] text-care font-medium leading-[1.45]">
            The office asked for a change: {report.flag_reason}
          </div>
        )}

        {absentList.length > 0 && (
          <>
            <SectionLabel label="Marked absent" />
            <RowList>
              {absentList.map((a, i) => (
                <Row
                  key={i}
                  lead={<Avatar initials={initialsOf(a.member?.full_name ?? '?')} size="sm" />}
                  title={a.member?.full_name ?? 'Member'}
                  sub={a.absence_reason ?? undefined}
                />
              ))}
            </RowList>
          </>
        )}

        {report.notes && (
          <>
            <SectionLabel label="Your note" />
            <p className="mx-5 my-0 text-[14px] text-ink-2 leading-[1.5]">{report.notes}</p>
          </>
        )}
      </>
    )
  }

  // Draft (or not started) — the form. Compute who's already marked present + reasons.
  let presentIds: string[] = []
  let reasons: Record<string, string> = {}
  if (report) {
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('member_id, present, absence_reason')
      .eq('report_id', report.id)
    for (const a of attendance ?? []) {
      if (a.present) presentIds.push(a.member_id)
      else if (a.absence_reason) reasons[a.member_id] = a.absence_reason
    }
  }

  return (
    <ReportForm
      companyId={profile.company_id}
      weekStart={weekStart}
      weekNumber={weekNumber}
      year={year}
      weekRange={weekRange}
      members={members ?? []}
      initialReportId={report?.id}
      initialPresentIds={presentIds}
      initialReasons={reasons}
      initialNotes={report?.notes ?? ''}
      sentBackReason={report?.flag_reason ?? null}
    />
  )
}

// ===== Admin / Office: report review =====

const statusSub: Record<string, React.ReactNode> = {
  submitted: <StatusDot tone="care">Waiting for you to review</StatusDot>,
  reviewed: <StatusDot tone="ok">Approved</StatusDot>,
  flagged: <StatusDot tone="care">Sent back to leader</StatusDot>,
  draft: <StatusDot>Still being filled in</StatusDot>,
}

async function AdminQueue() {
  const supabase = createClient()
  const { weekStart, weekNumber } = getCurrentWeek()
  const weekRange = formatWeekRange(weekStart)

  const [{ data: companies }, { data: reports }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase
      .from('weekly_reports')
      .select('id, status, flag_reason, company_id, submitter:profiles!weekly_reports_submitted_by_fkey(full_name)')
      .eq('week_start', weekStart),
  ])

  const byCompany = new Map((reports ?? []).map((r) => [r.company_id, r]))
  const submitted = (companies ?? []).filter((c) => {
    const r = byCompany.get(c.id)
    return r && r.status !== 'draft'
  })
  const outstanding = (companies ?? []).filter((c) => {
    const r = byCompany.get(c.id)
    return !r || r.status === 'draft'
  })

  return (
    <>
      <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
        This week&rsquo;s <em>reports.</em>
      </Greeting>

      <div className="px-5 pt-2">
        <Link
          href="/export"
          className="text-[13px] text-primary font-semibold active:opacity-60 transition-opacity"
        >
          Export week summary →
        </Link>
      </div>

      <SectionLabel label="Submitted" action={String(submitted.length)} />
      {submitted.length > 0 ? (
        <RowList>
          {submitted.map((c) => {
            const r = byCompany.get(c.id)!
            return (
              <Row
                key={c.id}
                href={`/report/${r.id}`}
                lead={<Avatar initials={initialsOf(c.name)} />}
                title={`${c.name} · ${firstNameOf(r.submitter?.full_name ?? '')}`}
                sub={statusSub[r.status]}
                tail={
                  r.status === 'submitted' ? (
                    <Button variant="ghost" size="sm">
                      Open &amp; review
                    </Button>
                  ) : (
                    <ChevronIcon />
                  )
                }
              />
            )
          })}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">No reports in yet this week.</p>
      )}

      <SectionLabel label="Still to submit" action={String(outstanding.length)} />
      {outstanding.length > 0 ? (
        <RowList>
          {outstanding.map((c) => {
            const r = byCompany.get(c.id)
            return (
              <Row
                key={c.id}
                href={r && r.flag_reason ? `/report/${r.id}` : undefined}
                lead={<Avatar initials={initialsOf(c.name)} />}
                title={c.name}
                sub={
                  r && r.flag_reason ? (
                    <StatusDot tone="care">Sent back — awaiting fix</StatusDot>
                  ) : r ? (
                    statusSub.draft
                  ) : (
                    <StatusDot>Not started</StatusDot>
                  )
                }
              />
            )
          })}
        </RowList>
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Everyone has submitted.</p>
      )}
    </>
  )
}
