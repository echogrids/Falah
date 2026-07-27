-- Daily Tracking: Dhikr count, Swalath count, Quran reading, Fasting.
-- One row per member per prayer_day. fasting_type is free text (not a
-- fixed enum) so it can be validated against scoring_settings.fasting_points
-- keys at the app layer without a migration every time a fasting type is added.
create table public.daily_trackers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer_day date not null,
  dhikr_count int not null default 0,
  swalath_count int not null default 0,
  quran_pages int not null default 0,
  fasting_type text,
  score int not null default 0,
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, prayer_day)
);

alter table public.daily_trackers enable row level security;

create policy "Master admins have full access to daily_trackers"
  on public.daily_trackers for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members manage their own daily_trackers"
  on public.daily_trackers for all
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "Admins manage their assigned members' daily_trackers"
  on public.daily_trackers for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = daily_trackers.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = daily_trackers.member_id
        and admin_members.admin_id = auth.uid()
    )
  );
