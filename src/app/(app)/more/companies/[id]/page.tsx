import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { initialsOf } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import Hero from '@/components/ui/Hero'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import MemberAdmin from '@/components/admin/MemberAdmin'

const roleLabel: Record<string, string> = {
  company_leader: 'Company Leader',
  assistant_leader: 'Assistant Leader',
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireAuth()
  const supabase = createClient()
  const admin = isAdminOrOffice(profile.role)

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', params.id)
    .maybeSingle()

  if (!company) notFound()

  const [{ data: members }, { data: leadership }, { data: openCases }, { data: lastReport }] =
    await Promise.all([
      supabase
        .from('members')
        .select('id, full_name, phone')
        .eq('company_id', company.id)
        .eq('status', 'active')
        .order('full_name'),
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('company_id', company.id)
        .in('role', ['company_leader', 'assistant_leader'])
        .order('role'),
      // RLS scopes this: leaders only see their own assigned cases
      supabase
        .from('follow_up_cases')
        .select('member_id, urgency, status')
        .eq('company_id', company.id)
        .in('status', ['new', 'assigned', 'active']),
      supabase
        .from('weekly_reports')
        .select('id, status, week_start')
        .eq('company_id', company.id)
        .neq('status', 'draft')
        .order('week_start', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  const memberList = members ?? []
  const caseByMember = new Map(
    (openCases ?? []).map((c) => [c.member_id, c.urgency === 'urgent' ? 'urgent' : 'care'] as const)
  )

  // Attendance % from the latest submitted report
  let attendancePct: number | null = null
  if (lastReport) {
    const { data: attendance } = await supabase
      .from('attendance_records')
      .select('present')
      .eq('report_id', lastReport.id)
    if (attendance && attendance.length > 0) {
      attendancePct = Math.round((attendance.filter((a) => a.present).length / attendance.length) * 100)
    }
  }

  const isOwnCompany = profile.company_id === company.id

  return (
    <>
      <Greeting day={company.name}>
        {isOwnCompany ? (
          <>
            Your <em>company.</em>
          </>
        ) : (
          <>
            Company <em>roster.</em>
          </>
        )}
      </Greeting>

      <Hero>
        <div className="flex gap-5">
          <HeroStat value={String(memberList.length)} label="Members" />
          <HeroStat
            value={attendancePct !== null ? `${attendancePct}%` : '—'}
            label="Attendance"
          />
          <HeroStat value={String(caseByMember.size)} label="In care" />
        </div>
      </Hero>

      {(leadership ?? []).length > 0 && (
        <>
          <SectionLabel label="Leadership" />
          <RowList>
            {(leadership ?? []).map((l) => (
              <Row
                key={l.id}
                lead={<Avatar initials={initialsOf(l.full_name)} />}
                title={l.full_name}
                sub={`${roleLabel[l.role] ?? l.role}${l.id === profile.id ? ' · you' : ''}`}
              />
            ))}
          </RowList>
        </>
      )}

      <SectionLabel label="Members" action={String(memberList.length)} />
      {/* Admin/office add+remove anywhere; a leader may add to their own company
          (removal stays with the office). */}
      {admin || isOwnCompany ? (
        <MemberAdmin
          companyId={company.id}
          canRemove={admin}
          members={memberList.map((m) => ({
            ...m,
            ring: caseByMember.get(m.id) ?? null,
          }))}
        />
      ) : (
        <>
          <RowList>
            {memberList.map((m) => {
              const ring = caseByMember.get(m.id)
              return (
                <Row
                  key={m.id}
                  lead={<Avatar initials={initialsOf(m.full_name)} size="sm" ring={ring ?? undefined} />}
                  title={m.full_name}
                  sub={
                    ring === 'urgent' ? (
                      <StatusDot tone="urgent">In care · urgent</StatusDot>
                    ) : ring === 'care' ? (
                      <StatusDot tone="care">In care</StatusDot>
                    ) : (
                      'Active'
                    )
                  }
                />
              )
            })}
          </RowList>
        </>
      )}
    </>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[24px] font-semibold text-primary-ink tracking-[-0.02em]">{value}</div>
      <div className="text-[11.5px] text-primary-soft mt-[3px]">{label}</div>
    </div>
  )
}
