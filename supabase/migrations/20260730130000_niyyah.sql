-- Niyyah: a committed vow to recite a set count of dhikr/swalath, often
-- dedicated to someone deceased, logged over time until the target is
-- reached. Structurally closest to Charity: a parent record per vow
-- (niyyahs, analogous to charity_offers) with an append-only log of
-- entries against it (niyyah_logs, analogous to charity_payments).
-- current_count/status are maintained by trigger from the log, same
-- pattern as the other trackers.

create table public.niyyahs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  intention text,
  target_count int not null check (target_count > 0),
  current_count int not null default 0 check (current_count >= 0),
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.niyyah_logs (
  id uuid primary key default gen_random_uuid(),
  niyyah_id uuid not null references public.niyyahs (id) on delete cascade,
  count int not null check (count > 0),
  logged_by uuid not null references public.profiles (id),
  logged_at timestamptz not null default now()
);

create function public.apply_niyyah_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.niyyahs
  set current_count = current_count + new.count,
      status = case
        when current_count + new.count >= target_count then 'completed'
        else status
      end,
      updated_at = now()
  where id = new.niyyah_id;
  return new;
end;
$$;

create trigger on_niyyah_log_insert
  after insert on public.niyyah_logs
  for each row execute function public.apply_niyyah_log();

alter table public.niyyahs enable row level security;
alter table public.niyyah_logs enable row level security;

-- niyyahs: same self/assigned-admin shape as charity_offers.
create policy "Master admins manage niyyahs"
  on public.niyyahs for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own niyyahs"
  on public.niyyahs for select
  using (member_id = auth.uid());

create policy "Members insert their own niyyahs"
  on public.niyyahs for insert
  with check (
    member_id = auth.uid()
    and coalesce((select (module_access ->> 'niyyah')::boolean from public.profiles where id = auth.uid()), false)
  );

create policy "Members update their own niyyahs"
  on public.niyyahs for update
  using (member_id = auth.uid())
  with check (
    member_id = auth.uid()
    and coalesce((select (module_access ->> 'niyyah')::boolean from public.profiles where id = auth.uid()), false)
  );

create policy "Admins manage assigned members' niyyahs"
  on public.niyyahs for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = niyyahs.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = niyyahs.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

-- niyyah_logs: permission mirrors the parent niyyah's member_id, an
-- immutable log — only master_admin can fix a mistaken entry.
create policy "Master admins manage niyyah_logs"
  on public.niyyah_logs for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own niyyah_logs"
  on public.niyyah_logs for select
  using (
    exists (
      select 1 from public.niyyahs
      where niyyahs.id = niyyah_logs.niyyah_id
        and niyyahs.member_id = auth.uid()
    )
  );

create policy "Members insert their own niyyah_logs"
  on public.niyyah_logs for insert
  with check (
    exists (
      select 1 from public.niyyahs
      where niyyahs.id = niyyah_logs.niyyah_id
        and niyyahs.member_id = auth.uid()
    )
    and coalesce((select (module_access ->> 'niyyah')::boolean from public.profiles where id = auth.uid()), false)
  );

create policy "Admins view assigned members' niyyah_logs"
  on public.niyyah_logs for select
  using (
    exists (
      select 1 from public.niyyahs
      join public.admin_members on admin_members.member_id = niyyahs.member_id
      where niyyahs.id = niyyah_logs.niyyah_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Admins insert assigned members' niyyah_logs"
  on public.niyyah_logs for insert
  with check (
    exists (
      select 1 from public.niyyahs
      join public.admin_members on admin_members.member_id = niyyahs.member_id
      where niyyahs.id = niyyah_logs.niyyah_id
        and admin_members.admin_id = auth.uid()
    )
  );

create index niyyahs_member_id_idx on public.niyyahs (member_id);
create index niyyah_logs_niyyah_id_idx on public.niyyah_logs (niyyah_id);
