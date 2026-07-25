-- Web Push subscriptions for PWA notifications.
-- Each row is one browser/device subscription belonging to a user.

create table push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;

-- A user manages only their own device subscriptions.
create policy "push_select_own" on push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "push_insert_own" on push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());
create policy "push_update_own" on push_subscriptions
  for update to authenticated using (user_id = auth.uid());
create policy "push_delete_own" on push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- Sending: a security-definer function lets an admin/office pull the target
-- users' subscription details (endpoints are not sensitive on their own, but
-- this keeps RLS intact and avoids needing a service-role key server-side).
create or replace function get_push_targets(target_users uuid[])
returns table (endpoint text, p256dh text, auth text)
language sql
security definer
stable
set search_path = public
as $$
  select ps.endpoint, ps.p256dh, ps.auth
  from public.push_subscriptions ps
  where ps.user_id = any(target_users)
    and public.is_admin_or_office();
$$;
