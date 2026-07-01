-- Fix Supabase advisor "Security Definer View" (CRITICAL) on the two helper
-- views. By default a view runs with its owner's privileges (postgres), which
-- bypasses RLS on the underlying tables. security_invoker makes the view run
-- with the querying user's privileges instead, so RLS is respected.
-- (These views aren't used by the app today, but this keeps them safe.)

alter view public.current_week              set (security_invoker = on);
alter view public.report_submission_summary set (security_invoker = on);
