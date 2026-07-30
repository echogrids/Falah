-- Activity Log becomes a master-admin-only audit tool. Everyone can still
-- insert their own actions (every logActivity() call depends on that),
-- but only master_admin can read the log back.
drop policy "Admins view activity_log about their assigned members" on public.activity_log;
drop policy "Users view activity_log about themselves" on public.activity_log;
