'use client'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import MemberGrid from '@/components/ui/MemberGrid'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { inputCls, textareaCls } from '@/components/ui/Field'
import { initialsOf } from '@/lib/utils'
import { SendIcon } from '@/components/ui/Icons'
import { saveDraft, submitReport } from '@/app/(app)/report/actions'

const AUTOSAVE_DEBOUNCE_MS = 2 * 60 * 1000 // 2-minute debounce per handoff

interface Member {
  id: string
  full_name: string
}

interface Props {
  companyId: string
  weekStart: string
  weekNumber: number
  year: number
  weekRange: string
  members: Member[]
  initialReportId?: string
  initialPresentIds: string[]
  initialReasons: Record<string, string>
  initialNotes: string
  sentBackReason?: string | null
}

export default function ReportForm({
  companyId,
  weekStart,
  weekNumber,
  year,
  weekRange,
  members,
  initialReportId,
  initialPresentIds,
  initialReasons,
  initialNotes,
  sentBackReason,
}: Props) {
  const router = useRouter()
  const [presentIds, setPresentIds] = useState<string[]>(initialPresentIds)
  const [reasons, setReasons] = useState<Record<string, string>>(initialReasons)
  const [notes, setNotes] = useState(initialNotes)
  const [reportId, setReportId] = useState(initialReportId)
  const [savedAt, setSavedAt] = useState<Date | null>(initialReportId ? new Date() : null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, startSaving] = useTransition()
  const [submitting, startSubmitting] = useTransition()

  const presentSet = useMemo(() => new Set(presentIds), [presentIds])
  const absentees = useMemo(() => members.filter((m) => !presentSet.has(m.id)), [members, presentSet])

  // Latest values for the autosave timer without re-arming on every keystroke
  const latest = useRef({ presentIds, reasons, notes, reportId })
  latest.current = { presentIds, reasons, notes, reportId }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSave = useCallback(async () => {
    const { presentIds, reasons, notes, reportId } = latest.current
    const result = await saveDraft({
      reportId,
      companyId,
      weekStart,
      weekNumber,
      year,
      presentIds,
      reasons,
      notes,
    })
    if ('error' in result) {
      setFeedback({ type: 'error', message: result.error })
      return null
    }
    setReportId(result.reportId)
    setSavedAt(new Date())
    return result.reportId
  }, [companyId, weekStart, weekNumber, year])

  const scheduleAutosave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      startSaving(async () => {
        await doSave()
      })
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [doSave])

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function togglePresent(id: string) {
    setPresentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    scheduleAutosave()
  }

  function markAllPresent() {
    setPresentIds(members.map((m) => m.id))
    scheduleAutosave()
  }

  function clearAll() {
    setPresentIds([])
    scheduleAutosave()
  }

  function setReason(memberId: string, value: string) {
    setReasons((prev) => ({ ...prev, [memberId]: value }))
    scheduleAutosave()
  }

  function onSave() {
    if (timer.current) clearTimeout(timer.current)
    startSaving(async () => {
      const id = await doSave()
      if (id) setFeedback({ type: 'success', message: 'Draft saved.' })
    })
  }

  function onSubmit() {
    if (timer.current) clearTimeout(timer.current)
    startSubmitting(async () => {
      const id = await doSave()
      if (!id) return
      const result = await submitReport(id)
      if ('error' in result) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      router.refresh()
    })
  }

  const allPresent = presentIds.length === members.length && members.length > 0
  const busy = saving || submitting

  return (
    <>
      {feedback && (
        <FeedbackBanner type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
        Who was <em>here?</em>
      </Greeting>

      {sentBackReason && (
        <div className="mx-5 mt-3 px-3.5 py-3 bg-care-bg rounded-input text-[13px] text-care font-medium leading-[1.45]">
          The office sent this back: {sentBackReason}
        </div>
      )}

      <div className="px-5 pt-3 flex items-center justify-between gap-3">
        <div className="flex gap-[26px]">
          <Count value={presentIds.length} suffix={`/${members.length}`} label="Present" tone="ok" />
          <Count value={absentees.length} label="Absent" tone={absentees.length > 0 ? 'urgent' : undefined} />
        </div>
        <Button variant="ghost" size="sm" onClick={allPresent ? clearAll : markAllPresent} disabled={busy}>
          {allPresent ? 'Clear all' : 'All present'}
        </Button>
      </div>

      <SectionLabel label="Tap everyone who attended" />
      <MemberGrid
        members={members}
        selectedIds={presentIds}
        onToggle={togglePresent}
        disabled={busy}
        tone="present"
      />

      {absentees.length > 0 && (
        <>
          <SectionLabel label="Absent — add a reason (optional)" />
          <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
            {absentees.map((m) => (
              <li key={m.id} className="flex gap-[11px] items-center py-2.5">
                <span className="w-7 h-7 rounded-full bg-bg-2 text-ink-2 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {initialsOf(m.full_name)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate leading-tight mb-1">
                    {m.full_name}
                  </div>
                  <input
                    className={`${inputCls} !py-2 !text-[13px]`}
                    placeholder="e.g. travelling, unwell, no reason yet"
                    value={reasons[m.id] ?? ''}
                    onChange={(e) => setReason(m.id, e.target.value)}
                    disabled={busy}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionLabel label="Anything to share?" />
      <div className="px-5">
        <textarea
          className={textareaCls}
          placeholder="A short note for the office — testimony, need, or word for the week."
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            scheduleAutosave()
          }}
        />
      </div>

      <div className="px-5 pt-[18px] flex gap-2.5">
        <Button variant="ghost" size="lg" className="flex-1" onClick={onSave} pending={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="berry" size="lg" className="flex-[1.5]" onClick={onSubmit} pending={submitting}>
          <SendIcon />
          {submitting ? 'Submitting…' : 'Submit report'}
        </Button>
      </div>
      <div className="px-5 pt-[11px] text-center text-[11.5px] text-ink-3" aria-live="polite">
        {savedAt
          ? `Auto-saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Not saved yet'}
      </div>
    </>
  )
}

function Count({
  value,
  suffix,
  label,
  tone,
}: {
  value: number
  suffix?: string
  label: string
  tone?: 'ok' | 'urgent'
}) {
  const color = tone === 'urgent' ? 'text-urgent' : tone === 'ok' ? 'text-ok' : 'text-ink'
  return (
    <div className="flex flex-col gap-[3px] min-w-0">
      <div className={`text-[24px] font-medium tracking-[-0.024em] leading-none tabular-nums ${color}`}>
        {value}
        {suffix && <small className="text-[13px] text-ink-3 font-medium">{suffix}</small>}
      </div>
      <div className="text-[12px] text-ink-3 tracking-[-0.004em]">{label}</div>
    </div>
  )
}
