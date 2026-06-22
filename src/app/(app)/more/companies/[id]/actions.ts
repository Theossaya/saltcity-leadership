'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addMember(
  companyId: string,
  fullName: string
): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  // Admin/office add anywhere; a leader may add to their own company only.
  const canAdd = isAdminOrOffice(profile.role) || profile.company_id === companyId
  if (!canAdd) return { error: 'You can only add members to your own company.' }

  const name = fullName.trim()
  if (!name) return { error: 'Please enter a name.' }

  const supabase = createClient()
  const { error } = await supabase.from('members').insert({ full_name: name, company_id: companyId })

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${companyId}`)
  return { success: true }
}

export async function removeMember(
  memberId: string,
  companyId: string
): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (!isAdminOrOffice(profile.role)) return { error: 'Members are removed by the church office.' }

  // Mark inactive rather than delete — preserves attendance and care history
  const supabase = createClient()
  const { error } = await supabase.from('members').update({ status: 'inactive' }).eq('id', memberId)

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${companyId}`)
  return { success: true }
}
