-- Collect First Name, Last Name, Username, and (optional) Mobile at signup.
-- Nullable: the Master Admin direct-create flow (admin/actions.ts) creates
-- auth users through this same trigger without these fields.
alter table public.profiles
  add column first_name text,
  add column last_name text,
  add column username text,
  add column mobile text;

-- Allows repeat nulls (direct-create flow, and any pre-existing rows) while
-- still preventing two signups from picking the same username.
create unique index profiles_username_key on public.profiles (username) where username is not null;

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
    insert into public.profiles (id, email, role, status)
    values (new.id, new.email, 'master_admin', 'active');
    return new;
  end if;

  requested_role := new.raw_user_meta_data ->> 'requested_role';
  if requested_role not in ('admin', 'member') then
    requested_role := 'member';
  end if;

  requested_admin := nullif(new.raw_user_meta_data ->> 'requested_admin_id', '')::uuid;

  insert into public.profiles (id, email, role, status, requested_admin_id, first_name, last_name, username, mobile)
  values (
    new.id,
    new.email,
    requested_role,
    'pending',
    requested_admin,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'mobile'
  );

  return new;
end;
$$;
