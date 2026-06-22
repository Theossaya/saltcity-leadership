import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { initialsOf, firstNameOf, formatShortDate, formatAge } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import Row, { RowList } from '@/components/ui/Row'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import CaseActions from '@/components/care/CaseActions'
import AssignCaseForm from '@/components/care/AssignCaseForm'

const methodLabel = { called: 'Called', messaged: 'Messaged', visited: 'Visited' } as const

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const { profile } = await requireAuth()
  const supabase = createClient()

  const { data: caseRow } = await supabase
    .from('follow_up_cases')
    .select(
      'id, status, urgency, context_note, created_at, resolved_at, member:members(full_name), company:companies(name), assignee:profiles!follow_up_cases_assigned_to_fkey(full_name)'
    )
    .eq('id', params.id)
    .maybeSingle()

  if (!caseRow) notFound()

  const { data: contacts } = await supabase
    .from('follow_up_contacts')
    .select('id, method, note, contacted_at, recorder:profiles!follow_up_contacts_recorded_by_fkey(full_name)')
    .eq('case_id', caseRow.id)
    .order('contacted_at', { ascending: false })

  const admin = isAdminOrOffice(profile.role)
  const memberName = caseRow.member?.full_name ?? 'Member'
  const resolved = caseRow.status === 'resolved'
  const needsAssign = admin && (caseRow.status === 'new' || !caseRow.assignee)

  let leaders: { id: string; full_name: string }[] = []
  if (needsAssign) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['company_leader', 'assistant_leader'])
      .order('full_name')
    leaders = data ?? []
  }

  return (
    <>
      <Greeting day={caseRow.company?.name ?? undefined}>
        Follow <em>up.</em>
      </Greeting>

      <div className="px-5 pt-4">
        <div className="bg-surface rounded-card p-[18px] shadow-lift">
          <div className="flex gap-3 items-center">
            <Avatar
              initials={initialsOf(memberName)}
              size="lg"
              ring={resolved ? 'ok' : caseRow.urgency === 'urgent' ? 'urgent' : 'care'}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-semibold text-ink tracking-[-0.018em]">{memberName}</div>
              <div className="mt-0.5">
                {resolved ? (
                  <StatusDot tone="ok">{`Resolved ${caseRow.resolved_at ? formatShortDate(caseRow.resolved_at) : ''}`}</StatusDot>
                ) : caseRow.urgency === 'urgent' ? (
                  <StatusDot tone="urgent">{`Urgent · since ${formatShortDate(caseRow.created_at)}`}</StatusDot>
                ) : (
                  <StatusDot tone="care">{`Opened ${formatAge(caseRow.created_at)}`}</StatusDot>
                )}
              </div>
              {caseRow.assignee && (
                <div className="text-[12px] text-ink-3 mt-1">
                  Assigned to {firstNameOf(caseRow.assignee.full_name)}
                </div>
              )}
            </div>
          </div>

          {caseRow.context_note && (
            <div className="px-3.5 py-3 bg-bg-2 rounded-[12px] text-[13px] text-ink-2 leading-[1.5] mt-3.5">
              {caseRow.context_note}
            </div>
          )}

          {needsAssign ? (
            <AssignCaseForm caseId={caseRow.id} leaders={leaders} initialUrgency={caseRow.urgency} />
          ) : (
            !resolved && <CaseActions caseId={caseRow.id} />
          )}
        </div>
      </div>

      {(contacts ?? []).length > 0 && (
        <>
          <SectionLabel label="Contact history" />
          <RowList>
            {(contacts ?? []).map((c) => (
              <Row
                key={c.id}
                lead={<Avatar initials={initialsOf(c.recorder?.full_name ?? '?')} size="sm" />}
                title={`${methodLabel[c.method]} · ${formatShortDate(c.contacted_at)}`}
                sub={c.note ?? `by ${firstNameOf(c.recorder?.full_name ?? '')}`}
              />
            ))}
          </RowList>
        </>
      )}
    </>
  )
}
