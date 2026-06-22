import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// User id from the JWT `sub` claim — no network, and (unlike reading
// session.user) no "getSession is insecure" warning spamming server logs.
function userIdFromToken(accessToken: string): string | null {
  try {
    const payload = accessToken.split('.')[1]
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return (JSON.parse(json).sub as string) ?? null
  } catch {
    return null
  }
}

// Wrapped in React.cache so the layout and the page (which both call this during
// one request) share a single profile query instead of doing it twice.
//
// Reads the session from the cookie (getSession, no network) rather than calling
// getUser() (an Auth-server round-trip). Safe because middleware runs getUser()
// on every matched request and redirects unauthenticated traffic to /login
// BEFORE the page renders — so the cookie was already validated this request.
// Removes one Supabase round-trip per navigation.
export const requireAuth = cache(async function requireAuth(): Promise<{
  userId: string
  profile: Profile
}> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session ? userIdFromToken(session.access_token) : null
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) redirect('/login')
  return { userId, profile }
})

export function isAdminOrOffice(role: Profile['role']) {
  return role === 'church_admin' || role === 'church_office'
}

export function isLeader(role: Profile['role']) {
  return role === 'company_leader' || role === 'assistant_leader'
}
