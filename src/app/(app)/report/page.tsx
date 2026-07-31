import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice, type Profile } from '@/lib/auth'
import {
  getCurrentService,
  getRecentServices,
  formatShortDate,
  firstNameOf,
  initialsOf,
} from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import Hero from '@/components/ui/Hero'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import { ChevronIcon } from '@/components/ui/Icons'
import ReportForm from '@/components/report/ReportForm'

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { service?: string }
}) {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) ? (
    <AdminQueue serviceParam={searchParams.service} />
  ) : (
    <LeaderReport profile={profile} serviceParam={searchParams.service} />
  )
}

// ===== Leader: draft form or submitted summary, per service =====

async function LeaderReport({
  profile,
  serviceParam,
}: {
  profile: Profile
  serviceParam?: string
}) {
  const supabase = createClient()
  // Default to the service that just happened; ?service=YYYY-MM-DD files an earlier one.
  const recent = getRecentServices(4)
  const service = recent.find((s) => s.date === serviceParam) ?? getCurrentService()

  if (!profile.company_id) {
    return (
      <>
        <Greeting day={service.longLabel}>
          No <em>company.</em>
        </Greeting>
        <p className="mx-5 mt-3 text-[14px] text-ink-2 leading-[1.5]">
          You haven&rsquo;t been assigned a company yet. The church office can set this up.
        </p>
      </>
    )
  }

  const [{ data: members }, { data: report }, { data: recentReports }] = await Promise.all([
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
      .eq('service_date', service.date)
      .maybeSingle(),
    supabase
      .from('weekly_reports')
      .select('service_date, status')
      .eq('company_id', profile.company_id)
      .in('service_date', recent.map((s) => s.date)),
  ])

  const statusByDate = new Map((recentReports ?? []).map((r) => [r.service_date, r.status]))
  const picker = (
    <ServicePicker services={recent} current={service.date} statusByDate={statusByDate} />
  )

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
        <Greeting day={service.longLabel}>
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
        {picker}
        <Hero
          label={service.longLabel}
          title={
            sentBack ? (
              <>
                {service.label} — <em>needs changes.</em>
              </>
            ) : (
              <>
                {service.label} —{' '}
                <em>{report.status === 'reviewed' ? 'approved.' : 'submitted.'}</em>
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
    <>
      {picker}
      <ReportForm
        companyId={profile.company_id}
        serviceDate={service.date}
        serviceType={service.type}
        serviceLabel={service.label}
        serviceLongLabel={service.longLabel}
        members={members ?? []}
        initialReportId={report?.id}
        initialPresentIds={presentIds}
        initialReasons={reasons}
        initialNotes={report?.notes ?? ''}
        sentBackReason={report?.flag_reason ?? null}
      />
    </>
  )
}

// Small tab strip so a leader can file the service that just ended, or catch up
// on one they missed. Green tick = already submitted.
function ServicePicker({
  services,
  current,
  statusByDate,
}: {
  services: { date: string; label: string }[]
  current: string
  statusByDate: Map<string, string>
}) {
  return (
    <div className="px-5 pt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {services.map((s) => {
        const done = statusByDate.get(s.date) && statusByDate.get(s.date) !== 'draft'
        const active = s.date === current
        return (
          <Link
            key={s.date}
            href={`/report?service=${s.date}`}
            className={`flex-shrink-0 px-3 py-2 rounded-[11px] text-[12.5px] font-medium whitespace-nowrap
                        transition-colors active:scale-95
                        ${active ? 'bg-primary text-primary-ink' : 'bg-surface text-ink-2 border border-[var(--rule)]'}`}
          >
            {done && <span className={active ? 'text-accent-soft' : 'text-ok'}>✓ </span>}
            {s.label.replace(' service', '')} · {formatShortDate(s.date)}
          </Link>
        )
      })}
    </div>
  )
}

// ===== Admin / Office: report review =====

const statusSub: Record<string, React.ReactNode> = {
  submitted: <StatusDot tone="care">Waiting for you to review</StatusDot>,
  reviewed: <StatusDot tone="ok">Approved</StatusDot>,
  flagged: <StatusDot tone="care">Sent back to leader</StatusDot>,
  draft: <StatusDot>Still being filled in</StatusDot>,
}

async function AdminQueue({ serviceParam }: { serviceParam?: string }) {
  const supabase = createClient()
  const recent = getRecentServices(4)
  const service = recent.find((s) => s.date === serviceParam) ?? getCurrentService()

  const [{ data: companies }, { data: reports }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase
      .from('weekly_reports')
      .select('id, status, flag_reason, company_id, submitter:profiles!weekly_reports_submitted_by_fkey(full_name)')
      .eq('service_date', service.date),
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
      <Greeting day={service.longLabel}>
        {service.label.replace(' service', '')} <em>reports.</em>
      </Greeting>

      <ServicePicker
        services={recent}
        current={service.date}
        statusByDate={new Map()}
      />

      <div className="px-5 pt-3">
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
