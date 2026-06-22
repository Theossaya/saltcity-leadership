'use client'
import { useState, useTransition } from 'react'
import Button from '@/components/ui/Button'
import Field, { inputCls } from '@/components/ui/Field'
import { signIn } from './actions'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3.5">
      <Field label="Email">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@saltcity.church"
          className={inputCls}
        />
      </Field>
      <Field label="Password" error={error ?? undefined}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Your password"
          className={inputCls}
        />
      </Field>
      <Button type="submit" variant="berry" size="lg" full pending={pending} className="mt-3.5">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
      <button
        type="button"
        className="bg-transparent border-0 text-ink-3 text-[13px] font-medium cursor-pointer mt-0.5"
      >
        Forgot password
      </button>
    </form>
  )
}
