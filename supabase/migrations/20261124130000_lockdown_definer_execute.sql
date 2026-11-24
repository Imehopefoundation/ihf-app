-- Security advisor: "SECURITY DEFINER function callable by public/authenticated".
--
-- SECURITY DEFINER functions run with the OWNER's privileges, so any that do not
-- need to be called directly by users should not carry the default PUBLIC
-- execute grant.
--
--   * handle_new_user() — a trigger function. Triggers run as their owner, so no
--     role needs EXECUTE for it to fire. Revoke from everyone.
--   * log_audit() — called only internally by log_record_view() (itself SECURITY
--     DEFINER, running as owner, which keeps execute). No caller role needs it.
--
-- Left intentionally executable by `authenticated` (required, and acknowledged
-- in the advisor): is_admin(), has_role() — referenced inside RLS policies — and
-- log_record_view() — called by the app to write audit entries.

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.log_audit(text, text, uuid, jsonb) from public, anon, authenticated;
