'use server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function saveSubscription(sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<{ error: string } | { success: true }> {
  const { userId } = await requireAuth()
  const supabase = createClient()

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: 'endpoint' }
  )
  if (error) return { error: error.message }
  return { success: true }
}

export async function removeSubscription(
  endpoint: string
): Promise<{ error: string } | { success: true }> {
  await requireAuth()
  const supabase = createClient()
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  if (error) return { error: error.message }
  return { success: true }
}
