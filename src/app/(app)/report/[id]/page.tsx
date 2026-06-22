import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { formatWeekRange, initialsOf, firstNameOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import Hero from '@/components/ui/Hero'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import ReviewActions from '@/components/admin/ReviewActions'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireAuth()
  const supabase = createClient()

  const { data: report } = await supabase
    .from('weekly_reports')
    .select(
      'id, status, week_number, week_start, notes, flag_reason, company:companies(name), submitter:profiles!weekly_reports_submitted_by_fkey(full_name)'
    )
    .eq('id', params.id)
    .maybeSingle()

  if (!report) notFound()

  const { data: attendance } = await supabase
    .from('attendance_records')
    .select('present, absence_reason, member:members(full_name)')
    .eq('report_id', report.id)

  const records = attendance ?? []
  const absent = records.filter((a) => !a.present)
  const presentCount = records.length - absent.length

  const statusWord =
    report.status === 'reviewed'
      ? 'approved.'
      : report.status === 'flagged'
        ? 'sent back.'
        : report.status === 'draft'
          ? report.flag_reason
            ? 'sent back.'
            : 'in progress.'
          : 'awaiting review.'

  return (
    <>
      <Greeting day={`Week ${report.week_number} · ${formatWeekRange(report.week_start)}`}>
        {report.company?.name ?? 'Report'}<em>.</em>
      </Greeting>

      <Hero
        label={`Submitted by ${firstNameOf(report.submitter?.full_name ?? 'leader')}`}
        title={
          <>
            Week {report.week_number} — <em>{statusWord}</em>
          </>
        }
        meta={
          <>
            <b>{presentCount} present</b> · {absent.length} absent
          </>
        }
      />

      {report.flag_reason && report.status !== 'reviewed' && (
        <div className="mx-5 mt-4 px-3.5 py-3 bg-care-bg rounded-input text-[13px] text-care font-medium leading-[1.45]">
          Sent back to the leader: {report.flag_reason}
        </div>
      )}

      {profile.role === 'church_admin' && report.status !== 'draft' && (
        <ReviewActions reportId={report.id} status={report.status} />
      )}

      {absent.length > 0 && (
        <>
          <SectionLabel label="Marked absent" />
          <RowList>
            {absent.map((a, i) => (
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
          <SectionLabel label="Leader's note" />
          <p className="mx-5 my-0 text-[14px] text-ink-2 leading-[1.5]">{report.notes}</p>
        </>
      )}
    </>
  )
}
