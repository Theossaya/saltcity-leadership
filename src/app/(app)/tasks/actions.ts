'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
  title: string
  dueDate?: string
  assignedTo?: string // admins may assign to a leader; defaults to self
}): Promise<{ error: string } | { success: true }> {
  const { userId, profile } = await requireAuth()
  const supabase = createClient()

  const assignedTo =
    data.assignedTo && isAdminOrOffice(profile.role) ? data.assignedTo : userId

  const { error } = await supabase.from('tasks').insert({
    title: data.title,
    created_by: userId,
    assigned_to: assignedTo,
    due_date: data.dueDate || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function toggleTask(
  taskId: string,
  currentStatus: 'open' | 'done'
): Promise<{ error: string } | { success: true }> {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase
    .from('tasks')
    .update({ status: currentStatus === 'open' ? 'done' : 'open' })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTask(taskId: string): Promise<{ error: string } | { success: true }> {
  const supabase = createClient()
  await requireAuth()

  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/tasks')
  return { success: true }
}
