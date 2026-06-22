'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function assignCase(data: {
  caseId: string
  assignTo: string
  urgency: 'normal' | 'urgent'
  contextNote?: string
}): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (!isAdminOrOffice(profile.role)) return { error: 'Unauthorized' }

  const supabase = createClient()
  const { error } = await supabase
    .from('follow_up_cases')
    .update({
      assigned_to: data.assignTo,
      assigned_by: profile.id,
      status: 'assigned',
      urgency: data.urgency,
      context_note: data.contextNote || null,
    })
    .eq('id', data.caseId)

  if (error) return { error: error.message }
  revalidatePath('/care')
  revalidatePath('/')
  return { success: true }
}

export async function recordContact(data: {
  caseId: string
  method: 'called' | 'messaged' | 'visited'
  note?: string
}): Promise<{ error: string } | { success: true }> {
  const { userId } = await requireAuth()
  const supabase = createClient()

  const { error } = await supabase.from('follow_up_contacts').insert({
    case_id: data.caseId,
    recorded_by: userId,
    method: data.method,
    note: data.note || null,
  })

  if (error) return { error: error.message }

  // Flip case to active once first contact is made
  await supabase
    .from('follow_up_cases')
    .update({ status: 'active' })
    .eq('id', data.caseId)
    .eq('status', 'assigned')

  revalidatePath('/care')
  revalidatePath(`/care/${data.caseId}`)
  return { success: true }
}

export async function resolveCase(caseId: string): Promise<{ error: string } | { success: true }> {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase
    .from('follow_up_cases')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', caseId)

  if (error) return { error: error.message }
  revalidatePath('/care')
  revalidatePath(`/care/${caseId}`)
  revalidatePath('/')
  return { success: true }
}
