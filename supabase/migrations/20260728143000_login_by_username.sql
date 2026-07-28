-- Lets the (unauthenticated) login page resolve a typed username to the
-- auth email to sign in with, since email is no longer mandatory at signup
-- and some accounts only have a placeholder email.
create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select email from public.profiles where username = p_username;
$$;

grant execute on function public.get_login_email(text) to anon, authenticated;
