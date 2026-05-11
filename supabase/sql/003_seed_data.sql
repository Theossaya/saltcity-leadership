-- Day 1 Afternoon seed data draft for local/manual testing.
-- Do not insert fake rows into auth.users. Create users through Supabase Auth first,
-- then copy their real UUIDs into the commented profile and assignment sections below.

insert into public.churches (id, name, slug)
values
  ('11111111-1111-4111-8111-111111111111', 'Grace Community Church', 'grace-community')
on conflict (slug) do nothing;

-- Replace these placeholders with real Supabase Auth user IDs after users are created.
-- Example:
-- insert into public.profiles (id, full_name, phone)
-- values
--   ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ada Church Admin', '+234000000001'),
--   ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Bola Company Leader', '+234000000002')
-- on conflict (id) do update
-- set full_name = excluded.full_name,
--     phone = excluded.phone;
--
-- insert into public.church_memberships (church_id, user_id, role, status)
-- values
--   ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'church_admin', 'active'),
--   ('11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'company_leader', 'active')
-- on conflict (church_id, user_id, role) do update
-- set status = excluded.status;
--
-- update public.companies
-- set leader_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
-- where id = '22222222-2222-4222-8222-222222222221';

insert into public.companies (id, church_id, name, status)
values
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111111', 'Company Alpha', 'active'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Company Beta', 'active'),
  ('22222222-2222-4222-8222-222222222223', '11111111-1111-4111-8111-111111111111', 'Company Gamma', 'active')
on conflict (id) do nothing;

insert into public.company_members (id, church_id, company_id, full_name, phone, email, status)
values
  ('33333333-3333-4333-8333-333333333331', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'Mary Okafor', '+234000000101', null, 'active'),
  ('33333333-3333-4333-8333-333333333332', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', 'John Adeyemi', '+234000000102', null, 'active'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Grace Nwosu', '+234000000103', null, 'active'),
  ('33333333-3333-4333-8333-333333333334', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222223', 'Tunde Bello', '+234000000104', null, 'active')
on conflict (id) do nothing;

insert into public.units (id, church_id, name, status)
values
  ('44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111111', 'Ushering Unit', 'active'),
  ('44444444-4444-4444-8444-444444444442', '11111111-1111-4111-8111-111111111111', 'Choir Unit', 'active'),
  ('44444444-4444-4444-8444-444444444443', '11111111-1111-4111-8111-111111111111', 'Follow-up Unit', 'active')
on conflict (id) do nothing;

insert into public.announcements (
  id,
  church_id,
  title,
  message,
  audience_type,
  is_urgent
)
values (
  '55555555-5555-4555-8555-555555555551',
  '11111111-1111-4111-8111-111111111111',
  'Weekly reports due Sunday',
  'Please submit this week''s company report before the Sunday deadline.',
  'all_leaders',
  false
)
on conflict (id) do nothing;

insert into public.events (
  id,
  church_id,
  title,
  description,
  starts_at,
  ends_at,
  venue,
  status
)
values (
  '66666666-6666-4666-8666-666666666661',
  '11111111-1111-4111-8111-111111111111',
  'Leadership Review Meeting',
  'Weekly review for reports, absentees, and follow-up tasks.',
  '2026-05-18 18:00:00+01',
  '2026-05-18 19:30:00+01',
  'Main Auditorium',
  'planning'
)
on conflict (id) do nothing;

insert into public.event_checklist_items (
  id,
  church_id,
  event_id,
  title,
  completed
)
values
  ('77777777-7777-4777-8777-777777777771', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666661', 'Review open follow-up cases', false),
  ('77777777-7777-4777-8777-777777777772', '11111111-1111-4111-8111-111111111111', '66666666-6666-4666-8666-666666666661', 'Assign next week tasks', false)
on conflict (id) do nothing;

insert into public.documents (
  id,
  church_id,
  title,
  category,
  file_path,
  visibility
)
values (
  '88888888-8888-4888-8888-888888888881',
  '11111111-1111-4111-8111-111111111111',
  'Company Report Guide',
  'training',
  'documents/company-report-guide.pdf',
  'all_leaders'
)
on conflict (id) do nothing;
