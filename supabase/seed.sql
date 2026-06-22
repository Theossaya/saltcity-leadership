-- SaltCity Leadership — development seed data (from SCHEMA.md §8)
-- Run after the init migration. Create auth users via the Supabase dashboard
-- first (the on_auth_user_created trigger creates their profiles), then set
-- roles/companies on the profiles rows.

insert into companies (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Company Alpha'),
  ('11111111-0000-0000-0000-000000000002', 'Company Beta');

insert into members (full_name, company_id) values
  ('DJ Wes',         '11111111-0000-0000-0000-000000000001'),
  ('John Adeyemi',   '11111111-0000-0000-0000-000000000001'),
  ('Mary Okafor',    '11111111-0000-0000-0000-000000000001'),
  ('Emeka Ibe',      '11111111-0000-0000-0000-000000000001'),
  ('Tobi Ade',       '11111111-0000-0000-0000-000000000001'),
  ('Ada Nwo',        '11111111-0000-0000-0000-000000000001'),
  ('Sade Kor',       '11111111-0000-0000-0000-000000000001'),
  ('Femi Olu',       '11111111-0000-0000-0000-000000000001'),
  ('Ngozi Eze',      '11111111-0000-0000-0000-000000000001'),
  ('Ruth Eze',       '11111111-0000-0000-0000-000000000001'),
  ('Joy Ben',        '11111111-0000-0000-0000-000000000001'),
  ('Grace Udo',      '11111111-0000-0000-0000-000000000001');

-- A sample announcement (requires at least one profile to exist)
insert into announcements (title, body, published_by, priority, audience)
select
  'Side entrance only this Sunday',
  'Main vestibule is under repair. Please use the side entrance and brief your members.',
  id,
  'urgent',
  'all'
from profiles
limit 1;
