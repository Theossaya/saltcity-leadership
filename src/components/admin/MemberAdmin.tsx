'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import StatusDot from '@/components/ui/StatusDot'
import Button from '@/components/ui/Button'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import SectionLabel from '@/components/ui/SectionLabel'
import { inputCls } from '@/components/ui/Field'
import { PlusIcon, PhoneIcon } from '@/components/ui/Icons'
import {
  addMember,
  updateMember,
  removeMember,
  restoreMember,
} from '@/app/(app)/more/companies/[id]/actions'
import { initialsOf } from '@/lib/utils'

interface Member {
  id: string
  full_name: string
  phone: string | null
  ring: 'urgent' | 'care' | null
}

interface Props {
  companyId: string
  members: Member[]
  removed?: { id: string; full_name: string }[]
}

export default function MemberAdmin({ companyId, members, removed = [] }: Props) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function openEdit(m: Member) {
    setEditingId(m.id)
    setEditName(m.full_name)
    setEditPhone(m.phone ?? '')
    setConfirmRemove(null)
  }

  function closeEdit() {
    setEditingId(null)
    setConfirmRemove(null)
  }

  function run(fn: () => Promise<{ error: string } | { success: true }>, ok: string) {
    startTransition(async () => {
      const result = await fn()
      if ('error' in result) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setFeedback({ type: 'success', message: ok })
      closeEdit()
      setAdding(false)
      router.refresh()
    })
  }

  return (
    <>
      {feedback && (
        <FeedbackBanner type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
        {members.map((m) => {
          const editing = editingId === m.id
          return (
            <li key={m.id} className="py-[13px]">
              {!editing ? (
                <button
                  onClick={() => openEdit(m)}
                  className="w-full flex gap-[13px] items-center text-left -mx-2 px-2 py-1 rounded-[10px]
                             active:bg-bg-2 transition-colors"
                >
                  <Avatar initials={initialsOf(m.full_name)} size="sm" ring={m.ring ?? undefined} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-ink tracking-[-0.014em] truncate">
                      {m.full_name}
                    </div>
                    <div className="text-[12.5px] text-ink-3 mt-0.5 flex items-center gap-1.5">
                      {m.phone ? (
                        <span className="inline-flex items-center gap-1 text-calm font-medium [&_svg]:w-[13px] [&_svg]:h-[13px]">
                          <PhoneIcon />
                          {m.phone}
                        </span>
                      ) : (
                        <span className="text-ink-4">No phone</span>
                      )}
                      {m.ring === 'urgent' && <StatusDot tone="urgent">In care · urgent</StatusDot>}
                      {m.ring === 'care' && <StatusDot tone="care">In care</StatusDot>}
                    </div>
                  </div>
                  <span className="text-[12.5px] font-semibold text-primary flex-shrink-0">Edit</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <input
                    className={inputCls}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full name"
                    aria-label="Full name"
                    autoFocus
                  />
                  <input
                    className={inputCls}
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone number"
                    aria-label="Phone number"
                  />
                  <div className="flex gap-2.5">
                    <Button variant="ghost" size="lg" className="flex-1" onClick={closeEdit}>
                      Cancel
                    </Button>
                    <Button
                      variant="berry"
                      size="lg"
                      className="flex-[1.5]"
                      pending={pending}
                      disabled={!editName.trim()}
                      onClick={() =>
                        run(
                          () =>
                            updateMember({
                              memberId: m.id,
                              companyId,
                              fullName: editName,
                              phone: editPhone,
                            }),
                          'Member updated.'
                        )
                      }
                    >
                      Save changes
                    </Button>
                  </div>

                  {/* Inline remove confirm — no modal */}
                  {confirmRemove === m.id ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <span className="text-[12.5px] text-ink-2 flex-1">
                        Remove {m.full_name.split(' ')[0]} from this company?
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>
                        Keep
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="!text-urgent"
                        pending={pending}
                        onClick={() => run(() => removeMember(m.id, companyId), 'Member removed.')}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(m.id)}
                      className="text-[12.5px] font-medium text-urgent text-left pt-0.5 active:opacity-60"
                    >
                      Remove from company
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
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
              aria-label="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              className={inputCls}
              type="tel"
              placeholder="Phone number (optional)"
              aria-label="Phone number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && run(() => addMember(companyId, newName, newPhone), 'Member added.')}
            />
            <div className="flex gap-2.5">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                variant="berry"
                size="lg"
                className="flex-[1.5]"
                pending={pending}
                disabled={!newName.trim()}
                onClick={() => run(() => addMember(companyId, newName, newPhone), 'Member added.')}
              >
                Add member
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recover an accidental removal */}
      {removed.length > 0 && (
        <>
          <SectionLabel label="Removed members" action={String(removed.length)} />
          <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
            {removed.map((m) => (
              <li key={m.id} className="flex gap-[13px] items-center py-[13px] opacity-70">
                <Avatar initials={initialsOf(m.full_name)} size="sm" />
                <div className="flex-1 min-w-0 text-[14.5px] text-ink-2 truncate">{m.full_name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  pending={pending}
                  onClick={() => run(() => restoreMember(m.id, companyId), 'Member restored.')}
                >
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
