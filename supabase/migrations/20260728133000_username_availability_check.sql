-- Lets the (unauthenticated) signup page check username availability up
-- front, so a duplicate surfaces as a friendly error instead of the generic
-- "Database error saving new user" GoTrue returns when the profiles_username_key
-- unique index rejects the handle_new_user() insert.
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select not exists (
    select 1 from public.profiles where username = p_username
  );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
