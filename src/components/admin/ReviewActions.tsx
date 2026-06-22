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

// Inline state flip for flagging — no modal.
export default function ReviewActions({ reportId, status }: Props) {
  const router = useRouter()
  const [flagging, setFlagging] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onReview() {
    startTransition(async () => {
      const result = await reviewReport(reportId)
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function onFlag() {
    startTransition(async () => {
      const result = await flagReport(reportId, reason.trim())
      if ('error' in result) setError(result.error)
      else {
        setFlagging(false)
        setReason('')
        router.refresh()
      }
    })
  }

  return (
    <div className="mt-4">
      {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {!flagging ? (
        <div className="px-5 flex gap-2.5">
          {status !== 'reviewed' && (
            <Button variant="berry" size="lg" className="flex-[1.5]" onClick={onReview} pending={pending}>
              Mark reviewed
            </Button>
          )}
          {status !== 'flagged' && (
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => setFlagging(true)}>
              Flag
            </Button>
          )}
          {status === 'flagged' && (
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => setFlagging(true)}>
              Edit flag
            </Button>
          )}
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-2.5">
          <textarea
            className={textareaCls}
            placeholder="Why is this report being flagged? The leader will see this."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2.5">
            <Button variant="ghost" size="lg" className="flex-1" onClick={() => setFlagging(false)}>
              Cancel
            </Button>
            <Button variant="berry" size="lg" className="flex-[1.5]" onClick={onFlag} pending={pending}>
              Flag report
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
