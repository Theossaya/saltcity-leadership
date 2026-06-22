'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import Field, { inputCls } from '@/components/ui/Field'
import { createEvent } from '@/app/(app)/more/events/actions'

export default function NewEventForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [audience, setAudience] = useState<'all' | 'leaders' | 'admins'>('all')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onCreate() {
    if (!title.trim() || !date) return
    startTransition(async () => {
      const result = await createEvent({
        title: title.trim(),
        eventDate: date,
        eventTime: time || undefined,
        location: location.trim() || undefined,
        audience,
      })
      if ('error' in result) setError(result.error)
      else router.push('/more/events')
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
          placeholder="Sunday Service · Stewardship"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <div className="flex gap-2.5">
        <div className="flex-1">
          <Field label="Date">
            <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Time">
            <input className={inputCls} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
      </div>

      <Field label="Location">
        <input
          className={inputCls}
          placeholder="Auditorium"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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

      <Button
        variant="berry"
        size="lg"
        full
        onClick={onCreate}
        pending={pending}
        disabled={!title.trim() || !date}
      >
        Add to calendar
      </Button>
    </div>
  )
}
