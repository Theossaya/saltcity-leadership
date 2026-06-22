export function getCurrentWeek() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)

  const weekStart = toDateString(monday)
  const weekNumber = getISOWeek(monday)
  const year = monday.getFullYear()

  return { weekStart, weekNumber, year }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Local-timezone YYYY-MM-DD (toISOString would shift across midnight UTC). */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(): string {
  return toDateString(new Date())
}

export function formatReportCompletion(report: { status: string } | null): string {
  if (!report) return 'not started'
  if (report.status === 'submitted') return 'submitted'
  if (report.status === 'reviewed') return 'reviewed'
  if (report.status === 'flagged') return 'flagged'
  return 'in progress'
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "Friday, May 30" */
export function formatDayLong(date: Date = new Date()): string {
  return `${DAYS_LONG[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`
}

/** "May 25 — 31" for the week starting at weekStart (a Monday) */
export function formatWeekRange(weekStart: string): string {
  const start = parseDateOnly(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const sameMonth = start.getMonth() === end.getMonth()
  return sameMonth
    ? `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} — ${end.getDate()}`
    : `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} — ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`
}

/** "May 22" from a date or timestamp string */
export function formatShortDate(dateStr: string): string {
  const d = dateStr.includes('T') ? new Date(dateStr) : parseDateOnly(dateStr)
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
}

/** { m: "Jun", d: "01" } for event date blocks */
export function formatEventDate(dateStr: string): { m: string; d: string } {
  const d = parseDateOnly(dateStr)
  return { m: MONTHS_SHORT[d.getMonth()], d: String(d.getDate()).padStart(2, '0') }
}

/** "09:00" from a Postgres time value like "09:00:00" */
export function formatTime(time: string | null): string | null {
  if (!time) return null
  return time.slice(0, 5)
}

/** "3 weeks absent" style relative-age label from a timestamp */
export function formatAge(timestamp: string): string {
  const ms = Date.now() - new Date(timestamp).getTime()
  const days = Math.floor(ms / 86400000)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

/** "Today", "Tomorrow", "Saturday" (within 6 days) or "Jun 18" for task due dates */
export function formatDueLabel(dueDate: string): string {
  const due = parseDateOnly(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return `Was due ${diffDays === -1 ? 'yesterday' : formatShortDate(dueDate)}`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return DAYS_LONG[due.getDay()]
  return formatShortDate(dueDate)
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function firstNameOf(name: string): string {
  return name.split(' ')[0]
}
