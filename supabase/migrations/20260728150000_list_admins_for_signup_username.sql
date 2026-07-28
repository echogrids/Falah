-- Signup's "Choose your Parent" dropdown should prefer showing a Parent's
-- username over their (possibly placeholder) email.
-- Return type is changing (new "username" column), so the old signature
-- must be dropped before recreating it.
drop function if exists public.list_admins_for_signup();

create function public.list_admins_for_signup()
returns table (id uuid, email text, username text)
language sql
security definer
set search_path = ''
stable
as $$
  select id, email, username from public.profiles
  where role = 'admin' and status = 'active';
$$;

grant execute on function public.list_admins_for_signup() to anon, authenticated;
