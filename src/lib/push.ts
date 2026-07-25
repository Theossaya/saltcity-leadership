import 'server-only'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

// Configured lazily so the app runs fine when VAPID env vars aren't set yet
// (push simply no-ops until they're configured in the environment).
let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@saltcity.church'
  if (!pub || !priv) return false
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

// Sends a push to the given users. Best-effort: never throws into the caller,
// so a notification failure can't break the action that triggered it.
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  try {
    const targets = Array.from(new Set(userIds)).filter(Boolean)
    if (targets.length === 0 || !ensureConfigured()) return

    const supabase = createClient()
    const { data: subs } = await supabase.rpc('get_push_targets', { target_users: targets })
    if (!subs || subs.length === 0) return

    const body = JSON.stringify(payload)
    await Promise.allSettled(
      subs.map((s) =>
        webpush
          .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body)
          .catch(async (err: unknown) => {
            const code = (err as { statusCode?: number })?.statusCode
            // 404/410 = subscription gone; drop it (best-effort; RLS may block).
            if (code === 404 || code === 410) {
              await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
            }
          })
      )
    )
  } catch {
    // swallow — notifications are non-critical
  }
}
