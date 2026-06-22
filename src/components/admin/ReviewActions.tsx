'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { textareaCls } from '@/components/ui/Field'
import { reviewReport, flagReport } from '@/app/(app)/report/actions'

interface Props {
  reportId: string
  status: 'submitted' | 'reviewed' | 'flagged'
}

// Inline state flip for "send back" — no modal.
export default function ReviewActions({ reportId, status }: Props) {
  const router = useRouter()
  const [sendingBack, setSendingBack] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onApprove() {
    startTransition(async () => {
      const result = await reviewReport(reportId)
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function onSendBack() {
    startTransition(async () => {
      const result = await flagReport(reportId, reason.trim())
      if ('error' in result) setError(result.error)
      else {
        setSendingBack(false)
        setReason('')
        router.refresh()
      }
    })
  }

  return (
    <div className="mt-4">
      {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {!sendingBack ? (
        <div className="px-5">
          <div className="flex gap-2.5">
            {status !== 'reviewed' && (
              <Button variant="berry" size="lg" className="flex-[1.5]" onClick={onApprove} pending={pending}>
                {status === 'flagged' ? 'Approve now' : 'Approve report'}
              </Button>
            )}
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => setSendingBack(true)}>
              {status === 'flagged' ? 'Edit note' : 'Send back'}
            </Button>
          </div>
          <p className="text-[11.5px] text-ink-3 mt-2 leading-[1.4]">
            <b className="text-ink-2 font-semibold">Approve</b> accepts the report.{' '}
            <b className="text-ink-2 font-semibold">Send back</b> returns it to the leader with a note
            about what to fix.
          </p>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-2.5">
          <label className="text-[13px] font-medium text-ink-2">
            What should the leader fix? They&rsquo;ll see this note.
          </label>
          <textarea
            className={textareaCls}
            placeholder="e.g. Please add a reason for the members marked absent."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2.5">
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => setSendingBack(false)}>
              Cancel
            </Button>
            <Button variant="berry" size="lg" className="flex-[1.5]" onClick={onSendBack} pending={pending}>
              Send back to leader
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
