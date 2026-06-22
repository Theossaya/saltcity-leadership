'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { textareaCls } from '@/components/ui/Field'
import { PhoneIcon, SendIcon, HeartIcon } from '@/components/ui/Icons'
import { recordContact, resolveCase, escalateCase } from '@/app/(app)/care/actions'

type Method = 'called' | 'messaged' | 'visited'

const methods: { id: Method; label: string; Icon: typeof PhoneIcon }[] = [
  { id: 'called', label: 'Called', Icon: PhoneIcon },
  { id: 'messaged', label: 'Messaged', Icon: SendIcon },
  { id: 'visited', label: 'Visited', Icon: HeartIcon },
]

interface Props {
  caseId: string
  /** Show the "ask office for help" action (leader on their own, not-yet-escalated case). */
  showEscalate?: boolean
}

export default function CaseActions({ caseId, showEscalate }: Props) {
  const router = useRouter()
  const [method, setMethod] = useState<Method | null>(null)
  const [note, setNote] = useState('')
  const [escalating, setEscalating] = useState(false)
  const [escalateNote, setEscalateNote] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function onSave() {
    if (!method) return
    startTransition(async () => {
      const result = await recordContact({ caseId, method, note: note.trim() || undefined })
      if ('error' in result) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setMethod(null)
      setNote('')
      setFeedback({ type: 'success', message: 'Contact recorded.' })
      router.refresh()
    })
  }

  function onResolve() {
    startTransition(async () => {
      const result = await resolveCase(caseId)
      if ('error' in result) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setFeedback({ type: 'success', message: 'Marked back in touch.' })
      router.refresh()
    })
  }

  function onEscalate() {
    startTransition(async () => {
      const result = await escalateCase({ caseId, note: escalateNote.trim() || undefined })
      if ('error' in result) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setEscalating(false)
      setEscalateNote('')
      setFeedback({ type: 'success', message: 'Sent to the office for help.' })
      router.refresh()
    })
  }

  return (
    <div className="mt-3.5">
      {feedback && (
        <div className="mb-2.5 -mx-[18px]">
          <FeedbackBanner type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
        </div>
      )}

      <div className="text-[13px] font-medium text-ink-2 mb-2">Log how you reached out</div>
      <div className="flex gap-2 mb-3.5">
        {methods.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className={`flex-1 ${method === id ? '!bg-primary !text-primary-ink !shadow-none' : ''}`}
            aria-pressed={method === id}
            onClick={() => setMethod(method === id ? null : id)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>

      {method && (
        <textarea
          className={`${textareaCls} mb-3.5 !min-h-[64px]`}
          placeholder="How did it go? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <Button variant="ghost" size="lg" className="flex-1" onClick={onResolve} pending={pending}>
          Back in touch
        </Button>
        <Button
          variant="berry"
          size="lg"
          className="flex-[1.2]"
          onClick={onSave}
          pending={pending}
          disabled={!method}
        >
          Save update
        </Button>
      </div>

      {showEscalate &&
        (escalating ? (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              className={`${textareaCls} !min-h-[60px]`}
              placeholder="What kind of help do you need from the office? (optional)"
              value={escalateNote}
              onChange={(e) => setEscalateNote(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setEscalating(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" className="flex-1" onClick={onEscalate} pending={pending}>
                Send to office
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEscalating(true)}
            className="mt-3 w-full text-center text-[12.5px] font-medium text-accent active:opacity-60 transition-opacity"
          >
            Need extra support? Ask the office for help →
          </button>
        ))}
    </div>
  )
}
