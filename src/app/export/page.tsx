import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import { getCurrentWeek, formatWeekRange, formatDayLong } from '@/lib/utils'
import { getWeekSummary, statusText } from '@/lib/reports'
import PrintButton from '@/components/admin/PrintButton'

export const metadata = { title: 'Week report — SaltCity Leadership' }

export default async function ExportPage() {
  const { profile } = await requireAuth()
  if (!isAdminOrOffice(profile.role)) redirect('/')

  const supabase = createClient()
  const { weekStart, weekNumber, year } = getCurrentWeek()
  const weekRange = formatWeekRange(weekStart)
  const summary = await getWeekSummary(supabase, weekStart)
  const t = summary.totals

  return (
    <main className="max-w-[840px] mx-auto px-6 py-8 print:py-0 text-ink">
      {/* Controls — hidden when printing */}
      <div className="no-print flex items-center justify-between gap-3 mb-6">
        <Link href="/report" className="text-[13px] text-primary font-semibold">
          ← Back to reports
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="/export/csv"
            className="inline-flex items-center justify-center px-4 py-2 rounded-[10px] bg-transparent
                       text-ink text-[13px] font-medium shadow-[inset_0_0_0_1px_var(--rule-strong)]"
          >
            Download CSV
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Document */}
      <header className="border-b border-[var(--rule-strong)] pb-4 mb-5">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] m-0">
          SaltCity Leadership — Weekly Company Report
        </h1>
        <p className="text-[13.5px] text-ink-2 mt-1">
          Week {weekNumber}, {year} · {weekRange} · generated {formatDayLong()}
        </p>
        <p className="text-[13.5px] text-ink-2 mt-2">
          <b>{t.submitted} of {t.companies}</b> companies submitted · {t.present} present ·{' '}
          {t.absent} absent · {t.openCares} open follow-ups
          {summary.allIn ? ' · all reports in' : ` · ${t.companies - t.submitted} outstanding`}
        </p>
      </header>

      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-ink-3 border-b border-[var(--rule-strong)]">
            <th className="py-2 pr-3 font-semibold">Company</th>
            <th className="py-2 pr-3 font-semibold">Leader</th>
            <th className="py-2 pr-3 font-semibold">Status</th>
            <th className="py-2 pr-3 font-semibold text-right">Present</th>
            <th className="py-2 pr-3 font-semibold text-right">Absent</th>
            <th className="py-2 pr-3 font-semibold text-right">Care</th>
          </tr>
        </thead>
        <tbody>
          {summary.rows.map((r) => (
            <tr key={r.companyId} className="border-b border-[var(--rule)] align-top">
              <td className="py-2.5 pr-3 font-medium">{r.company}</td>
              <td className="py-2.5 pr-3">{r.leader}</td>
              <td className="py-2.5 pr-3">{statusText(r.status)}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums">{r.present}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums">{r.absent}</td>
              <td className="py-2.5 pr-3 text-right tabular-nums">{r.openCares}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detail: absentees + notes per company that has them */}
      {summary.rows.some((r) => r.absentNames.length > 0 || r.notes) && (
        <section className="mt-7">
          <h2 className="text-[15px] font-semibold tracking-[-0.014em] mb-3">Details</h2>
          <div className="flex flex-col gap-3.5">
            {summary.rows
              .filter((r) => r.absentNames.length > 0 || r.notes)
              .map((r) => (
                <div key={r.companyId} className="text-[13px] leading-[1.5]">
                  <div className="font-semibold">{r.company}</div>
                  {r.absentNames.length > 0 && (
                    <div className="text-ink-2">
                      <span className="text-ink-3">Absent:</span> {r.absentNames.join(', ')}
                    </div>
                  )}
                  {r.notes && (
                    <div className="text-ink-2">
                      <span className="text-ink-3">Note:</span> {r.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      <footer className="mt-8 pt-4 border-t border-[var(--rule)] text-[11.5px] text-ink-3">
        SaltCity Leadership · confidential — for church office and lead pastor
      </footer>
    </main>
  )
}
