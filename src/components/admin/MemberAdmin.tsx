'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { inputCls } from '@/components/ui/Field'
import { PlusIcon } from '@/components/ui/Icons'
import { addMember, removeMember } from '@/app/(app)/more/companies/[id]/actions'
import { initialsOf } from '@/lib/utils'

interface Member {
  id: string
  full_name: string
  ring: 'urgent' | 'care' | null
}

interface Props {
  companyId: string
  members: Member[]
  canRemove?: boolean // admin/office only; leaders add but don't remove
}

export default function MemberAdmin({ companyId, members, canRemove = true }: Props) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onAdd() {
    if (!name.trim()) return
    startTransition(async () => {
      const result = await addMember(companyId, name)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setName('')
      setAdding(false)
      router.refresh()
    })
  }

  function onRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMember(memberId, companyId)
      if ('error' in result) setError(result.error)
      setConfirmRemove(null)
      router.refresh()
    })
  }

  return (
    <>
      {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

      <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
        {members.map((m) => (
          <li key={m.id} className="flex gap-[13px] items-center py-[13px] min-h-[52px]">
            <Avatar initials={initialsOf(m.full_name)} size="sm" ring={m.ring ?? undefined} />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-ink tracking-[-0.014em] leading-[1.3] truncate">
                {m.full_name}
              </div>
              <div className="text-[12.5px] text-ink-3 mt-0.5">
                {m.ring === 'urgent' ? (
                  <StatusDot tone="urgent">In care · urgent</StatusDot>
                ) : m.ring === 'care' ? (
                  <StatusDot tone="care">In care</StatusDot>
                ) : (
                  'Active'
                )}
              </div>
            </div>
            {/* Inline confirm flip — no modal. Leaders can't remove. */}
            {!canRemove ? null : confirmRemove === m.id ? (
              <div className="flex gap-1.5 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>
                  Keep
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-urgent"
                  onClick={() => onRemove(m.id)}
                  pending={pending}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRemove(m.id)}
                aria-label={`Remove ${m.full_name}`}
                className="w-9 h-9 -mr-2 flex items-center justify-center text-ink-4 text-[17px] leading-none flex-shrink-0"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="px-5 pt-[14px]">
        {!adding ? (
          <Button variant="ghost" size="lg" full onClick={() => setAdding(true)}>
            <PlusIcon />
            Add a member
          </Button>
        ) : (
          <div className="flex flex-col gap-2.5">
            <input
              className={inputCls}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAdd()}
              autoFocus
            />
            <div className="flex gap-2.5">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                variant="berry"
                size="lg"
                className="flex-[1.5]"
                onClick={onAdd}
                pending={pending}
                disabled={!name.trim()}
              >
                Add member
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
