'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAnnouncement(data: {
  title: string
  body: string
  priority: 'normal' | 'urgent'
  audience: 'all' | 'leaders' | 'admins'
}): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') return { error: 'Only the church admin can publish notices.' }

  const supabase = createClient()
  const { error } = await supabase.from('announcements').insert({
    title: data.title,
    body: data.body,
    priority: data.priority,
    audience: data.audience,
    published_by: profile.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/more/announcements')
  revalidatePath('/')
  return { success: true }
}
