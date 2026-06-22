'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveDraft(data: {
  reportId?: string
  companyId: string
  weekStart: string
  weekNumber: number
  year: number
  presentIds: string[]
  reasons: Record<string, string> // memberId -> absence reason (absentees only)
  notes: string
}): Promise<{ error: string } | { reportId: string }> {
  const supabase = createClient()
  const { userId } = await requireAuth()

  const { data: report, error } = await supabase
    .from('weekly_reports')
    .upsert(
      {
        id: data.reportId,
        company_id: data.companyId,
        submitted_by: userId,
        week_start: data.weekStart,
        week_number: data.weekNumber,
        year: data.year,
        status: 'draft',
        notes: data.notes,
      },
      { onConflict: 'company_id,week_start' }
    )
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Upsert attendance for all active members. Present = leader marked them;
  // everyone else is absent, with the reason the leader attached (if any).
  const { data: allMembers, error: membersError } = await supabase
    .from('members')
    .select('id')
    .eq('company_id', data.companyId)
    .eq('status', 'active')

  if (membersError) return { error: membersError.message }

  if (allMembers && allMembers.length > 0) {
    const present = new Set(data.presentIds)
    const { error: attendanceError } = await supabase.from('attendance_records').upsert(
      allMembers.map((m) => {
        const isPresent = present.has(m.id)
        return {
          report_id: report.id,
          member_id: m.id,
          present: isPresent,
          absence_reason: isPresent ? null : data.reasons[m.id]?.trim() || null,
        }
      }),
      { onConflict: 'report_id,member_id' }
    )
    if (attendanceError) return { error: attendanceError.message }
  }

  revalidatePath('/report')
  return { reportId: report.id }
}

export async function submitReport(reportId: string): Promise<{ error: string } | { success: true }> {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase
    .from('weekly_reports')
    .update({ status: 'submitted', flag_reason: null }) // clear any prior send-back note
    .eq('id', reportId)

  if (error) return { error: error.message }
  // The handle_report_submitted trigger creates follow-up cases for absentees

  revalidatePath('/report')
  revalidatePath('/')
  revalidatePath('/care')
  return { success: true }
}

export async function reviewReport(reportId: string): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') return { error: 'Only the church admin can review reports.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('weekly_reports')
    .update({
      status: 'reviewed',
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      flag_reason: null,
    })
    .eq('id', reportId)

  if (error) return { error: error.message }
  revalidatePath('/report')
  revalidatePath('/')
  return { success: true }
}

export async function flagReport(
  reportId: string,
  reason: string
): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') return { error: 'Only the church admin can flag reports.' }

  // "Send back" returns the report to an editable draft, carrying the note. The
  // leader sees it, fixes the report, and resubmits — reusing the normal draft
  // RLS + the submit trigger. flag_reason present on a draft = "sent back".
  const supabase = createClient()
  const { error } = await supabase
    .from('weekly_reports')
    .update({
      status: 'draft',
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      flag_reason: reason || 'Please review and resubmit.',
    })
    .eq('id', reportId)

  if (error) return { error: error.message }
  revalidatePath('/report')
  revalidatePath('/')
  return { success: true }
}
