import { createClient } from '@/lib/supabase/server'
import { isAdminOrOffice } from '@/lib/auth'
import { getCurrentService, getRecentServices } from '@/lib/utils'
import { getWeekSummary, weekSummaryToCsv } from '@/lib/reports'

export async function GET(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !isAdminOrOffice(profile.role)) {
    return new Response('Forbidden', { status: 403 })
  }

  const param = new URL(request.url).searchParams.get('service')
  const service = getRecentServices(6).find((s) => s.date === param) ?? getCurrentService()

  const summary = await getWeekSummary(supabase, service.date)
  const csv = weekSummaryToCsv(summary, service.longLabel)

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="saltcity-${service.type}-${service.date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
