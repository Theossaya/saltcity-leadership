'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import Field, { inputCls, textareaCls } from '@/components/ui/Field'
import { assignCase } from '@/app/(app)/care/actions'

interface Props {
  caseId: string
  leaders: { id: string; full_name: string }[]
  initialUrgency: 'normal' | 'urgent'
}

export default function AssignCaseForm({ caseId, leaders, initialUrgency }: Props) {
  const router = useRouter()
  const [assignTo, setAssignTo] = useState('')
  const [urgent, setUrgent] = useState(initialUrgency === 'urgent')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onAssign() {
    if (!assignTo) return
    startTransition(async () => {
      const result = await assignCase({
        caseId,
        assignTo,
        urgency: urgent ? 'urgent' : 'normal',
        contextNote: note.trim() || undefined,
      })
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="mt-3.5 flex flex-col gap-3">
      {error && (
        <div className="-mx-[18px]">
          <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <Field label="Assign to">
        <select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} className={inputCls}>
          <option value="">Choose a leader…</option>
          {leaders.map((l) => (
            <option key={l.id} value={l.id}>
              {l.full_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Context for the leader">
        <textarea
          className={`${textareaCls} !min-h-[64px]`}
          placeholder="Anything they should know before reaching out. (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2.5 text-[14px] text-ink-2 font-medium py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="w-[18px] h-[18px] accent-[var(--urgent)]"
        />
        Mark as urgent
      </label>

      <Button variant="berry" size="lg" full onClick={onAssign} pending={pending} disabled={!assignTo}>
        Assign case
      </Button>
    </div>
  )
}
