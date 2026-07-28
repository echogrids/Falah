-- Extend module_access with the new Charity Sponsorship module, off by
-- default for Students like Qala/Sponsorship, on for Admins/Master Admin.
alter table public.profiles
  alter column module_access set default jsonb_build_object(
    'ibadah', true, 'qala', false, 'sponsorship', false, 'charity', false, 'reports', true
  );

update public.profiles
set module_access = module_access || jsonb_build_object('charity', true)
where role in ('admin', 'master_admin');

update public.profiles
set module_access = module_access || jsonb_build_object('charity', false)
where role = 'member';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_admin uuid;
  default_access jsonb;
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

  default_access := case
    when requested_role = 'admin'
      then jsonb_build_object('ibadah', true, 'qala', true, 'sponsorship', true, 'charity', true, 'reports', true)
    else jsonb_build_object('ibadah', true, 'qala', false, 'sponsorship', false, 'charity', false, 'reports', true)
  end;

  insert into public.profiles (id, email, role, status, requested_admin_id, module_access)
  values (new.id, new.email, requested_role, 'pending', requested_admin, default_access);

  return new;
end;
$$;
