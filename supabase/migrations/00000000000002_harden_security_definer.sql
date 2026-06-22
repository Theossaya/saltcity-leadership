-- Fix: security definer functions were failing under roles whose search_path
-- excludes `public` (notably supabase_auth_admin during signup), because they
-- referenced tables/types unqualified. Symptom: every signup returned
-- "Database error creating new user" (500) and rolled back.
--
-- This pins search_path = public and schema-qualifies all object references.
-- Idempotent: pure create-or-replace, no data changes. Safe to run on a live DB.

create or replace function get_my_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function get_my_company_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function is_admin_or_office()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_my_role() in ('church_admin', 'church_office');
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'company_leader')
  );
  return new;
end;
$$;

create or replace function handle_report_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and old.status = 'draft' then
    insert into public.follow_up_cases (member_id, report_id, company_id)
    select
      ar.member_id,
      ar.report_id,
      new.company_id
    from public.attendance_records ar
    where ar.report_id = new.id
      and ar.present = false
      and not exists (
        select 1 from public.follow_up_cases fc
        where fc.member_id = ar.member_id
          and fc.status not in ('resolved')
          and fc.report_id = new.id
      );
  end if;
  return new;
end;
$$;
