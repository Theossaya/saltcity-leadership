import { createClient } from '@/lib/supabase/server'
import { isAdminOrOffice } from '@/lib/auth'
import { getCurrentWeek, formatWeekRange } from '@/lib/utils'
import { getWeekSummary, weekSummaryToCsv } from '@/lib/reports'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !isAdminOrOffice(profile.role)) {
    return new Response('Forbidden', { status: 403 })
  }

  const { weekStart, weekNumber } = getCurrentWeek()
  const summary = await getWeekSummary(supabase, weekStart)
  const csv = weekSummaryToCsv(summary, weekNumber, formatWeekRange(weekStart))

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="saltcity-week-${weekNumber}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
