-- Mandatory Salah entries (Fajr, Dhuhr, Asr, Maghrib, Isha).
-- prayer_day is the app-resolved calendar date for the Fajr-to-Fajr day
-- boundary (late-night Isha and the following Fajr share the same
-- prayer_day), computed by the application, not derived here.
create table public.prayer_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer_day date not null,
  prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  status text not null check (status in ('on_time', 'late', 'qala', 'missed')),
  congregation text check (congregation in ('alone', 'jamaah')),
  location text check (location in ('masjid', 'home', 'school', 'work', 'travel', 'other')),
  score int not null default 0,
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, prayer_day, prayer)
);

alter table public.prayer_entries enable row level security;

create policy "Master admins have full access to prayer_entries"
  on public.prayer_entries for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members manage their own prayer_entries"
  on public.prayer_entries for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "Admins manage their assigned members' prayer_entries"
  on public.prayer_entries for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = prayer_entries.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = prayer_entries.member_id
        and admin_members.admin_id = auth.uid()
    )
  );
