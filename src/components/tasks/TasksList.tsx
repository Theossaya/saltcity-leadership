'use client'
import { useOptimistic, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import SectionLabel from '@/components/ui/SectionLabel'
import Check from '@/components/ui/Check'
import Button from '@/components/ui/Button'
import StatusDot from '@/components/ui/StatusDot'
import FeedbackBanner from '@/components/ui/FeedbackBanner'
import { inputCls } from '@/components/ui/Field'
import { PlusIcon } from '@/components/ui/Icons'
import { createTask, toggleTask, deleteTask } from '@/app/(app)/tasks/actions'
import { todayString, formatDueLabel, firstNameOf } from '@/lib/utils'

interface Task {
  id: string
  title: string
  due_date: string | null
  status: 'open' | 'done'
  fromName: string | null
}

interface Props {
  tasks: Task[]
  leaders?: { id: string; full_name: string }[]
}

export default function TasksList({ tasks, leaders }: Props) {
  const router = useRouter()
  const [optimisticTasks, applyToggle] = useOptimistic(tasks, (state, taskId: string) =>
    state.map((t) =>
      t.id === taskId ? { ...t, status: t.status === 'open' ? ('done' as const) : ('open' as const) } : t
    )
  )
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignTo, setAssignTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [creating, startCreating] = useTransition()

  const today = todayString()
  const overdue = optimisticTasks.filter((t) => t.status === 'open' && t.due_date && t.due_date < today)
  const openTasks = optimisticTasks.filter(
    (t) => t.status === 'open' && (!t.due_date || t.due_date >= today)
  )
  const doneTasks = optimisticTasks.filter((t) => t.status === 'done')

  function onToggle(task: Task) {
    startTransition(async () => {
      applyToggle(task.id)
      const result = await toggleTask(task.id, task.status)
      if ('error' in result) setError(result.error)
      router.refresh()
    })
  }

  function onDelete(taskId: string) {
    startTransition(async () => {
      const result = await deleteTask(taskId)
      if ('error' in result) setError(result.error)
      router.refresh()
    })
  }

  function onCreate() {
    if (!title.trim()) return
    startCreating(async () => {
      const result = await createTask({
        title: title.trim(),
        dueDate: dueDate || undefined,
        assignedTo: assignTo || undefined,
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      setTitle('')
      setDueDate('')
      setAssignTo('')
      setAdding(false)
      router.refresh()
    })
  }

  return (
    <>
      {error && <FeedbackBanner type="error" message={error} onDismiss={() => setError(null)} />}

      {overdue.length > 0 && (
        <>
          <SectionLabel label="Overdue" />
          <TaskGroup tasks={overdue} onToggle={onToggle} onDelete={onDelete} overdue />
        </>
      )}

      <SectionLabel label="This week" />
      {openTasks.length > 0 ? (
        <TaskGroup tasks={openTasks} onToggle={onToggle} onDelete={onDelete} />
      ) : (
        <p className="mx-5 my-0 text-[13px] text-ink-3">Nothing open. Add a task below.</p>
      )}

      {doneTasks.length > 0 && (
        <>
          <SectionLabel label="Done" />
          <TaskGroup tasks={doneTasks} onToggle={onToggle} onDelete={onDelete} />
        </>
      )}

      <div className="px-5 pt-[18px]">
        {!adding ? (
          <Button variant="ghost" size="lg" full onClick={() => setAdding(true)}>
            <PlusIcon />
            Add a task
          </Button>
        ) : (
          <div className="flex flex-col gap-2.5">
            <input
              className={inputCls}
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCreate()}
              autoFocus
            />
            <input
              className={inputCls}
              type="date"
              aria-label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {leaders && leaders.length > 0 && (
              <select
                className={inputCls}
                aria-label="Assign to"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
              >
                <option value="">For myself</option>
                {leaders.map((l) => (
                  <option key={l.id} value={l.id}>
                    Assign to {l.full_name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-2.5">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                variant="berry"
                size="lg"
                className="flex-[1.5]"
                onClick={onCreate}
                pending={creating}
                disabled={!title.trim()}
              >
                Add task
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function TaskGroup({
  tasks,
  onToggle,
  onDelete,
  overdue,
}: {
  tasks: Task[]
  onToggle: (task: Task) => void
  onDelete: (taskId: string) => void
  overdue?: boolean
}) {
  return (
    <ul className="mx-5 my-0 p-0 list-none [&>li+li]:border-t [&>li+li]:border-[var(--rule)]">
      {tasks.map((t) => {
        const done = t.status === 'done'
        return (
          <li
            key={t.id}
            className={`flex gap-[13px] items-center py-[13px] min-h-[52px] ${done ? 'opacity-50' : ''}`}
          >
            <Check done={done} onToggle={() => onToggle(t)} label={t.title} />
            <div className="flex-1 min-w-0">
              <div
                className={`text-[15px] font-medium tracking-[-0.014em] leading-[1.3] truncate
                            ${done ? 'line-through text-ink-3' : 'text-ink'}`}
              >
                {t.title}
              </div>
              {!done && (t.due_date || t.fromName) && (
                <div className="text-[12.5px] text-ink-3 mt-0.5 tracking-[-0.004em] flex items-center gap-1.5 flex-wrap">
                  {t.due_date &&
                    (overdue ? (
                      <StatusDot tone="urgent">{formatDueLabel(t.due_date)}</StatusDot>
                    ) : (
                      formatDueLabel(t.due_date)
                    ))}
                  {t.fromName && <span>from {firstNameOf(t.fromName)}</span>}
                </div>
              )}
            </div>
            {done && (
              <button
                onClick={() => onDelete(t.id)}
                aria-label={`Delete task: ${t.title}`}
                className="w-9 h-9 -mr-2 flex items-center justify-center text-ink-4 text-[17px] leading-none"
              >
                ×
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
