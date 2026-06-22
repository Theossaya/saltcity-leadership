'use client'
import { useEffect } from 'react'

interface Props {
  type: 'success' | 'error'
  message: string
  onDismiss: () => void
}

// Thin transient banner under the header — the app's only feedback surface.
// No toasts, no modals.
export default function FeedbackBanner({ type, message, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className={`px-5 py-3 text-[13px] font-medium tracking-[-0.004em]
                  ${type === 'success' ? 'bg-ok-bg text-ok' : 'bg-urgent-bg text-urgent'}`}
      role="alert"
    >
      {message}
    </div>
  )
}
