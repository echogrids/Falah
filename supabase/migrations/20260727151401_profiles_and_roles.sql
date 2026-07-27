-- Profiles table: one row per auth.users id, holds the app-level role.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('master_admin', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Bootstrap seed: this email becomes master_admin on first signup, everyone else is a member.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when new.email = 'fahadbinrahmah@gmail.com' then 'master_admin'
      else 'member'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Returns the calling user's role without re-entering profiles RLS (avoids recursive policy checks).
create function public.current_user_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "Master admins have full access to profiles"
  on public.profiles for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members can view and update their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Members can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin-to-Member assignment: many-to-many, a Member may have multiple Admins.
create table public.admin_members (
  admin_id uuid not null references public.profiles (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id),
  primary key (admin_id, member_id)
);

alter table public.admin_members enable row level security;

create policy "Master admins have full access to admin_members"
  on public.admin_members for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Admins can view their own assignments"
  on public.admin_members for select
  using (admin_id = auth.uid());

create policy "Admins can view assigned members' profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = profiles.id
        and admin_members.admin_id = auth.uid()
    )
  );
