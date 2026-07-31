-- Parent (admin) signups no longer need approval: they go active
-- immediately, same as the bootstrap master_admin. Student (member)
-- signups are unchanged — they still start 'pending' and need an Admin
-- or Master Admin to approve them (see approveStudent in admin/actions.ts).
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

  insert into public.profiles (
    id, email, role, status, requested_admin_id,
    first_name, last_name, username, mobile
  )
  values (
    new.id,
    new.email,
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
