import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { getCurrentWeek, toDateString, formatShortDate } from '@/lib/utils'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import BarChart from '@/components/ui/BarChart'

function mondayString(weekStart: string, weeksAgo: number): string {
  const [y, m, d] = weekStart.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - weeksAgo * 7)
  return toDateString(dt)
}

export default async function TrendsPage() {
  const { profile } = await requireAuth()
  if (!isAdminOrOffice(profile.role)) redirect('/')

  const supabase = createClient()
  const { weekStart } = getCurrentWeek()

  // Last 8 weeks (oldest -> newest)
  const weeks = Array.from({ length: 8 }, (_, i) => mondayString(weekStart, 7 - i))
  const windowStart = weeks[0]

  const [{ count: companyCount }, { data: reports }, { count: openCares }] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase
      .from('weekly_reports')
      .select('id, week_start, status, company_id, company:companies(name)')
      .gte('week_start', windowStart)
      .neq('status', 'draft'),
    supabase
      .from('follow_up_cases')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'assigned', 'active']),
  ])

  const reportList = reports ?? []
  const reportIds = reportList.map((r) => r.id)

  let attendance: { report_id: string; present: boolean }[] = []
  if (reportIds.length > 0) {
    const { data } = await supabase
      .from('attendance_records')
      .select('report_id, present')
      .in('report_id', reportIds)
    attendance = data ?? []
  }

  // present/total per report
  const perReport = new Map<string, { present: number; total: number }>()
  for (const a of attendance) {
    const r = perReport.get(a.report_id) ?? { present: 0, total: 0 }
    r.total += 1
    if (a.present) r.present += 1
    perReport.set(a.report_id, r)
  }

  const totalCompanies = companyCount ?? 0

  // Per-week: attendance % + how many groups submitted
  const weekAgg = new Map<string, { present: number; total: number; submitted: number }>()
  for (const w of weeks) weekAgg.set(w, { present: 0, total: 0, submitted: 0 })
  for (const r of reportList) {
    const agg = weekAgg.get(r.week_start)
    if (!agg) continue
    agg.submitted += 1
    const pr = perReport.get(r.id)
    if (pr) {
      agg.present += pr.present
      agg.total += pr.total
    }
  }

  const attendanceBars = weeks.map((w) => {
    const a = weekAgg.get(w)!
    const pct = a.total > 0 ? Math.round((a.present / a.total) * 100) : 0
    return { label: formatShortDate(w).replace(' ', ' '), value: pct, display: a.total > 0 ? `${pct}%` : '–', muted: a.total === 0 }
  })

  const submissionBars = weeks.map((w) => {
    const a = weekAgg.get(w)!
    return { label: formatShortDate(w).replace(' ', ' '), value: a.submitted, display: String(a.submitted), muted: a.submitted === 0 }
  })

  // This week
  const thisWeek = weekAgg.get(weekStart)!
  const thisWeekPct = thisWeek.total > 0 ? Math.round((thisWeek.present / thisWeek.total) * 100) : 0

  // Groups to watch — lowest attendance this week (among those who submitted)
  const groupsThisWeek = reportList
    .filter((r) => r.week_start === weekStart)
    .map((r) => {
      const pr = perReport.get(r.id) ?? { present: 0, total: 0 }
      const pct = pr.total > 0 ? Math.round((pr.present / pr.total) * 100) : 0
      return { name: r.company?.name ?? 'Group', pct, absent: pr.total - pr.present }
    })
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 6)

  const hasData = reportList.length > 0

  return (
    <>
      <Greeting>Trends.</Greeting>

      <div className="px-5 pt-3 grid grid-cols-3 gap-3">
        <Stat value={`${thisWeek.submitted}/${totalCompanies}`} label="Reports in" />
        <Stat value={thisWeek.total > 0 ? `${thisWeekPct}%` : '–'} label="Attendance" />
        <Stat value={String(openCares ?? 0)} label="In care" />
      </div>

      {!hasData ? (
        <p className="mx-5 mt-6 text-[13px] text-ink-3 leading-[1.5]">
          No reports yet. As group leaders submit their weekly reports, attendance trends, reporting
          compliance and groups to watch will appear here.
        </p>
      ) : (
        <>
          <SectionLabel label="Attendance — last 8 weeks" />
          <BarChart bars={attendanceBars} max={100} />

          <SectionLabel label="Groups reporting each week" />
          <BarChart bars={submissionBars} max={totalCompanies || undefined} />

          {groupsThisWeek.length > 0 && (
            <>
              <SectionLabel label="Groups to watch this week" />
              <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
                {groupsThisWeek.map((g) => (
                  <li key={g.name} className="flex items-center justify-between gap-3 py-[13px]">
                    <span className="text-[14.5px] font-medium text-ink truncate">{g.name}</span>
                    <span
                      className={`text-[13px] font-semibold tabular-nums flex-shrink-0 ${
                        g.pct < 60 ? 'text-urgent' : g.pct < 80 ? 'text-care' : 'text-ok'
                      }`}
                    >
                      {g.pct}% · {g.absent} away
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <div className="px-5 pt-6">
        <p className="text-[11.5px] text-ink-3 text-center font-serif italic">
          Trends update as reports come in each week.
        </p>
      </div>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface rounded-card px-3 py-3 shadow-lift">
      <div className="text-[22px] font-medium text-ink tracking-[-0.02em] tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[11.5px] text-ink-3 mt-1.5">{label}</div>
    </div>
  )
}
