-- Separate the technical Supabase Auth email (required by GoTrue, may be
-- an internal placeholder synthesized for accounts created without one)
-- from the email the user actually typed in, if any. contact_email is
-- what the UI shows/edits as "the user's email" going forward; the
-- existing `email` column keeps doing auth-linkage/username-login
-- resolution duty and is never shown to users.
alter table public.profiles add column contact_email text;

-- Backfill: any account whose auth email is a synthesized placeholder
-- never had a real email entered, so contact_email stays blank for it.
-- Everyone else's current email was genuinely typed in, so it carries
-- over as-is.
update public.profiles
set contact_email = email
where email not like '%@members.falahapp.com';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_admin uuid;
begin
  if new.email = 'echogrids@gmail.com' then
    insert into public.profiles (id, email, contact_email, role, status)
    values (new.id, new.email, new.email, 'master_admin', 'active');
    return new;
  end if;

  requested_role := new.raw_user_meta_data ->> 'requested_role';
  if requested_role not in ('admin', 'member') then
    requested_role := 'member';
  end if;

  requested_admin := nullif(new.raw_user_meta_data ->> 'requested_admin_id', '')::uuid;

  insert into public.profiles (
    id, email, contact_email, role, status, requested_admin_id,
    first_name, last_name, username, mobile
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'contact_email', ''),
    requested_role,
    case when requested_role = 'admin' then 'active' else 'pending' end,
    requested_admin,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'mobile'
  );

  return new;
end;
$$;
