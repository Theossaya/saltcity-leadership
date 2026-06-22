import { createClient } from '@/lib/supabase/server'
import { requireAuth, isAdminOrOffice } from '@/lib/auth'
import Greeting from '@/components/ui/Greeting'
import TasksList from '@/components/tasks/TasksList'

export default async function TasksPage() {
  const { profile } = await requireAuth()
  const supabase = createClient()

  const admin = isAdminOrOffice(profile.role)

  const [{ data: tasks }, { data: leaders }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, due_date, status, created_by, creator:profiles!tasks_created_by_fkey(full_name)')
      .eq('assigned_to', profile.id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    admin
      ? supabase
          .from('profiles')
          .select('id, full_name')
          .in('role', ['company_leader', 'assistant_leader'])
          .order('full_name')
      : Promise.resolve({ data: null }),
  ])

  const list = tasks ?? []
  const open = list.filter((t) => t.status === 'open').length
  const done = list.length - open

  return (
    <>
      <Greeting day={`${open} open · ${done} done`}>
        Your <em>checklist.</em>
      </Greeting>
      <TasksList
        tasks={list.map((t) => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date,
          status: t.status,
          fromName: t.created_by !== profile.id ? (t.creator?.full_name ?? null) : null,
        }))}
        leaders={leaders ?? undefined}
      />
    </>
  )
}
