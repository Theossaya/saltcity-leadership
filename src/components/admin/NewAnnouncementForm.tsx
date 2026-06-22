'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import Field, { inputCls, textareaCls } from '@/components/ui/Field'
import { createAnnouncement } from '@/app/(app)/more/announcements/actions'

export default function NewAnnouncementForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [audience, setAudience] = useState<'all' | 'leaders' | 'admins'>('all')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onPublish() {
    if (!title.trim() || !body.trim()) return
    startTransition(async () => {
      const result = await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        priority: urgent ? 'urgent' : 'normal',
        audience,
      })
      if ('error' in result) setError(result.error)
      else router.push('/more/announcements')
    })
  }

  return (
    <div className="px-5 pt-4 flex flex-col gap-3.5">
      {error && (
        <div className="-mx-5">
          <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <Field label="Title">
        <input
          className={inputCls}
          placeholder="Short and clear"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field label="Message">
        <textarea
          className={textareaCls}
          placeholder="What do leaders need to know?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Field>

      <Field label="Audience">
        <select
          className={inputCls}
          value={audience}
          onChange={(e) => setAudience(e.target.value as typeof audience)}
        >
          <option value="all">Everyone</option>
          <option value="leaders">Company leaders</option>
          <option value="admins">Admins only</option>
        </select>
      </Field>

      <label className="flex items-center gap-2.5 text-[14px] text-ink-2 font-medium py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={urgent}
          onChange={(e) => setUrgent(e.target.checked)}
          className="w-[18px] h-[18px] accent-[var(--urgent)]"
        />
        Urgent — pin at the top
      </label>

      <Button
        variant="berry"
        size="lg"
        full
        onClick={onPublish}
        pending={pending}
        disabled={!title.trim() || !body.trim()}
      >
        Publish notice
      </Button>
    </div>
  )
}
