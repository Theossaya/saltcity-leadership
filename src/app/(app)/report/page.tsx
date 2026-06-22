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

  // Submitted / reviewed / flagged — read-only summary
  if (report && report.status !== 'draft') {
    const { data: absences } = await supabase
      .from('attendance_records')
      .select('member:members(full_name)')
      .eq('report_id', report.id)
      .eq('present', false)

    const absentNames = (absences ?? []).map((a) => a.member?.full_name).filter(Boolean) as string[]
    const total = members?.length ?? 0

    return (
      <>
        <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
          Report <em>submitted.</em>
        </Greeting>
        <Hero
          label="This week's report"
          title={
            report.status === 'flagged' ? (
              <>
                Week {weekNumber} — <em>flagged.</em>
              </>
            ) : (
              <>
                Week {weekNumber} — <em>{report.status === 'reviewed' ? 'reviewed.' : 'submitted.'}</em>
              </>
            )
          }
          meta={
            <>
              <b>{total - absentNames.length} present</b> · {absentNames.length} absent
            </>
          }
        />

        {report.status === 'flagged' && report.flag_reason && (
          <div className="mx-5 mt-4 px-3.5 py-3 bg-care-bg rounded-input text-[13px] text-care font-medium leading-[1.45]">
            Flagged by the office: {report.flag_reason}
          </div>
        )}

        {absentNames.length > 0 && (
          <>
            <SectionLabel label="Marked absent" />
            <RowList>
              {absentNames.map((name) => (
                <Row key={name} lead={<Avatar initials={initialsOf(name)} size="sm" />} title={name} />
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

  // Draft (or not started) — the form
  let absentIds: string[] = []
  if (report) {
    const { data: absences } = await supabase
      .from('attendance_records')
      .select('member_id')
      .eq('report_id', report.id)
      .eq('present', false)
    absentIds = (absences ?? []).map((a) => a.member_id)
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
      initialAbsentIds={absentIds}
      initialNotes={report?.notes ?? ''}
    />
  )
}

// ===== Admin / Office: review queue =====

const statusSub: Record<string, React.ReactNode> = {
  submitted: <StatusDot tone="care">Awaiting review</StatusDot>,
  reviewed: <StatusDot tone="ok">Reviewed</StatusDot>,
  flagged: <StatusDot tone="urgent">Flagged</StatusDot>,
  draft: <StatusDot>In progress</StatusDot>,
}

async function AdminQueue() {
  const supabase = createClient()
  const { weekStart, weekNumber } = getCurrentWeek()
  const weekRange = formatWeekRange(weekStart)

  const [{ data: companies }, { data: reports }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase
      .from('weekly_reports')
      .select('id, status, company_id, submitter:profiles!weekly_reports_submitted_by_fkey(full_name)')
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
        Review <em>queue.</em>
      </Greeting>

      <div className="px-5 pt-2">
        <Link href="/export" className="text-[13px] text-primary font-semibold">
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
                      Review
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
                lead={<Avatar initials={initialsOf(c.name)} />}
                title={c.name}
                sub={r ? statusSub.draft : <StatusDot>Not started</StatusDot>}
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
