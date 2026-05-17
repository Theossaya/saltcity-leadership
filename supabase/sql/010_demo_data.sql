-- Day 8 Afternoon demo data and QA seed foundation.
--
-- DEV/TEST ONLY.
-- Run after:
--   001_initial_schema.sql
--   002_rls_policies.sql
--   003_seed_data.sql
--   004_api_grants.sql
--   005_report_write_grants.sql
--   006_report_draft_update_grants.sql
--   007_report_submit_grants.sql
--   008_absentee_record_grants.sql
--   009_report_submit_absentee_reconciliation.sql
--
-- This file seeds richer demo data for exercising the current MVP screens.
-- It is safe to rerun where possible, but it is not intended as production data.
--
-- It does not create auth users. Create these users through Supabase Auth first
-- if you want the optional profile, membership, assignment, and task assignee
-- links to resolve:
--   admin@example.com
--   leader@example.com

-- Fixed IDs from 003_seed_data.sql reused here:
--   Church: Grace Community Church
--     11111111-1111-4111-8111-111111111111
--   Existing companies:
--     Company Alpha  22222222-2222-4222-8222-222222222221
--     Company Beta   22222222-2222-4222-8222-222222222222
--     Company Gamma  22222222-2222-4222-8222-222222222223
--   Existing members:
--     Mary Okafor    33333333-3333-4333-8333-333333333331
--     John Adeyemi   33333333-3333-4333-8333-333333333332
--     Grace Nwosu    33333333-3333-4333-8333-333333333333
--     Tunde Bello    33333333-3333-4333-8333-333333333334
--
-- 003_seed_data.sql intentionally does not include fixed profile or membership
-- IDs because profiles must reference real auth.users rows.

-- Optional profile and membership links for the expected test users.
-- These are no-ops until the matching Supabase Auth users exist.
insert into public.profiles (id, full_name, phone)
select auth_user.id, 'Ada Church Admin', '+234000000001'
from auth.users auth_user
where lower(auth_user.email::text) = 'admin@example.com'
on conflict (id) do update
set full_name = excluded.full_name,
    phone = excluded.phone;

insert into public.profiles (id, full_name, phone)
select auth_user.id, 'Bola Company Leader', '+234000000002'
from auth.users auth_user
where lower(auth_user.email::text) = 'leader@example.com'
on conflict (id) do update
set full_name = excluded.full_name,
    phone = excluded.phone;

insert into public.church_memberships (church_id, user_id, role, status)
select
  '11111111-1111-4111-8111-111111111111',
  auth_user.id,
  'church_admin',
  'active'
from auth.users auth_user
where lower(auth_user.email::text) = 'admin@example.com'
on conflict (church_id, user_id, role) do update
set status = excluded.status;

insert into public.church_memberships (church_id, user_id, role, status)
select
  '11111111-1111-4111-8111-111111111111',
  auth_user.id,
  'company_leader',
  'active'
from auth.users auth_user
where lower(auth_user.email::text) = 'leader@example.com'
on conflict (church_id, user_id, role) do update
set status = excluded.status;

update public.companies
set leader_id = (
      select auth_user.id
      from auth.users auth_user
      where lower(auth_user.email::text) = 'leader@example.com'
      limit 1
    )
where id = '22222222-2222-4222-8222-222222222221'
  and exists (
    select 1
    from auth.users auth_user
    where lower(auth_user.email::text) = 'leader@example.com'
  );

-- Demo-only QA companies keep report/follow-up seed records separate from
-- manually tested Alpha/Beta/Gamma reports.
insert into public.companies (id, church_id, name, status)
values
  ('99999999-0001-4001-8001-000000000001', '11111111-1111-4111-8111-111111111111', 'Company Delta Demo', 'active'),
  ('99999999-0001-4001-8001-000000000002', '11111111-1111-4111-8111-111111111111', 'Company Epsilon Demo', 'active')
on conflict (id) do update
set name = excluded.name,
    status = excluded.status;

-- Keep the submitted Epsilon demo report audit trail realistic when the
-- optional leader test user exists. The active company_leader membership above
-- supplies the church role, and this company assignment satisfies report RLS.
update public.companies
set leader_id = (
      select auth_user.id
      from auth.users auth_user
      where lower(auth_user.email::text) = 'leader@example.com'
      limit 1
    )
where id = '99999999-0001-4001-8001-000000000002'
  and exists (
    select 1
    from auth.users auth_user
    where lower(auth_user.email::text) = 'leader@example.com'
  );

insert into public.company_members (id, church_id, company_id, full_name, phone, email, status)
values
  ('99999999-0002-4002-8002-000000000001', '11111111-1111-4111-8111-111111111111', '99999999-0001-4001-8001-000000000001', 'Chidinma Eze', '+234000000201', null, 'active'),
  ('99999999-0002-4002-8002-000000000002', '11111111-1111-4111-8111-111111111111', '99999999-0001-4001-8001-000000000001', 'Emeka Ibe', '+234000000202', null, 'active'),
  ('99999999-0002-4002-8002-000000000003', '11111111-1111-4111-8111-111111111111', '99999999-0001-4001-8001-000000000001', 'Aisha Lawal', '+234000000203', null, 'active'),
  ('99999999-0002-4002-8002-000000000004', '11111111-1111-4111-8111-111111111111', '99999999-0001-4001-8001-000000000002', 'Kunle Martins', '+234000000204', null, 'active'),
  ('99999999-0002-4002-8002-000000000005', '11111111-1111-4111-8111-111111111111', '99999999-0001-4001-8001-000000000002', 'Ify Johnson', '+234000000205', null, 'active')
on conflict (id) do update
set full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    status = excluded.status;

-- Events use dates relative to the current Africa/Lagos date so the read-only
-- events screen always has current/upcoming service data after reruns. The day
-- offsets below choose the next matching weekday, using the following
-- PostgreSQL day-of-week values: Sunday 0, Wednesday 3, Friday 5.
insert into public.events (
  id,
  church_id,
  title,
  description,
  starts_at,
  ends_at,
  venue,
  status,
  created_by
)
values
  (
    '99999999-0003-4003-8003-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'Sunday Celebration Service',
    'Regular Sunday worship service with company leaders available for attendance notes and follow-up observations.',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((0 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((0 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '09:00'
    ) at time zone 'Africa/Lagos',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((0 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((0 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '13:00'
    ) at time zone 'Africa/Lagos',
    'Main Auditorium',
    'ready',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1)
  ),
  (
    '99999999-0003-4003-8003-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'Wednesday Word Service',
    'Midweek teaching service for leaders to note absentees who need a pastoral check-in.',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((3 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((3 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '17:00'
    ) at time zone 'Africa/Lagos',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((3 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((3 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '19:30'
    ) at time zone 'Africa/Lagos',
    'Main Auditorium',
    'ready',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1)
  ),
  (
    '99999999-0003-4003-8003-000000000003',
    '11111111-1111-4111-8111-111111111111',
    'Friday Prayer Service',
    'Regular Friday prayer service with emphasis on leaders confirming member welfare before the weekend.',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((5 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((5 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '17:00'
    ) at time zone 'Africa/Lagos',
    (
      timezone('Africa/Lagos', now())::date
      + case
          when ((5 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7) = 0 then 7
          else ((5 - extract(dow from timezone('Africa/Lagos', now())::date)::integer + 7) % 7)
        end
      + time '19:30'
    ) at time zone 'Africa/Lagos',
    'Prayer Hall',
    'ready',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1)
  ),
  (
    '99999999-0003-4003-8003-000000000004',
    '11111111-1111-4111-8111-111111111111',
    'Family Restoration Programme',
    'Special leadership-supported programme requiring ushers, follow-up leaders, and company leaders to coordinate guest care.',
    (date_trunc('week', timezone('Africa/Lagos', now()))::date + 9 + time '17:30') at time zone 'Africa/Lagos',
    (date_trunc('week', timezone('Africa/Lagos', now()))::date + 9 + time '20:30') at time zone 'Africa/Lagos',
    'Main Auditorium',
    'planning',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1)
  ),
  (
    '99999999-0003-4003-8003-000000000005',
    '11111111-1111-4111-8111-111111111111',
    'Company Leaders Review Meeting',
    'Leadership review for weekly reports, absentee follow-up, and assigned tasks before the next service cycle.',
    (date_trunc('week', timezone('Africa/Lagos', now()))::date + 7 + time '18:00') at time zone 'Africa/Lagos',
    (date_trunc('week', timezone('Africa/Lagos', now()))::date + 7 + time '19:30') at time zone 'Africa/Lagos',
    'Leadership Room',
    'planning',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1)
  )
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    venue = excluded.venue,
    status = excluded.status,
    created_by = excluded.created_by;

-- Announcements use the current schema fields: title, message, audience_type,
-- audience targets, urgency, expiry, creator, and church.
insert into public.announcements (
  id,
  church_id,
  title,
  message,
  audience_type,
  audience_company_id,
  audience_unit_id,
  audience_role,
  is_urgent,
  expires_at,
  created_by,
  created_at
)
values
  (
    '99999999-0004-4004-8004-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'Confirm absentees before Sunday close',
    'All company leaders should confirm this week''s absentees before submitting reports. Please include only members who were actually absent from the service being reported.',
    'role',
    null,
    null,
    'company_leader',
    true,
    now() + interval '10 days',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    now() - interval '2 hours'
  ),
  (
    '99999999-0004-4004-8004-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'Pastoral follow-up guidance for this week',
    'When reaching out to members marked absent, keep the tone warm, private, and practical. Ask whether they are safe, whether they need prayer or support, and whether a leader should visit or call again. If the absence is connected to work, travel, school, illness, or family pressure, capture the important detail in your notes so the admin team can understand the right next step without asking the member to repeat sensitive information.',
    'all_leaders',
    null,
    null,
    null,
    false,
    now() + interval '30 days',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    now() - interval '1 day'
  ),
  (
    '99999999-0004-4004-8004-000000000003',
    '11111111-1111-4111-8111-111111111111',
    'Prepare teams for Family Restoration Programme',
    'Leaders should confirm service support, guest welcome coverage, and follow-up availability before the special programme.',
    'all_leaders',
    null,
    null,
    null,
    false,
    now() + interval '14 days',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    now() - interval '6 hours'
  ),
  (
    '99999999-0004-4004-8004-000000000004',
    '11111111-1111-4111-8111-111111111111',
    'Leadership-only review notes',
    'Admins and company leaders should review open follow-up items before the next leadership meeting.',
    'role',
    null,
    null,
    'church_admin',
    false,
    now() + interval '21 days',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    now() - interval '3 hours'
  )
on conflict (id) do update
set title = excluded.title,
    message = excluded.message,
    audience_type = excluded.audience_type,
    audience_company_id = excluded.audience_company_id,
    audience_unit_id = excluded.audience_unit_id,
    audience_role = excluded.audience_role,
    is_urgent = excluded.is_urgent,
    expires_at = excluded.expires_at,
    created_by = excluded.created_by,
    created_at = excluded.created_at;

-- Reports are seeded only for demo-only companies so Alpha/Beta/Gamma manual
-- report testing is not overwritten. The current-week dates match the app and
-- RLS convention for Africa/Lagos.
-- These are rolling current-week demo reports: rerunning the seed moves the
-- same fixed-ID rows to the current Africa/Lagos week.
insert into public.weekly_reports (
  id,
  church_id,
  company_id,
  report_week_start,
  report_week_end,
  total_members,
  present_count,
  absent_count,
  new_visitors_count,
  general_notes,
  support_needed,
  testimonies,
  status,
  submitted_by,
  submitted_at
)
values
  (
    '99999999-0005-4005-8005-000000000001',
    '11111111-1111-4111-8111-111111111111',
    '99999999-0001-4001-8001-000000000001',
    date_trunc('week', timezone('Africa/Lagos', now()))::date,
    date_trunc('week', timezone('Africa/Lagos', now()))::date + 6,
    3,
    2,
    1,
    1,
    'Draft demo report for QA: counts saved but not submitted yet.',
    'Leader wants admin guidance on one member who has missed two check-ins.',
    null,
    'draft',
    null,
    null
  ),
  (
    '99999999-0005-4005-8005-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '99999999-0001-4001-8001-000000000002',
    date_trunc('week', timezone('Africa/Lagos', now()))::date,
    date_trunc('week', timezone('Africa/Lagos', now()))::date + 6,
    2,
    1,
    1,
    0,
    'Submitted demo report for QA: one absentee needs follow-up.',
    'Please assign a leader to confirm welfare before Sunday.',
    'Member shared that the midweek teaching notes were helpful.',
    'submitted',
    (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
    now() - interval '1 hour'
  )
on conflict (id) do update
set report_week_start = excluded.report_week_start,
    report_week_end = excluded.report_week_end,
    total_members = excluded.total_members,
    present_count = excluded.present_count,
    absent_count = excluded.absent_count,
    new_visitors_count = excluded.new_visitors_count,
    general_notes = excluded.general_notes,
    support_needed = excluded.support_needed,
    testimonies = excluded.testimonies,
    status = excluded.status,
    submitted_by = excluded.submitted_by,
    submitted_at = excluded.submitted_at;

insert into public.absentee_records (
  id,
  church_id,
  weekly_report_id,
  company_id,
  company_member_id,
  absence_date,
  reason,
  reason_note,
  streak_count,
  follow_up_required
)
select
  '99999999-0006-4006-8006-000000000001',
  wr.church_id,
  wr.id,
  wr.company_id,
  '99999999-0002-4002-8002-000000000002',
  wr.report_week_start + 6,
  'work',
  'Missed Sunday service because of an unavoidable work shift.',
  1,
  true
from public.weekly_reports wr
where wr.church_id = '11111111-1111-4111-8111-111111111111'
  and wr.company_id = '99999999-0001-4001-8001-000000000001'
  and wr.report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
on conflict (weekly_report_id, company_member_id) do update
set absence_date = excluded.absence_date,
    reason = excluded.reason,
    reason_note = excluded.reason_note,
    streak_count = excluded.streak_count,
    follow_up_required = excluded.follow_up_required;

insert into public.absentee_records (
  id,
  church_id,
  weekly_report_id,
  company_id,
  company_member_id,
  absence_date,
  reason,
  reason_note,
  streak_count,
  follow_up_required
)
select
  '99999999-0006-4006-8006-000000000002',
  wr.church_id,
  wr.id,
  wr.company_id,
  '99999999-0002-4002-8002-000000000005',
  wr.report_week_start + 6,
  'illness',
  'Reported malaria symptoms and asked for prayer.',
  1,
  true
from public.weekly_reports wr
where wr.church_id = '11111111-1111-4111-8111-111111111111'
  and wr.company_id = '99999999-0001-4001-8001-000000000002'
  and wr.report_week_start = date_trunc('week', timezone('Africa/Lagos', now()))::date
on conflict (weekly_report_id, company_member_id) do update
set absence_date = excluded.absence_date,
    reason = excluded.reason,
    reason_note = excluded.reason_note,
    streak_count = excluded.streak_count,
    follow_up_required = excluded.follow_up_required;

-- Follow-up cases link to the demo absentee rows above. One remains open for
-- the queue; one is contacted/resolved to exercise status enrichment without
-- crowding the open follow-up list.
insert into public.follow_up_cases (
  id,
  church_id,
  company_id,
  company_member_id,
  absentee_record_id,
  assigned_to,
  priority,
  status,
  next_action,
  notes,
  date_contacted,
  resolved_at
)
select
  '99999999-0007-4007-8007-000000000001',
  ar.church_id,
  ar.company_id,
  ar.company_member_id,
  ar.id,
  (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
  'high',
  'assigned',
  'Call after evening service and confirm whether transport support is needed.',
  'Demo open follow-up case linked to a submitted/draft absentee record.',
  null,
  null
from public.absentee_records ar
where ar.id = '99999999-0006-4006-8006-000000000001'
on conflict (id) do update
set absentee_record_id = excluded.absentee_record_id,
    assigned_to = excluded.assigned_to,
    priority = excluded.priority,
    status = excluded.status,
    next_action = excluded.next_action,
    notes = excluded.notes,
    date_contacted = excluded.date_contacted,
    resolved_at = excluded.resolved_at;

insert into public.follow_up_cases (
  id,
  church_id,
  company_id,
  company_member_id,
  absentee_record_id,
  assigned_to,
  priority,
  status,
  next_action,
  notes,
  date_contacted,
  resolved_at
)
select
  '99999999-0007-4007-8007-000000000002',
  ar.church_id,
  ar.company_id,
  ar.company_member_id,
  ar.id,
  (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
  'normal',
  'resolved',
  'No further action needed this week.',
  'Leader contacted member and confirmed recovery support is in place.',
  timezone('Africa/Lagos', now())::date,
  now() - interval '30 minutes'
from public.absentee_records ar
where ar.id = '99999999-0006-4006-8006-000000000002'
on conflict (id) do update
set absentee_record_id = excluded.absentee_record_id,
    assigned_to = excluded.assigned_to,
    priority = excluded.priority,
    status = excluded.status,
    next_action = excluded.next_action,
    notes = excluded.notes,
    date_contacted = excluded.date_contacted,
    resolved_at = excluded.resolved_at;

-- Tasks use only current schema fields. Company context is added through the
-- existing linked_entity fields, and one task links directly to follow_up_cases.
insert into public.tasks (
  id,
  church_id,
  title,
  description,
  assigned_to,
  created_by,
  due_date,
  priority,
  status,
  follow_up_case_id,
  linked_entity_type,
  linked_entity_id
)
values
  (
    '99999999-0008-4008-8008-000000000001',
    '11111111-1111-4111-8111-111111111111',
    'Review submitted demo report',
    'Admin QA task: review the submitted Company Epsilon Demo report and confirm absentee follow-up is visible.',
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    timezone('Africa/Lagos', now())::date + 1,
    'normal',
    'todo',
    null,
    'company',
    '99999999-0001-4001-8001-000000000002'
  ),
  (
    '99999999-0008-4008-8008-000000000002',
    '11111111-1111-4111-8111-111111111111',
    'Confirm Delta company absentee details',
    'Company leader QA task: call the absent member and update the admin team after contact.',
    (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    timezone('Africa/Lagos', now())::date + 2,
    'high',
    'in_progress',
    '99999999-0007-4007-8007-000000000001',
    null,
    null
  ),
  (
    '99999999-0008-4008-8008-000000000003',
    '11111111-1111-4111-8111-111111111111',
    'Prepare Sunday leader attendance notes',
    'Confirm company leaders know where to capture service absentees before submitting weekly reports.',
    (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    timezone('Africa/Lagos', now())::date + 3,
    'normal',
    'todo',
    null,
    'company',
    '99999999-0001-4001-8001-000000000001'
  ),
  (
    '99999999-0008-4008-8008-000000000004',
    '11111111-1111-4111-8111-111111111111',
    'Close completed illness follow-up',
    'Completed QA task linked to the resolved demo follow-up case.',
    (select id from auth.users where lower(email::text) = 'leader@example.com' limit 1),
    (select id from auth.users where lower(email::text) = 'admin@example.com' limit 1),
    timezone('Africa/Lagos', now())::date - 1,
    'low',
    'done',
    '99999999-0007-4007-8007-000000000002',
    null,
    null
  )
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    assigned_to = excluded.assigned_to,
    created_by = excluded.created_by,
    due_date = excluded.due_date,
    priority = excluded.priority,
    status = excluded.status,
    follow_up_case_id = excluded.follow_up_case_id,
    linked_entity_type = excluded.linked_entity_type,
    linked_entity_id = excluded.linked_entity_id;
