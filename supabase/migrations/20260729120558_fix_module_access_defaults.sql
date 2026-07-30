-- handle_new_user() has been replaced several times as new fields were
-- added (signup approval, profile fields), and each replace fully
-- overwrote the previous body — the role-based module_access assignment
-- from the original module_access migration was silently dropped along
-- the way. Every account created since (except the hardcoded bootstrap
-- master_admin branch) fell back to the column default, which is the
-- Student-shaped default (qala/sponsorship/charity off) even for Parents.
-- Restoring it here, matching the column default's own comment: "on for
-- Admins/Master Admin."
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_admin uuid;
  access jsonb;
begin
  if new.email = 'echogrids@gmail.com' then
    insert into public.profiles (id, email, role, status, module_access)
    values (
      new.id, new.email, 'master_admin', 'active',
      jsonb_build_object('ibadah', true, 'qala', true, 'sponsorship', true, 'charity', true, 'reports', true)
    );
    return new;
  end if;

  requested_role := new.raw_user_meta_data ->> 'requested_role';
  if requested_role not in ('admin', 'member') then
    requested_role := 'member';
  end if;

  requested_admin := nullif(new.raw_user_meta_data ->> 'requested_admin_id', '')::uuid;

  access := case
    when requested_role = 'admin'
      then jsonb_build_object('ibadah', true, 'qala', true, 'sponsorship', true, 'charity', true, 'reports', true)
    else jsonb_build_object('ibadah', true, 'qala', false, 'sponsorship', false, 'charity', false, 'reports', true)
  end;

  insert into public.profiles (
    id, email, role, status, requested_admin_id, first_name, last_name, username, mobile, module_access
  )
  values (
    new.id,
    new.email,
    requested_role,
    'pending',
    requested_admin,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'mobile',
    access
  );

  return new;
end;
$$;

-- Backfill the one real account this already affected.
update public.profiles
set module_access = jsonb_build_object(
  'ibadah', true, 'qala', true, 'sponsorship', true, 'charity', true, 'reports', true
)
where role in ('admin', 'master_admin')
  and (module_access ->> 'qala')::boolean = false;
