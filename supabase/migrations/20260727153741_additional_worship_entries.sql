-- Additional Worship: Dhuha, Tahajjud, Witr. Same Fajr-based prayer_day
-- boundary as prayer_entries, tracked separately since these are optional
-- and don't carry a missed/late status the way mandatory Salah does.
create table public.additional_worship_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer_day date not null,
  worship_type text not null check (worship_type in ('dhuha', 'tahajjud', 'witr')),
  rakat_count int,
  score int not null default 0,
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, prayer_day, worship_type)
);

alter table public.additional_worship_entries enable row level security;

create policy "Master admins have full access to additional_worship_entries"
  on public.additional_worship_entries for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members manage their own additional_worship_entries"
  on public.additional_worship_entries for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "Admins manage their assigned members' additional_worship_entries"
  on public.additional_worship_entries for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = additional_worship_entries.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = additional_worship_entries.member_id
        and admin_members.admin_id = auth.uid()
    )
  );
