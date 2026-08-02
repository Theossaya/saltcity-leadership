'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type Result = { error: string } | { success: true }

// Admin/office manage any company; a leader manages their own company only.
// RLS enforces the same rule at the database boundary (migration 0010).
async function canManage(companyId: string) {
  const { profile } = await requireAuth()
  return isAdminOrOffice(profile.role) || profile.company_id === companyId
}

export async function addMember(
  companyId: string,
  fullName: string,
  phone?: string
): Promise<Result> {
  if (!(await canManage(companyId))) {
    return { error: 'You can only add members to your own company.' }
  }
  const name = fullName.trim()
  if (!name) return { error: 'Please enter a name.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('members')
    .insert({ full_name: name, phone: phone?.trim() || null, company_id: companyId })

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${companyId}`)
  return { success: true }
}

export async function updateMember(data: {
  memberId: string
  companyId: string
  fullName: string
  phone: string
}): Promise<Result> {
  if (!(await canManage(data.companyId))) {
    return { error: 'You can only edit members in your own company.' }
  }
  const name = data.fullName.trim()
  if (!name) return { error: 'Please enter a name.' }

  const supabase = createClient()
  const { error } = await supabase
    .from('members')
    .update({ full_name: name, phone: data.phone.trim() || null })
    .eq('id', data.memberId)
    .eq('company_id', data.companyId) // belt-and-braces alongside RLS

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${data.companyId}`)
  return { success: true }
}

// Soft delete — keeps attendance history and past follow-up cases intact.
export async function removeMember(memberId: string, companyId: string): Promise<Result> {
  if (!(await canManage(companyId))) {
    return { error: 'You can only remove members from your own company.' }
  }
  const supabase = createClient()
  const { error } = await supabase
    .from('members')
    .update({ status: 'inactive' })
    .eq('id', memberId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${companyId}`)
  return { success: true }
}

export async function restoreMember(memberId: string, companyId: string): Promise<Result> {
  if (!(await canManage(companyId))) {
    return { error: 'You can only restore members in your own company.' }
  }
  const supabase = createClient()
  const { error } = await supabase
    .from('members')
    .update({ status: 'active' })
    .eq('id', memberId)
    .eq('company_id', companyId)

  if (error) return { error: error.message }
  revalidatePath(`/more/companies/${companyId}`)
  return { success: true }
}
