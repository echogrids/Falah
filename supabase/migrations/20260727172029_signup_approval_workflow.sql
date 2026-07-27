-- New accounts (other than the bootstrap master_admin) start pending and
-- need approval: Admin (Parent) signups are approved by Master Admin;
-- Member (Student) signups request a specific Admin and are approved by
-- that Admin or Master Admin, which also creates the admin_members link.
alter table public.profiles
  add column status text not null default 'active' check (status in ('pending', 'active', 'rejected')),
  add column requested_admin_id uuid references public.profiles (id);

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

  insert into public.profiles (id, email, role, status, requested_admin_id)
  values (new.id, new.email, requested_role, 'pending', requested_admin);

  return new;
end;
$$;

-- Lets the (unauthenticated) signup page list Admins to request, without
-- exposing the full profiles table to anon.
create or replace function public.list_admins_for_signup()
returns table (id uuid, email text)
language sql
security definer
set search_path = ''
stable
as $$
  select id, email from public.profiles
  where role = 'admin' and status = 'active';
$$;

grant execute on function public.list_admins_for_signup() to anon, authenticated;

-- Lets an Admin approve a student themselves (creating the assignment),
-- rather than requiring Master Admin to do it on their behalf.
create policy "Admins can create their own assignments"
  on public.admin_members for insert
  with check (admin_id = auth.uid());

-- Admins need to see students who requested them, even before the
-- admin_members row exists (that row is only created on approval).
-- (Master Admin already has full access to profiles via an existing policy.)
create policy "Admins can view profiles that requested them"
  on public.profiles for select
  using (requested_admin_id = auth.uid());

-- Needed so an Admin can approve (flip status to active) before the
-- admin_members row exists — the usual "assigned members" policies don't
-- apply yet at that point.
create policy "Admins can approve profiles that requested them"
  on public.profiles for update
  using (requested_admin_id = auth.uid())
  with check (requested_admin_id = auth.uid());
