'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createEvent(data: {
  title: string
  eventDate: string
  eventTime?: string
  location?: string
  description?: string
  audience: 'all' | 'leaders' | 'admins'
}): Promise<{ error: string } | { success: true }> {
  const { profile } = await requireAuth()
  if (profile.role !== 'church_admin') return { error: 'Only the church admin can create events.' }

  const supabase = createClient()
  const { error } = await supabase.from('events').insert({
    title: data.title,
    event_date: data.eventDate,
    event_time: data.eventTime || null,
    location: data.location || null,
    description: data.description || null,
    audience: data.audience,
    created_by: profile.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/more/events')
  revalidatePath('/')
  return { success: true }
}
