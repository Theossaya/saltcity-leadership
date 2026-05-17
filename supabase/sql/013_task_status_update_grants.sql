-- Day 10 Morning task status update grants and RLS policy.
-- Run this file after 001_initial_schema.sql through 012_task_create_grants.sql.
--
-- This enables active authenticated leaders to update only the status column
-- on tasks assigned to them in their active church membership. It does not
-- grant table-wide update access, delete access, reassignment, or task editing.

grant update (status) on table public.tasks to authenticated;

drop policy if exists "tasks_assigned_status_update" on public.tasks;
drop policy if exists "tasks_update_assigned_status" on public.tasks;

create policy "tasks_assigned_status_update"
on public.tasks for update
using (
  auth.role() = 'authenticated'
  and assigned_to = auth.uid()
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
)
with check (
  auth.role() = 'authenticated'
  and assigned_to = auth.uid()
  and status in ('todo', 'in_progress', 'blocked', 'done')
  and public.current_user_has_role(
    church_id,
    array[
      'super_admin',
      'church_admin',
      'company_leader',
      'assistant_leader',
      'unit_leader',
      'general_leader'
    ]
  )
);
