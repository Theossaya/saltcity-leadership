'use client'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Greeting from '@/components/ui/Greeting'
import SectionLabel from '@/components/ui/SectionLabel'
import MemberGrid from '@/components/ui/MemberGrid'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { textareaCls } from '@/components/ui/Field'
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
  initialAbsentIds: string[]
  initialNotes: string
}

export default function ReportForm({
  companyId,
  weekStart,
  weekNumber,
  year,
  weekRange,
  members,
  initialReportId,
  initialAbsentIds,
  initialNotes,
}: Props) {
  const router = useRouter()
  const [absentIds, setAbsentIds] = useState<string[]>(initialAbsentIds)
  const [notes, setNotes] = useState(initialNotes)
  const [reportId, setReportId] = useState(initialReportId)
  const [savedAt, setSavedAt] = useState<Date | null>(initialReportId ? new Date() : null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, startSaving] = useTransition()
  const [submitting, startSubmitting] = useTransition()

  // Latest form values for the autosave timer without re-arming it on every keystroke
  const latest = useRef({ absentIds, notes, reportId })
  latest.current = { absentIds, notes, reportId }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSave = useCallback(async () => {
    const { absentIds, notes, reportId } = latest.current
    const result = await saveDraft({
      reportId,
      companyId,
      weekStart,
      weekNumber,
      year,
      absentIds,
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

  function toggleMember(id: string) {
    setAbsentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
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

  const presentCount = members.length - absentIds.length
  const busy = saving || submitting

  return (
    <>
      {feedback && (
        <FeedbackBanner type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      <Greeting day={`Week ${weekNumber} · ${weekRange}`}>
        Mark <em>absentees.</em>
      </Greeting>

      <div className="px-5 pt-3 flex gap-[26px]">
        <Count value={presentCount} suffix={`/${members.length}`} label="Present" />
        <Count value={absentIds.length} label="Absent" urgent={absentIds.length > 0} />
      </div>

      <SectionLabel label="Tap anyone who was away" />
      <MemberGrid members={members} absentIds={absentIds} onToggle={toggleMember} disabled={busy} />

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
  urgent,
}: {
  value: number
  suffix?: string
  label: string
  urgent?: boolean
}) {
  return (
    <div className="flex flex-col gap-[3px] min-w-0">
      <div
        className={`text-[24px] font-medium tracking-[-0.024em] leading-none tabular-nums ${urgent ? 'text-urgent' : 'text-ink'}`}
      >
        {value}
        {suffix && <small className="text-[13px] text-ink-3 font-medium">{suffix}</small>}
      </div>
      <div className="text-[12px] text-ink-3 tracking-[-0.004em]">{label}</div>
    </div>
  )
}
