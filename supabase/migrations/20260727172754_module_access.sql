-- Per-user module visibility/access, toggleable by Master Admin. Members
-- default to Ibadah + Reports only (no Qala/Sponsorship); Admins and
-- Master Admin default to everything. This only gates a user's own
-- self-service access (member_id = auth.uid()) — an Admin/Master Admin
-- acting on an assigned Student's behalf is unaffected, since that's a
-- distinct RLS policy that doesn't consult module_access.
alter table public.profiles
  add column module_access jsonb not null default jsonb_build_object(
    'ibadah', true, 'qala', false, 'sponsorship', false, 'reports', true
  );

update public.profiles
set module_access = jsonb_build_object(
  'ibadah', true, 'qala', true, 'sponsorship', true, 'reports', true
)
where role in ('admin', 'master_admin');

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
      jsonb_build_object('ibadah', true, 'qala', true, 'sponsorship', true, 'reports', true)
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
      then jsonb_build_object('ibadah', true, 'qala', true, 'sponsorship', true, 'reports', true)
    else jsonb_build_object('ibadah', true, 'qala', false, 'sponsorship', false, 'reports', true)
  end;

  insert into public.profiles (id, email, role, status, requested_admin_id, module_access)
  values (new.id, new.email, requested_role, 'pending', requested_admin, default_access);

  return new;
end;
$$;

-- Gate the member's own insert into Qala/Sponsorship on their module_access.
-- (Members never had insert rights on qala_balances itself — only Admins
-- set balances — so only the transaction-insert policies need this.)
drop policy "Members insert their own qala_transactions" on public.qala_transactions;
create policy "Members insert their own qala_transactions"
  on public.qala_transactions for insert
  with check (
    member_id = auth.uid()
    and coalesce((select (module_access ->> 'qala')::boolean from public.profiles where id = auth.uid()), false)
  );

drop policy "Members insert their own sponsorship_transactions" on public.sponsorship_transactions;
create policy "Members insert their own sponsorship_transactions"
  on public.sponsorship_transactions for insert
  with check (
    member_id = auth.uid()
    and coalesce((select (module_access ->> 'sponsorship')::boolean from public.profiles where id = auth.uid()), false)
  );
