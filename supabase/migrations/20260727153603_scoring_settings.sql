-- Single-row configurable scoring settings. Ibadah entries read these at
-- entry time and store the computed score on the row itself, so changing
-- settings later never retroactively changes past entries or leaderboards.
create table public.scoring_settings (
  id boolean primary key default true constraint single_row check (id),
  on_time_points int not null default 10,
  late_points int not null default 5,
  qala_points int not null default 3,
  missed_points int not null default 0,
  jamaah_bonus_points int not null default 5,
  masjid_bonus_points int not null default 5,
  dhuha_points int not null default 5,
  tahajjud_points int not null default 10,
  witr_points int not null default 5,
  -- Milestone lists: [{"threshold": 33, "points": 5}, ...], threshold ascending.
  dhikr_milestones jsonb not null default '[]'::jsonb,
  swalath_milestones jsonb not null default '[]'::jsonb,
  quran_milestones jsonb not null default '[]'::jsonb,
  -- Points per fasting type, e.g. {"ramadan": 15, "qada": 10, "monday": 8}.
  fasting_points jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

insert into public.scoring_settings (id) values (true);

alter table public.scoring_settings enable row level security;

create policy "Everyone can read scoring settings"
  on public.scoring_settings for select
  using (true);

create policy "Master admins can update scoring settings"
  on public.scoring_settings for update
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');
