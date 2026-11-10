-- Explicit table privileges for the foundation tables.
--
-- Supabase does not auto-grant privileges to anon/authenticated on tables
-- created via raw SQL, and relying on implicit grants is fragile anyway. RLS
-- still gates every row; these grants are the table-level privilege the role
-- needs before RLS is even consulted. Least privilege: anon gets nothing here.
--
-- (Never edit an applied migration — this is a new one. The public-form and
-- applications migrations already carry their own explicit grants.)

-- profiles: a signed-in user manages their own row (RLS enforces "own").
grant select, insert, update on public.profiles to authenticated;

-- user_roles: reads gated to self/admin, writes gated to admin, by RLS.
grant select, insert, update, delete on public.user_roles to authenticated;

-- audit_log: staff may read (RLS gates to admin); inserts happen only through
-- the SECURITY DEFINER log_audit function, so no INSERT grant is needed.
grant select on public.audit_log to authenticated;
