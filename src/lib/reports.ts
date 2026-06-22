import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { firstNameOf } from './utils'

export type ReportStatusLabel = 'not started' | 'draft' | 'submitted' | 'reviewed' | 'flagged'

export interface CompanyWeekRow {
  companyId: string
  company: string
  leader: string
  status: ReportStatusLabel
  present: number
  absent: number
  absentNames: string[]
  openCares: number
  notes: string | null
}

export interface WeekSummary {
  rows: CompanyWeekRow[]
  totals: {
    companies: number
    submitted: number
    present: number
    absent: number
    openCares: number
  }
  allIn: boolean
}

// Per-company roll-up for a given week. Used by both the print view and the CSV
// route so they never drift. Runs with the caller's session (admin → full access).
export async function getWeekSummary(
  supabase: SupabaseClient<Database>,
  weekStart: string
): Promise<WeekSummary> {
  const [{ data: companies }, { data: leaders }, { data: reports }] = await Promise.all([
    supabase.from('companies').select('id, name').order('name'),
    supabase.from('profiles').select('full_name, company_id').eq('role', 'company_leader'),
    supabase
      .from('weekly_reports')
      .select(
        'id, company_id, status, notes, submitter:profiles!weekly_reports_submitted_by_fkey(full_name)'
      )
      .eq('week_start', weekStart),
  ])

  const reportByCompany = new Map((reports ?? []).map((r) => [r.company_id, r]))
  const leaderByCompany = new Map<string, string>()
  for (const l of leaders ?? []) {
    if (l.company_id && !leaderByCompany.has(l.company_id)) leaderByCompany.set(l.company_id, l.full_name)
  }

  const reportIds = (reports ?? []).map((r) => r.id)
  const presentByReport = new Map<string, number>()
  const absentNamesByReport = new Map<string, string[]>()
  const openCaresByReport = new Map<string, number>()

  if (reportIds.length > 0) {
    const [{ data: attendance }, { data: cases }] = await Promise.all([
      supabase
        .from('attendance_records')
        .select('report_id, present, member:members(full_name)')
        .in('report_id', reportIds),
      supabase.from('follow_up_cases').select('report_id, status').in('report_id', reportIds),
    ])

    for (const a of attendance ?? []) {
      if (a.present) {
        presentByReport.set(a.report_id, (presentByReport.get(a.report_id) ?? 0) + 1)
      } else {
        const list = absentNamesByReport.get(a.report_id) ?? []
        if (a.member?.full_name) list.push(a.member.full_name)
        absentNamesByReport.set(a.report_id, list)
      }
    }
    for (const c of cases ?? []) {
      if (c.status !== 'resolved') {
        openCaresByReport.set(c.report_id, (openCaresByReport.get(c.report_id) ?? 0) + 1)
      }
    }
  }

  const rows: CompanyWeekRow[] = (companies ?? []).map((c) => {
    const report = reportByCompany.get(c.id)
    const absentNames = report ? (absentNamesByReport.get(report.id) ?? []) : []
    return {
      companyId: c.id,
      company: c.name,
      leader: leaderByCompany.get(c.id) ?? '—',
      status: (report?.status ?? 'not started') as ReportStatusLabel,
      present: report ? (presentByReport.get(report.id) ?? 0) : 0,
      absent: absentNames.length,
      absentNames,
      openCares: report ? (openCaresByReport.get(report.id) ?? 0) : 0,
      notes: report?.notes ?? null,
    }
  })

  const submitted = rows.filter((r) => r.status !== 'not started' && r.status !== 'draft').length
  return {
    rows,
    totals: {
      companies: rows.length,
      submitted,
      present: rows.reduce((n, r) => n + r.present, 0),
      absent: rows.reduce((n, r) => n + r.absent, 0),
      openCares: rows.reduce((n, r) => n + r.openCares, 0),
    },
    allIn: rows.length > 0 && submitted === rows.length,
  }
}

const STATUS_TEXT: Record<ReportStatusLabel, string> = {
  'not started': 'Not started',
  draft: 'In progress',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
}

export function statusText(status: ReportStatusLabel): string {
  return STATUS_TEXT[status]
}

function csvCell(value: string | number): string {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function weekSummaryToCsv(summary: WeekSummary, weekNumber: number, weekRange: string): string {
  const lines: string[] = []
  lines.push(csvCell(`SaltCity Leadership — Week ${weekNumber} (${weekRange})`))
  lines.push(
    [
      'Company',
      'Leader',
      'Status',
      'Present',
      'Absent',
      'Absentees',
      'Open follow-ups',
      'Notes',
    ]
      .map(csvCell)
      .join(',')
  )
  for (const r of summary.rows) {
    lines.push(
      [
        r.company,
        r.leader,
        statusText(r.status),
        r.present,
        r.absent,
        r.absentNames.join('; '),
        r.openCares,
        r.notes ?? '',
      ]
        .map(csvCell)
        .join(',')
    )
  }
  lines.push('')
  lines.push(
    [
      'TOTAL',
      `${summary.totals.submitted}/${summary.totals.companies} in`,
      '',
      summary.totals.present,
      summary.totals.absent,
      '',
      summary.totals.openCares,
      '',
    ]
      .map(csvCell)
      .join(',')
  )
  return lines.join('\n')
}

export { firstNameOf }
