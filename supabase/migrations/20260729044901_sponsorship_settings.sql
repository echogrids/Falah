-- Single-row configurable Zad settings. The price per meal is common
-- across all members, so it's set once here instead of being re-entered
-- on every logged transaction (mirrors scoring_settings' singleton shape).
create table public.sponsorship_settings (
  id boolean primary key default true constraint single_row check (id),
  unit_price numeric not null default 0,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

insert into public.sponsorship_settings (id) values (true);

alter table public.sponsorship_settings enable row level security;

create policy "Everyone can read sponsorship settings"
  on public.sponsorship_settings for select
  using (true);

create policy "Master admins can update sponsorship settings"
  on public.sponsorship_settings for update
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');
