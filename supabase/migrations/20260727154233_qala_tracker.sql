-- Qala Tracker: independent of prayer_entries. Outstanding balance is set
-- once per member per prayer (by an Admin or Master Admin), separate from
-- the completed-Qala transaction log, with its own adjustment audit trail
-- for manual overrides. current_balance is maintained by trigger so reads
-- don't need to aggregate the transaction/adjustment history every time.

create table public.qala_balances (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  initial_balance int not null check (initial_balance >= 0),
  current_balance int not null,
  set_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, prayer)
);

create table public.qala_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  completed_at date not null default current_date,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.qala_balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  delta int not null,
  reason text not null,
  adjusted_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create function public.apply_qala_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.qala_balances
  set current_balance = current_balance - 1,
      updated_at = now()
  where member_id = new.member_id and prayer = new.prayer;
  return new;
end;
$$;

create trigger on_qala_transaction_insert
  after insert on public.qala_transactions
  for each row execute function public.apply_qala_transaction();

create function public.apply_qala_adjustment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.qala_balances
  set current_balance = current_balance + new.delta,
      updated_at = now()
  where member_id = new.member_id and prayer = new.prayer;
  return new;
end;
$$;

create trigger on_qala_adjustment_insert
  after insert on public.qala_balance_adjustments
  for each row execute function public.apply_qala_adjustment();

alter table public.qala_balances enable row level security;
alter table public.qala_transactions enable row level security;
alter table public.qala_balance_adjustments enable row level security;

-- qala_balances: members view their own; admins/master_admin set and view.
create policy "Master admins manage qala_balances"
  on public.qala_balances for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own qala_balances"
  on public.qala_balances for select
  using (member_id = auth.uid());

create policy "Admins manage assigned members' qala_balances"
  on public.qala_balances for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_balances.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_balances.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

-- qala_transactions: an immutable log. Members and assigned admins can
-- insert/view; only master_admin can update or delete a mistaken entry.
create policy "Master admins manage qala_transactions"
  on public.qala_transactions for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members log and view their own qala_transactions"
  on public.qala_transactions for select
  using (member_id = auth.uid());

create policy "Members insert their own qala_transactions"
  on public.qala_transactions for insert
  with check (member_id = auth.uid());

create policy "Admins view assigned members' qala_transactions"
  on public.qala_transactions for select
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_transactions.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Admins insert assigned members' qala_transactions"
  on public.qala_transactions for insert
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_transactions.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

-- qala_balance_adjustments: manual overrides, admin/master_admin only to
-- create; visible to the member for transparency.
create policy "Master admins manage qala_balance_adjustments"
  on public.qala_balance_adjustments for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own qala_balance_adjustments"
  on public.qala_balance_adjustments for select
  using (member_id = auth.uid());

create policy "Admins view assigned members' qala_balance_adjustments"
  on public.qala_balance_adjustments for select
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_balance_adjustments.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Admins insert assigned members' qala_balance_adjustments"
  on public.qala_balance_adjustments for insert
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = qala_balance_adjustments.member_id
        and admin_members.admin_id = auth.uid()
    )
  );
